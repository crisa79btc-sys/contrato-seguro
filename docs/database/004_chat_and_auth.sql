-- ============================================================================
-- ContratoSeguro - Migração 004
-- ============================================================================
-- Versão:      004
-- Data:        2026-04-13
-- Descrição:   Chat com o contrato + suporte a biblioteca pessoal.
--              Adiciona tabela chat_messages (histórico multi-turn por contrato)
--              e função claim_anonymous_contracts (vincula contratos anônimos
--              à conta do usuário após login).
-- Banco:       Supabase (PostgreSQL 15+)
-- Aplicar:     SQL Editor do Supabase — executar este arquivo inteiro de uma vez.
-- Pré-req:     Migração 001 aplicada (tabelas contracts, audit_logs, RLS base).
-- ============================================================================

-- ============================================================================
-- 1. TABELA: chat_messages
-- ============================================================================
-- Armazena o histórico de perguntas (role='user') e respostas (role='assistant')
-- do chat com o contrato. Apagada em cascata quando o contrato expira (7 dias).
-- Contratos anônimos (user_id IS NULL) são gerenciados pelo backend via
-- service_role; contratos autenticados têm acesso via RLS abaixo.
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id         UUID NOT NULL REFERENCES public.contracts(id) ON DELETE CASCADE,
    role                TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content             TEXT NOT NULL,
    tokens_input        INT,
    tokens_output       INT,
    cached_tokens       INT DEFAULT 0,
    estimated_cost_usd  NUMERIC(10,6) DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índice composto para buscar histórico ordenado por data (padrão de uso)
CREATE INDEX IF NOT EXISTS idx_chat_messages_contract_id_created
    ON public.chat_messages(contract_id, created_at ASC);

-- Índice para contagem de perguntas por contrato (verificação de limite)
CREATE INDEX IF NOT EXISTS idx_chat_messages_contract_role
    ON public.chat_messages(contract_id, role);

COMMENT ON TABLE public.chat_messages IS
    'Histórico de perguntas/respostas do chat com o contrato. Apagado em cascata quando o contrato expira (7 dias).';
COMMENT ON COLUMN public.chat_messages.role IS
    'user = pergunta do usuário, assistant = resposta da IA';
COMMENT ON COLUMN public.chat_messages.cached_tokens IS
    'Tokens lidos do cache da Anthropic (cache_read_input_tokens). Reduz custo ~90% nas chamadas subsequentes.';

-- ============================================================================
-- 2. ROW LEVEL SECURITY — chat_messages
-- ============================================================================
-- Usuário autenticado vê mensagens apenas dos SEUS contratos.
-- Contratos anônimos (user_id IS NULL) são acessíveis somente via service_role
-- (backend/API routes) — nunca expostos diretamente ao client browser.
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_own"
    ON public.chat_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contracts c
            WHERE c.id = contract_id
              AND c.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. FUNÇÃO: claim_anonymous_contracts
-- ============================================================================
-- Vincula contratos anônimos (user_id IS NULL) à conta do usuário autenticado.
-- Chamada pela rota POST /api/claim-contracts após o usuário fazer login.
-- Segurança: só vincula contratos com user_id NULL (nunca rouba de outro usuário).
-- Registra no audit_log para conformidade LGPD.
CREATE OR REPLACE FUNCTION public.claim_anonymous_contracts(
    p_contract_ids UUID[]
)
RETURNS INT AS $$
DECLARE
    claimed_count INT;
BEGIN
    -- Garantir que o chamador está autenticado
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Autenticação necessária para reivindicar contratos';
    END IF;

    -- Vincular apenas contratos ainda anônimos (user_id IS NULL)
    -- Nunca sobrescreve user_id de outro usuário
    UPDATE public.contracts
    SET user_id = auth.uid()
    WHERE id = ANY(p_contract_ids)
      AND user_id IS NULL;

    GET DIAGNOSTICS claimed_count = ROW_COUNT;

    -- Registrar no audit_log para LGPD
    IF claimed_count > 0 THEN
        INSERT INTO public.audit_logs (user_id, action, resource_type, metadata)
        VALUES (
            auth.uid(),
            'claim_anonymous',
            'contract',
            jsonb_build_object(
                'claimed_count', claimed_count,
                'contract_ids',  p_contract_ids,
                'claimed_at',    NOW()
            )
        );
    END IF;

    RETURN claimed_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.claim_anonymous_contracts IS
    'Vincula contratos anônimos (user_id IS NULL) à conta do usuário autenticado. '
    'Chamada após login quando usuário tem histórico local no localStorage. '
    'Só vincula contratos sem dono — nunca permite roubo de contratos alheios.';

-- ============================================================================
-- 4. VERIFICAÇÃO
-- ============================================================================
-- Para confirmar que a migração foi aplicada corretamente, execute:
--   SELECT * FROM public.chat_messages LIMIT 0;
--   SELECT proname FROM pg_proc WHERE proname = 'claim_anonymous_contracts';
-- ============================================================================
-- FIM DA MIGRAÇÃO 004
-- ============================================================================
