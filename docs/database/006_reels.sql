-- ============================================================================
-- 006 — Canal de Reels (pipeline de vídeos curtos automatizados)
-- ============================================================================
-- Usuário grava no iPhone 16 → upload em /admin/reels/upload → IA transcreve,
-- corta, formata 9:16 com legendas, gera thumbnail, e posta automaticamente
-- em IG Reels + FB Reels + YouTube Shorts conforme agenda (ter/sex 19h BRT).
--
-- Tabelas:
--   - reels_queue: cada vídeo ingerido, seu estado no pipeline, copy e agendamento
--   - reels_posts: o post criado em cada plataforma + métricas
--
-- Buckets Storage:
--   - reels-raw (privado): vídeo original do iPhone
--   - reels-ready (público): vídeo processado + thumbnail (URLs precisam ser
--     públicas para Meta/YouTube puxarem)
--
-- Como aplicar: SQL Editor do Supabase
--   https://supabase.com/dashboard/project/wdsfemqjwgdfrqedvqyh/sql/new
-- ============================================================================

-- 1. Enum de status do reel
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reel_status') THEN
        CREATE TYPE reel_status AS ENUM (
            'uploaded',       -- vídeo bruto no Storage, aguarda pipeline
            'transcribing',   -- Whisper em execução
            'processing',     -- FFmpeg em execução (corte, legendas, trilha)
            'ready',          -- vídeo pronto, aguardando aprovação manual
            'scheduled',      -- aprovado, aguardando horário
            'posting',        -- cron publicando
            'posted',         -- publicado em todas as plataformas
            'failed'          -- algum erro não-recuperável
        );
    END IF;
END$$;

-- 2. Fila de reels
CREATE TABLE IF NOT EXISTS public.reels_queue (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Storage paths (dentro dos buckets reels-raw / reels-ready)
    raw_storage_path    TEXT NOT NULL,
    ready_storage_path  TEXT,
    thumbnail_path      TEXT,

    -- Metadados do vídeo
    duration_seconds    INT,
    raw_size_bytes      BIGINT,

    -- Contexto opcional dado pelo usuário no upload
    user_context        TEXT,

    -- Saída da transcrição + análise
    transcription       TEXT,
    title               TEXT,
    description         TEXT,
    hashtags_instagram  TEXT[],
    hashtags_youtube    TEXT[],
    hook                TEXT,
    thumbnail_text      TEXT,

    -- Estado e agendamento
    status              reel_status NOT NULL DEFAULT 'uploaded',
    scheduled_for       TIMESTAMPTZ,
    error_message       TEXT,

    -- Métricas agregadas
    tokens_input        INT DEFAULT 0,
    tokens_output       INT DEFAULT 0,
    processing_cost_usd NUMERIC(10,6) DEFAULT 0,

    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reels_queue_status_scheduled
    ON public.reels_queue(status, scheduled_for);

CREATE INDEX IF NOT EXISTS idx_reels_queue_created
    ON public.reels_queue(created_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_reels_queue_updated_at ON public.reels_queue;
CREATE TRIGGER trg_reels_queue_updated_at
    BEFORE UPDATE ON public.reels_queue
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.reels_queue IS
    'Fila de Reels: do upload cru até a publicação. Cada linha = um vídeo.';

-- 3. Posts em cada plataforma
CREATE TABLE IF NOT EXISTS public.reels_posts (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reel_id           UUID NOT NULL REFERENCES public.reels_queue(id) ON DELETE CASCADE,
    platform          TEXT NOT NULL CHECK (platform IN ('instagram', 'facebook', 'youtube')),
    platform_post_id  TEXT,
    platform_url      TEXT,
    posted_at         TIMESTAMPTZ,
    views             INT DEFAULT 0,
    likes             INT DEFAULT 0,
    comments          INT DEFAULT 0,
    shares            INT DEFAULT 0,
    last_metrics_at   TIMESTAMPTZ,
    error_message     TEXT,
    UNIQUE(reel_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_reels_posts_reel
    ON public.reels_posts(reel_id);

CREATE INDEX IF NOT EXISTS idx_reels_posts_platform_posted
    ON public.reels_posts(platform, posted_at DESC);

COMMENT ON TABLE public.reels_posts IS
    'Registro de cada post em cada plataforma + métricas atualizadas periodicamente.';

-- 4. RLS: apenas service_role (backend). Nenhuma policy para cliente.
ALTER TABLE public.reels_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reels_posts ENABLE ROW LEVEL SECURITY;

-- 5. Buckets Storage
-- NOTA: storage.buckets não aceita IF NOT EXISTS em UPSERT, use ON CONFLICT
INSERT INTO storage.buckets (id, name, public)
VALUES
    ('reels-raw', 'reels-raw', false),
    ('reels-ready', 'reels-ready', true)
ON CONFLICT (id) DO NOTHING;

-- Policies do bucket reels-ready (público read, service_role write)
-- As policies do Storage são criadas via Dashboard (Storage → Policies) OU via SQL:
--
-- CREATE POLICY "reels-ready public read" ON storage.objects
--     FOR SELECT USING (bucket_id = 'reels-ready');
-- CREATE POLICY "reels-ready service write" ON storage.objects
--     FOR ALL USING (bucket_id = 'reels-ready' AND auth.role() = 'service_role');
