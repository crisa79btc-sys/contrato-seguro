/**
 * Cliente TikTok Content Publishing API v2.
 * Publica carrossel de fotos (Photo Post) na conta TikTok Business/Creator.
 *
 * Setup:
 * 1. Criar app em developers.tiktok.com → Content Posting API
 * 2. OAuth flow para obter access_token (scope: video.publish)
 *    - URL de autorização: https://www.tiktok.com/v2/auth/authorize/
 *    - Troque o code por token em: https://open.tiktokapis.com/v2/oauth/token/
 * 3. Configurar no Vercel:
 *    TIKTOK_ACCESS_TOKEN  — token de acesso (expira em 24h; renovar com refresh token)
 *    TIKTOK_OPEN_ID       — open_id do usuário retornado no OAuth
 *
 * Nota: o TikTok Photo Post requer 2–35 imagens acessíveis publicamente por URL.
 */

const TIKTOK_API = 'https://open.tiktokapis.com/v2';

export function isTikTokConfigured(): boolean {
  return !!(process.env.TIKTOK_ACCESS_TOKEN && process.env.TIKTOK_OPEN_ID);
}

function getTikTokHeaders() {
  return {
    Authorization: `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
    'Content-Type': 'application/json; charset=UTF-8',
  };
}

/**
 * Publica carrossel de imagens no TikTok via Photo Post API.
 * Exige 2–35 URLs públicas de imagem.
 */
export async function postCarouselToTikTok(params: {
  caption: string;
  imageUrls: string[];
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isTikTokConfigured()) {
    return { success: false, error: 'TikTok não configurado' };
  }

  const { imageUrls } = params;
  if (imageUrls.length < 2 || imageUrls.length > 35) {
    return {
      success: false,
      error: `TikTok Photo Post requer 2–35 imagens (recebido: ${imageUrls.length})`,
    };
  }

  // TikTok limita título a 2200 caracteres
  const caption = params.caption.slice(0, 2200);

  try {
    const res = await fetch(`${TIKTOK_API}/post/publish/content/init/`, {
      method: 'POST',
      headers: getTikTokHeaders(),
      body: JSON.stringify({
        post_info: {
          title: caption,
          privacy_level: 'PUBLIC_TO_EVERYONE',
          disable_comment: false,
          auto_add_music: false,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          photo_images: imageUrls,
          photo_cover_index: 0,
        },
        post_mode: 'DIRECT_POST',
        media_type: 'PHOTO',
      }),
    });

    const data = await res.json() as {
      data?: { publish_id?: string };
      error?: { code?: string; message?: string };
    };

    if (!res.ok || (data.error?.code && data.error.code !== 'ok')) {
      const msg = data.error?.message || `HTTP ${res.status}`;
      console.error('[TikTok] Erro ao publicar:', msg);
      return { success: false, error: msg };
    }

    const publishId = data.data?.publish_id || '';
    return { success: true, id: publishId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[TikTok] Erro:', msg);
    return { success: false, error: msg };
  }
}
