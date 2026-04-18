/**
 * Postagem de Facebook Reels via Meta Graph API v21.0.
 *
 * Docs:
 *   https://developers.facebook.com/docs/video-api/guides/publishing#facebook-reels
 *
 * Fluxo Facebook Reels (3 passos — diferente do Instagram):
 *   1. POST /{page-id}/video_reels?upload_phase=start → retorna { video_id, upload_url }
 *   2. Upload binário do vídeo para upload_url (multipart/form-data, header
 *      'Authorization: OAuth {token}', 'offset: 0', 'file_size: <bytes>')
 *   3. POST /{page-id}/video_reels?upload_phase=finish&video_id=...&video_state=PUBLISHED&description=...
 *      → retorna { id }
 *
 * IMPORTANTE:
 *   - Reels FB exige o vídeo em MP4 vertical (9:16), max 1 min para Reels clássico
 *     (até 90s também aceitos, conforme política atual).
 *   - O token precisa ter a permissão `pages_manage_posts` + `pages_read_engagement`.
 *
 * Alternativa simplificada: postar vídeo como "hosted video" via
 *   POST /{page-id}/videos com file_url + description → retorna {id}
 * Isso NÃO marca como Reel (fica como post normal de vídeo), mas pode ser
 * aceitável em fallback se a API de Reels der problema.
 */

import type { PostResult } from '../types';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

type PublishParams = {
  videoUrl: string;        // URL pública do vídeo
  description: string;     // título + descrição + hashtags
};

function getConfig() {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  if (!token || !pageId) {
    throw new Error(
      'META_PAGE_ACCESS_TOKEN e META_PAGE_ID são obrigatórios para postar Reels FB'
    );
  }
  return { token, pageId };
}

/**
 * TODO-Sonnet:
 *   Implementar as 3 chamadas do fluxo video_reels (start/upload/finish).
 *   Detalhes:
 *     - Na fase 1, passar upload_phase=start — NENHUM corpo adicional exceto token.
 *     - Na fase 2, fazer PUT/POST para upload_url baixando o vídeo da nossa URL
 *       primeiro (arrayBuffer) e reenviando como binário. OU usar file_url=... na
 *       fase 1 ("hosted upload"), deixando a Meta baixar direto.
 *     - Na fase 3, upload_phase=finish, video_state=PUBLISHED, description=<texto>.
 *
 * Se rolar muito atrito com a API Reels nativa, FALLBACK simples:
 *   POST {pageId}/videos com file_url=<videoUrl>&description=<texto>
 *   (posta como vídeo normal; não vira Reel no sentido estrito, mas funciona)
 */
export async function publishFacebookReel(params: PublishParams): Promise<PostResult> {
  const { token, pageId } = getConfig();

  // ---------- Implementação com fallback "hosted video" ----------
  // Esta é a rota simples de publicar como vídeo hospedado.
  // O Sonnet pode trocar para video_reels se quiser manter como Reel de verdade.
  const form = new URLSearchParams({
    file_url: params.videoUrl,
    description: params.description,
    access_token: token,
  });

  const res = await fetch(`${GRAPH_API}/${pageId}/videos`, {
    method: 'POST',
    body: form,
  });
  const data = (await res.json()) as {
    id?: string;
    error?: { message: string };
  };

  if (!res.ok || !data.id) {
    return {
      platform: 'facebook',
      success: false,
      error: data.error?.message ?? `HTTP ${res.status}`,
    };
  }

  return {
    platform: 'facebook',
    success: true,
    platformPostId: data.id,
    platformUrl: `https://www.facebook.com/${pageId}/videos/${data.id}`,
  };
}
