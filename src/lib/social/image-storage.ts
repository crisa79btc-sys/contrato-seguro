/**
 * Upload de imagens para Supabase Storage.
 * Usado para armazenar imagens geradas pelo Gemini e obter URL pública
 * acessível pelo Instagram e Facebook.
 */

import { getAdminClient } from '@/lib/db/supabase';

const BUCKET = 'social-images';

/**
 * Garante que o bucket existe. Ignora erro se já existir.
 */
async function ensureBucket(): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
  });

  // Ignora erro "already exists"
  if (error && !error.message?.includes('already exists')) {
    console.error('[Storage] Erro ao criar bucket:', error.message);
  }
}

/**
 * Faz upload de uma imagem e retorna a URL pública.
 * Retorna null se falhar.
 */
export async function uploadSocialImage(params: {
  data: Buffer;
  mimeType: string;
  filename: string;
}): Promise<string | null> {
  try {
    await ensureBucket();

    const supabase = getAdminClient();
    const path = `posts/${params.filename}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, params.data, {
        contentType: params.mimeType,
        upsert: true,
      });

    if (uploadError) {
      console.error('[Storage] Erro no upload:', uploadError.message);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(path);

    if (!urlData?.publicUrl) {
      console.error('[Storage] Erro ao obter URL pública');
      return null;
    }

    console.log(`[Storage] Imagem salva: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Storage] Erro:', msg);
    return null;
  }
}
