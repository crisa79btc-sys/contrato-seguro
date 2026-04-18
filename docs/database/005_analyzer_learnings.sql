-- ============================================================================
-- 005 — IA aprende com perguntas do chat
-- ============================================================================
-- Cria tabela analyzer_learnings: padrões de dúvida detectados nas perguntas
-- do chat que o analyzer (src/lib/ai/analyzer.ts) deveria ter capturado de cara.
--
-- Fluxo:
--   1. Cron semanal /api/cron/learn agrega chat_messages dos últimos 7 dias
--      por contract_type e pede ao Claude Haiku para extrair padrões.
--   2. Padrões entram como status='pending' na tabela.
--   3. Admin aprova/rejeita em /admin/learnings.
--   4. analyzer.ts injeta no system prompt os padrões com status='approved'
--      do mesmo contract_type, em uma seção "PADRÕES APRENDIDOS".
--
-- Como aplicar: rodar no SQL Editor do Supabase
--   https://supabase.com/dashboard/project/wdsfemqjwgdfrqedvqyh/sql/new
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.analyzer_learnings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_type   TEXT NOT NULL,
    pattern         TEXT NOT NULL,
    source_sample   JSONB,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at     TIMESTAMPTZ,
    reviewed_by     UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analyzer_learnings_type_status
    ON public.analyzer_learnings(contract_type, status);

CREATE INDEX IF NOT EXISTS idx_analyzer_learnings_pending
    ON public.analyzer_learnings(created_at DESC)
    WHERE status = 'pending';

COMMENT ON TABLE public.analyzer_learnings IS
    'Padrões aprendidos das perguntas do chat. Cron semanal popula com status=pending; admin aprova; analyzer.ts injeta aprovados no prompt.';

COMMENT ON COLUMN public.analyzer_learnings.contract_type IS
    'Tipo do contrato (aluguel, trabalho, servico, compra_venda, financiamento, digital, outro).';

COMMENT ON COLUMN public.analyzer_learnings.pattern IS
    'Texto livre descrevendo o padrão. Ex: "Em contratos de locação, verifique se há multa por rescisão antecipada proporcional ao tempo restante (art. 4º Lei 8.245/91)".';

COMMENT ON COLUMN public.analyzer_learnings.source_sample IS
    'JSONB com 3-5 exemplos de perguntas que geraram o padrão.';

-- RLS: apenas service_role acessa. Nenhuma policy para client.
ALTER TABLE public.analyzer_learnings ENABLE ROW LEVEL SECURITY;
