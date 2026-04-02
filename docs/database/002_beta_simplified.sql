-- ============================================================================
-- ContratoSeguro - Schema Simplificado para Beta
-- ============================================================================
-- Versão:      002
-- Data:        2026-03-29
-- Descrição:   Schema mínimo para beta com amigos. Sem auth, sem RLS.
--              Dados de análise e correção em JSONB na própria tabela contracts.
--              Quando migrar para produção, usar 001_initial_schema.sql.
-- Banco:       Supabase (PostgreSQL 15+)
-- ============================================================================

-- Extensão para gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. TABELA: contracts (tudo-em-um para beta)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    original_text           TEXT,
    original_filename       TEXT,
    file_size_bytes         INT,
    page_count              INT,
    contract_type           TEXT,
    status                  TEXT NOT NULL DEFAULT 'uploaded'
                                CHECK (status IN (
                                    'uploaded', 'classifying', 'classified',
                                    'analyzing', 'analyzed',
                                    'correcting', 'corrected', 'error'
                                )),
    analysis_result         JSONB,
    classification_result   JSONB,
    correction_result       JSONB,
    error_message           TEXT,
    expires_at              TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices essenciais
CREATE INDEX IF NOT EXISTS idx_contracts_status     ON public.contracts(status);
CREATE INDEX IF NOT EXISTS idx_contracts_expires_at ON public.contracts(expires_at);
CREATE INDEX IF NOT EXISTS idx_contracts_created_at ON public.contracts(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_contracts_updated_at ON public.contracts;
CREATE TRIGGER trg_contracts_updated_at
    BEFORE UPDATE ON public.contracts
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 2. FUNÇÃO: cleanup de contratos expirados (7 dias)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_contracts()
RETURNS INT AS $$
DECLARE
    expired_count INT;
BEGIN
    DELETE FROM public.contracts WHERE expires_at < NOW();
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. RLS DESABILITADO (beta anônimo)
-- ============================================================================
-- Na beta, o backend (service_role) faz tudo. Sem login de usuário.
-- Quando migrar para produção, habilitar RLS conforme 001_initial_schema.sql.
ALTER TABLE public.contracts DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- FIM DA MIGRAÇÃO 002 (BETA)
-- ============================================================================
-- Para aplicar:
--   1. Abrir o SQL Editor no Supabase Dashboard
--   2. Colar este arquivo inteiro e executar
--   3. Copiar as chaves do Supabase para .env.local
-- ============================================================================
