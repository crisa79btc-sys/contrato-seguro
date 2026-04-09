-- Migration 003: Bucket de storage para imagens de posts sociais
-- Executar no Supabase SQL Editor (https://supabase.com/dashboard/project/wdsfemqjwgdfrqedvqyh/sql)

-- Criar bucket público para imagens dos posts sociais
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'social-images',
  'social-images',
  true,
  5242880, -- 5MB
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Política: qualquer um pode LER (público, Meta precisa acessar)
CREATE POLICY IF NOT EXISTS "Social images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'social-images');

-- Política: service role pode fazer upload (apenas backend)
CREATE POLICY IF NOT EXISTS "Service role can upload social images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'social-images');

-- Política: service role pode atualizar (upsert)
CREATE POLICY IF NOT EXISTS "Service role can update social images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'social-images');

-- Política: service role pode deletar (limpeza)
CREATE POLICY IF NOT EXISTS "Service role can delete social images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'social-images');
