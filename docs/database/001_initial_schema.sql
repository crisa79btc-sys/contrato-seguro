-- ============================================================================
-- ContratoSeguro - Migração Inicial do Banco de Dados
-- ============================================================================
-- Versão:      001
-- Data:        2026-03-28
-- Descrição:   Criação completa do schema inicial para a plataforma
--              ContratoSeguro — SaaS de análise e correção de contratos com IA.
-- Banco:       Supabase (PostgreSQL 15+)
-- Auth:        Supabase Auth (auth.users)
-- Requisitos:  extensão pgcrypto habilitada (padrão no Supabase)
-- ============================================================================

-- ============================================================================
-- 0. EXTENSÕES
-- ============================================================================
-- pgcrypto já vem habilitada no Supabase; garante gen_random_uuid().
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. FUNÇÃO UTILITÁRIA: atualizar updated_at automaticamente
-- ============================================================================
-- Trigger genérico reutilizado em todas as tabelas que possuem updated_at.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABELA: users
-- ============================================================================
-- Estende auth.users do Supabase com dados de perfil e plano.
-- O id é o mesmo UUID do Supabase Auth; nunca criamos usuários aqui
-- diretamente — a inserção é feita via trigger no auth.users ou pela app.
CREATE TABLE public.users (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email       TEXT NOT NULL,
    full_name   TEXT,
    avatar_url  TEXT,
    plan        TEXT NOT NULL DEFAULT 'free'
                    CHECK (plan IN ('free', 'pro', 'enterprise')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.users           IS 'Perfil do usuário — estende auth.users do Supabase';
COMMENT ON COLUMN public.users.plan      IS 'Plano do usuário: free (beta), pro ou enterprise';

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. TABELA: contracts
-- ============================================================================
-- Contrato enviado pelo usuário para análise.
-- user_id é nullable porque na fase beta o upload pode ser anônimo.
-- original_text armazena o texto extraído; a criptografia é feita na camada
-- da aplicação (AES-256) antes de gravar aqui.
-- Contratos expiram em 7 dias — uma função de cleanup apaga os expirados.
CREATE TABLE public.contracts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID REFERENCES public.users(id) ON DELETE SET NULL,
    original_file_url   TEXT,
    original_text       TEXT,
    original_filename   TEXT,
    contract_type       TEXT
                            CHECK (contract_type IN (
                                'aluguel', 'trabalho', 'servico',
                                'compra_venda', 'financiamento', 'digital', 'outro'
                            )),
    file_format         TEXT
                            CHECK (file_format IN ('pdf', 'docx')),
    status              TEXT NOT NULL DEFAULT 'uploaded'
                            CHECK (status IN (
                                'uploaded', 'classifying', 'classified',
                                'analyzing', 'analyzed',
                                'correcting', 'corrected', 'error'
                            )),
    file_size_bytes     INT,
    page_count          INT,
    error_message       TEXT,
    progress            INT DEFAULT 0,
    current_step        TEXT,
    expires_at          TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.contracts                   IS 'Contratos enviados pelos usuários para análise';
COMMENT ON COLUMN public.contracts.original_text     IS 'Texto extraído do contrato — criptografado (AES-256) na camada da aplicação';
COMMENT ON COLUMN public.contracts.status            IS 'Ciclo de vida: uploaded → classifying → classified → analyzing → analyzed → correcting → corrected (ou error)';
COMMENT ON COLUMN public.contracts.expires_at        IS 'Contrato expira em 7 dias; removido automaticamente pela função de cleanup';

CREATE INDEX idx_contracts_user_id    ON public.contracts(user_id);
CREATE INDEX idx_contracts_status     ON public.contracts(status);
CREATE INDEX idx_contracts_expires_at ON public.contracts(expires_at);
CREATE INDEX idx_contracts_created_at ON public.contracts(created_at DESC);

CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 4. TABELA: analyses
-- ============================================================================
-- Resultado consolidado da análise de IA sobre um contrato.
-- Relação 1:1 com contracts (UNIQUE em contract_id).
CREATE TABLE public.analyses (
    id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id                 UUID NOT NULL UNIQUE REFERENCES public.contracts(id) ON DELETE CASCADE,
    risk_score                  INT CHECK (risk_score >= 0 AND risk_score <= 100),
    global_score_interpretation TEXT,
    summary                     TEXT,
    applicable_laws             TEXT[],
    is_consumer_relation        BOOLEAN DEFAULT false,
    parties                     JSONB,
    missing_clauses             JSONB,
    tier                        TEXT NOT NULL DEFAULT 'free'
                                    CHECK (tier IN ('free', 'full')),
    total_clauses_analyzed      INT,
    problematic_clauses_count   INT,
    ai_model_used               TEXT,
    ai_tokens_input             INT,
    ai_tokens_output            INT,
    processing_time_ms          INT,
    estimated_cost_usd          NUMERIC(10,6) DEFAULT 0,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.analyses            IS 'Resultado consolidado da análise de IA sobre um contrato';
COMMENT ON COLUMN public.analyses.risk_score IS 'Score de risco de 0 (seguro) a 100 (muito arriscado)';
COMMENT ON COLUMN public.analyses.tier       IS 'free = análise prévia gratuita; full = análise completa (futura cobrança)';

CREATE INDEX idx_analyses_contract_id ON public.analyses(contract_id);

-- ============================================================================
-- 5. TABELA: clause_analyses
-- ============================================================================
-- Análise detalhada de cada cláusula individual do contrato.
-- category é um array de TEXT pois uma cláusula pode ter múltiplos problemas.
CREATE TABLE public.clause_analyses (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    analysis_id             UUID NOT NULL REFERENCES public.analyses(id) ON DELETE CASCADE,
    clause_id               TEXT NOT NULL,
    order_index             INT,
    original_text_summary   TEXT,
    risk_level              TEXT NOT NULL
                                CHECK (risk_level IN ('critical', 'high', 'medium', 'low', 'ok')),
    category                TEXT[] DEFAULT '{}'
                                CHECK (
                                    category <@ ARRAY[
                                        'abusiva', 'desequilibrada', 'ambigua',
                                        'incompleta', 'desatualizada', 'ok'
                                    ]::TEXT[]
                                ),
    explanation             TEXT,
    legal_basis             TEXT,
    suggestion              TEXT,
    criteria_scores         JSONB,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.clause_analyses                        IS 'Análise individual de cada cláusula do contrato';
COMMENT ON COLUMN public.clause_analyses.risk_level             IS 'Nível de risco: critical > high > medium > low > ok';
COMMENT ON COLUMN public.clause_analyses.category               IS 'Categorias de problema — array, pois uma cláusula pode ter múltiplos';
COMMENT ON COLUMN public.clause_analyses.legal_basis            IS 'Base legal (artigo/lei) que fundamenta o alerta';
COMMENT ON COLUMN public.clause_analyses.suggestion             IS 'Sugestão de texto alternativo para a cláusula';
COMMENT ON COLUMN public.clause_analyses.original_text_summary  IS 'Resumo ou trecho do texto original da cláusula';

CREATE INDEX idx_clause_analyses_analysis_id ON public.clause_analyses(analysis_id);
CREATE INDEX idx_clause_analyses_risk_level  ON public.clause_analyses(risk_level);

-- ============================================================================
-- 6. TABELA: corrected_contracts
-- ============================================================================
-- Contrato corrigido pela IA, pronto para download.
-- Na beta é gratuito; futuramente o download será cobrado.
CREATE TABLE public.corrected_contracts (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id         UUID NOT NULL UNIQUE REFERENCES public.contracts(id) ON DELETE CASCADE,
    analysis_id         UUID REFERENCES public.analyses(id),
    corrected_text      TEXT,
    changes_summary     TEXT,
    changes             JSONB,
    docx_file_url       TEXT,
    pdf_file_url        TEXT,
    diff_html           TEXT,
    negotiation_script  TEXT,
    ai_model_used       TEXT,
    ai_tokens_input     INT,
    ai_tokens_output    INT,
    processing_time_ms  INT,
    estimated_cost_usd  NUMERIC(10,6) DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.corrected_contracts                    IS 'Contrato corrigido pela IA — download futuro será cobrado';
COMMENT ON COLUMN public.corrected_contracts.corrected_text     IS 'Texto corrigido — criptografado (AES-256) na camada da aplicação';
COMMENT ON COLUMN public.corrected_contracts.diff_html          IS 'HTML com diff visual entre original e corrigido';
COMMENT ON COLUMN public.corrected_contracts.negotiation_script IS 'Roteiro de negociação gerado pela IA para o usuário';

CREATE INDEX idx_corrected_contracts_contract_id ON public.corrected_contracts(contract_id);

-- ============================================================================
-- 7. TABELA: payments
-- ============================================================================
-- Pagamentos — estrutura pronta mas inativa na fase beta.
-- Só será utilizada quando BILLING_ENABLED = true na app_config.
CREATE TABLE public.payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    contract_id         UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
    product             TEXT NOT NULL
                            CHECK (product IN (
                                'full_analysis', 'corrected_contract',
                                'complete_package', 'template'
                            )),
    amount_cents        INT NOT NULL CHECK (amount_cents >= 0),
    currency            TEXT NOT NULL DEFAULT 'BRL',
    status              TEXT NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    payment_provider    TEXT
                            CHECK (payment_provider IN ('mercado_pago', 'stripe')),
    provider_payment_id TEXT,
    payment_url         TEXT,
    paid_at             TIMESTAMPTZ,
    metadata            JSONB,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.payments         IS 'Pagamentos — inativo na beta (BILLING_ENABLED = false)';
COMMENT ON COLUMN public.payments.product IS 'Produto adquirido: análise completa, contrato corrigido, pacote ou template';

CREATE INDEX idx_payments_user_id     ON public.payments(user_id);
CREATE INDEX idx_payments_contract_id ON public.payments(contract_id);
CREATE INDEX idx_payments_status      ON public.payments(status);

CREATE TRIGGER trg_payments_updated_at
    BEFORE UPDATE ON public.payments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 8. TABELA: contract_templates
-- ============================================================================
-- Biblioteca de modelos de contrato (funcionalidade futura).
CREATE TABLE public.contract_templates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_type   TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT,
    price_cents     INT NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
    preview_text    TEXT,
    file_url        TEXT,
    file_format     TEXT,
    download_count  INT DEFAULT 0,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    is_premium      BOOLEAN DEFAULT false,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.contract_templates IS 'Biblioteca de modelos de contrato prontos (funcionalidade futura)';

CREATE INDEX idx_contract_templates_type      ON public.contract_templates(contract_type);
CREATE INDEX idx_contract_templates_is_active ON public.contract_templates(is_active) WHERE is_active = TRUE;

CREATE TRIGGER trg_contract_templates_updated_at
    BEFORE UPDATE ON public.contract_templates
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 9. TABELA: audit_logs
-- ============================================================================
-- Logs de auditoria para conformidade com a LGPD.
-- Registra todas as ações relevantes sobre dados pessoais e contratos.
-- user_id é nullable pois ações anônimas (beta) também devem ser logadas.
CREATE TABLE public.audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action          TEXT NOT NULL,
    resource_type   TEXT NOT NULL,
    resource_id     UUID,
    ip_address      INET,
    user_agent      TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.audit_logs             IS 'Logs de auditoria — conformidade LGPD';
COMMENT ON COLUMN public.audit_logs.action      IS 'Ação executada: create, read, update, delete, download, export, etc.';
COMMENT ON COLUMN public.audit_logs.resource_type IS 'Tipo do recurso: contract, analysis, corrected_contract, user, etc.';
COMMENT ON COLUMN public.audit_logs.metadata    IS 'Dados adicionais em JSON (ex: campos alterados, user-agent)';

CREATE INDEX idx_audit_logs_user_id       ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource      ON public.audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action        ON public.audit_logs(action);
CREATE INDEX idx_audit_logs_created_at    ON public.audit_logs(created_at DESC);

-- ============================================================================
-- 10. TABELA: app_config
-- ============================================================================
-- Configurações globais da aplicação e feature flags.
-- Chave-valor com JSONB para flexibilidade.
CREATE TABLE public.app_config (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    description TEXT,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.app_config IS 'Configurações globais e feature flags da aplicação';

CREATE TRIGGER trg_app_config_updated_at
    BEFORE UPDATE ON public.app_config
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Habilitamos RLS em TODAS as tabelas.
-- As políticas garantem que cada usuário só acessa seus próprios dados.
-- O service_role do Supabase ignora RLS (usado pelo backend/Edge Functions).

ALTER TABLE public.users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analyses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clause_analyses      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corrected_contracts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_templates   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config           ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- users: usuário vê e edita apenas seu próprio perfil
-- ---------------------------------------------------------------------------
CREATE POLICY "users_select_own"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "users_insert_own"
    ON public.users FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_own"
    ON public.users FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------------
-- contracts: usuário vê/cria/edita apenas seus contratos
-- Contratos anônimos (user_id IS NULL) não são acessíveis via RLS pelo client;
-- o backend (service_role) gerencia esses casos.
-- ---------------------------------------------------------------------------
CREATE POLICY "contracts_select_own"
    ON public.contracts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "contracts_insert_own"
    ON public.contracts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contracts_update_own"
    ON public.contracts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contracts_delete_own"
    ON public.contracts FOR DELETE
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- analyses: acesso via contrato do usuário
-- ---------------------------------------------------------------------------
CREATE POLICY "analyses_select_own"
    ON public.analyses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contracts c
            WHERE c.id = contract_id AND c.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- clause_analyses: acesso via análise → contrato do usuário
-- ---------------------------------------------------------------------------
CREATE POLICY "clause_analyses_select_own"
    ON public.clause_analyses FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.analyses a
            JOIN public.contracts c ON c.id = a.contract_id
            WHERE a.id = analysis_id AND c.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- corrected_contracts: acesso via contrato do usuário
-- ---------------------------------------------------------------------------
CREATE POLICY "corrected_contracts_select_own"
    ON public.corrected_contracts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.contracts c
            WHERE c.id = contract_id AND c.user_id = auth.uid()
        )
    );

-- ---------------------------------------------------------------------------
-- payments: usuário vê apenas seus pagamentos
-- ---------------------------------------------------------------------------
CREATE POLICY "payments_select_own"
    ON public.payments FOR SELECT
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- contract_templates: qualquer usuário autenticado pode ler templates ativos
-- ---------------------------------------------------------------------------
CREATE POLICY "templates_select_active"
    ON public.contract_templates FOR SELECT
    USING (is_active = TRUE);

-- ---------------------------------------------------------------------------
-- audit_logs: usuário vê apenas seus próprios logs
-- (admin acessa via service_role que ignora RLS)
-- ---------------------------------------------------------------------------
CREATE POLICY "audit_logs_select_own"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- app_config: leitura pública (configs não são secretas), escrita pelo backend
-- ---------------------------------------------------------------------------
CREATE POLICY "app_config_select_all"
    ON public.app_config FOR SELECT
    USING (TRUE);

-- ============================================================================
-- 12. FUNÇÃO: criar perfil automaticamente ao registrar via Supabase Auth
-- ============================================================================
-- Quando um novo usuário se registra, cria automaticamente uma linha em
-- public.users com os dados básicos.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name', ''),
        NEW.raw_user_meta_data ->> 'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger no schema auth (padrão Supabase para auto-criar perfil)
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 13. FUNÇÃO: cleanup de contratos expirados
-- ============================================================================
-- Remove contratos cujo expires_at já passou, junto com todos os dados
-- associados (análises, cláusulas, correções) via ON DELETE CASCADE.
-- Antes de apagar, registra nos audit_logs para conformidade LGPD.
--
-- Esta função deve ser chamada periodicamente:
--   - Via pg_cron (se habilitado): SELECT cron.schedule('cleanup-expired', '0 3 * * *', $$SELECT public.cleanup_expired_contracts()$$);
--   - Via Supabase Edge Function com cron externo
--   - Via chamada manual: SELECT public.cleanup_expired_contracts();
CREATE OR REPLACE FUNCTION public.cleanup_expired_contracts()
RETURNS INT AS $$
DECLARE
    expired_count INT;
    expired_record RECORD;
BEGIN
    -- Registra cada contrato expirado no audit_log antes de deletar
    FOR expired_record IN
        SELECT id, user_id FROM public.contracts
        WHERE expires_at < NOW()
    LOOP
        INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
        VALUES (
            expired_record.user_id,
            'auto_delete_expired',
            'contract',
            expired_record.id,
            jsonb_build_object('reason', 'contract_expired', 'deleted_at', NOW())
        );
    END LOOP;

    -- Deleta os contratos expirados (CASCADE cuida das tabelas filhas)
    DELETE FROM public.contracts WHERE expires_at < NOW();

    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.cleanup_expired_contracts()
    IS 'Remove contratos expirados (7 dias) e registra no audit_log. Chamar via pg_cron ou Edge Function.';

-- ============================================================================
-- 14. FUNÇÃO AUXILIAR: registrar ação no audit_log
-- ============================================================================
-- Função utilitária para a aplicação registrar ações facilmente.
CREATE OR REPLACE FUNCTION public.log_audit(
    p_user_id       UUID,
    p_action        TEXT,
    p_resource_type TEXT,
    p_resource_id   UUID DEFAULT NULL,
    p_ip_address    INET DEFAULT NULL,
    p_metadata      JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    log_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, ip_address, metadata)
    VALUES (p_user_id, p_action, p_resource_type, p_resource_id, p_ip_address, p_metadata)
    RETURNING id INTO log_id;

    RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 15. DADOS INICIAIS: configurações da aplicação
-- ============================================================================
INSERT INTO public.app_config (key, value) VALUES
    -- Cobrança desabilitada na beta
    ('BILLING_ENABLED',         'false'::JSONB),

    -- Limite de análises gratuitas por usuário (0 = ilimitado na beta)
    ('FREE_ANALYSES_LIMIT',     '0'::JSONB),

    -- Limite de correções gratuitas por usuário (0 = ilimitado na beta)
    ('FREE_CORRECTIONS_LIMIT',  '0'::JSONB),

    -- Tamanho máximo de arquivo em bytes (10 MB)
    ('MAX_FILE_SIZE_BYTES',     '10485760'::JSONB),

    -- Dias até expiração do contrato
    ('CONTRACT_EXPIRY_DAYS',    '7'::JSONB),

    -- Modelo de IA padrão para análises
    ('DEFAULT_AI_MODEL',        '"claude-haiku-4-5-20251001"'::JSONB),

    -- Feature flag: biblioteca de templates habilitada
    ('TEMPLATES_ENABLED',       'false'::JSONB),

    -- Feature flag: upload anônimo (sem login) habilitado
    ('ANONYMOUS_UPLOAD_ENABLED','true'::JSONB),

    -- Preços em centavos (preparados para quando cobrança ativar)
    ('PRICES', '{
        "full_analysis": 990,
        "corrected_contract": 1990,
        "complete_package": 2490,
        "currency": "BRL"
    }'::JSONB),

    -- Versão do schema do banco
    ('SCHEMA_VERSION',          '"001"'::JSONB)
ON CONFLICT (key) DO NOTHING;

-- ============================================================================
-- 16. STORAGE BUCKETS (Supabase Storage)
-- ============================================================================
-- Criar buckets para armazenamento de arquivos.
-- Nota: no Supabase, buckets são criados via API ou Dashboard.
-- Os comandos abaixo funcionam se executados via SQL Editor do Supabase.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
    (
        'contracts',
        'contracts',
        FALSE,  -- bucket privado
        10485760,  -- 10 MB
        ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'corrected-contracts',
        'corrected-contracts',
        FALSE,  -- bucket privado
        10485760,  -- 10 MB
        ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    ),
    (
        'templates',
        'templates',
        FALSE,  -- bucket privado
        10485760,  -- 10 MB
        ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    )
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage: usuário autenticado pode fazer upload/download dos seus contratos
CREATE POLICY "storage_contracts_insert"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'contracts'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "storage_contracts_select"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'contracts'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "storage_contracts_delete"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'contracts'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

CREATE POLICY "storage_corrected_select"
    ON storage.objects FOR SELECT
    USING (
        bucket_id = 'corrected-contracts'
        AND auth.role() = 'authenticated'
        AND (storage.foldername(name))[1] = auth.uid()::TEXT
    );

-- ============================================================================
-- FIM DA MIGRAÇÃO 001
-- ============================================================================
-- Próximos passos:
--   1. Executar este arquivo no SQL Editor do Supabase
--   2. Configurar pg_cron para cleanup (se disponível no seu plano):
--      SELECT cron.schedule('cleanup-expired-contracts', '0 3 * * *', $$SELECT public.cleanup_expired_contracts()$$);
--   3. Ou configurar uma Edge Function / cron externo que chame a função diariamente
-- ============================================================================
