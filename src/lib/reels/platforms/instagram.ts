/**
 * Postagem de Instagram Reels via Meta Graph API v21.0.
 *
 * Reusa META_PAGE_ACCESS_TOKEN + META_IG_USER_ID já configurados (mesmos da
 * automação social existente em src/lib/social/meta-client.ts).
 *
 * Docs oficiais:
 *   https://developers.facebook.com/docs/instagram-api/guides/content-publishing#reels-posts
 *
 * Fluxo Reels IG:
 *   1. POST /{ig-user-id}/media com media_type=REELS, video_url, caption
 *      → retorna { id } (container)
 *   2. Polling /{container-id}?fields=status_code até FINISHED
 *   3. POST /{ig-user-id}/media_publish com creation_id
 *      → retorna { id } (media_id final)
 *   4. GET /{media-id}?fields=permalink para pegar URL pública
 *
 * IMPORTANTE:
 *   - video_url deve ser PÚBLICO (acessível pela Meta sem auth).
 *   - O vídeo precisa estar em MP4, H.264, AAC, max 100MB, max 90s para Reels.
 *   - Resolução: 9:16, 1080×1920 (a pipeline já entrega assim).
 *   - caption: até 2200 chars.
 */

import type { PostResult } from '../types';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

type PublishParams = {
  videoUrl: string;           // URL pública do vídeo já processado
  caption: string;            // título + descrição + hashtags
  thumbnailUrl?: string;      // opcional; IG auto-gera se não passar
  shareToFeed?: boolean;      // default true — aparece no feed também
};

function getConfig() {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const igUserId = process.env.META_IG_USER_ID;
  if (!token || !igUserId) {
    throw new Error(
      'META_PAGE_ACCESS_TOKEN e META_IG_USER_ID são obrigatórios para postar Reels IG'
    );
  }
  return { token, igUserId };
}

/**
 * TODO-Sonnet: implementar as 4 chamadas descritas no topo.
 * Referência: src/lib/social/meta-client.ts tem padrão de polling de container
 * para carrossel — reusar a ideia (pollContainerStatus).
 */
export async function publishInstagramReel(params: PublishParams): Promise<PostResult> {
  const { token, igUserId } = getConfig();

  // 1. Criar container
  const createParams = new URLSearchParams({
    media_type: 'REELS',
    video_url: params.videoUrl,
    caption: params.caption,
    share_to_feed: (params.shareToFeed ?? true).toString(),
    access_token: token,
  });
  // cover_url: thumbnail personalizado (URL pública de imagem); se omitido, Meta
  // escolhe automaticamente um frame do vídeo.
  if (params.thumbnailUrl) createParams.set('cover_url', params.thumbnailUrl);

  const createRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
    method: 'POST',
    body: createParams,
  });
  const createData = (await createRes.json()) as { id?: string; error?: { message: string } };
  if (!createRes.ok || !createData.id) {
    return {
      platform: 'instagram',
      success: false,
      error: createData.error?.message ?? `HTTP ${createRes.status}`,
    };
  }

  // 2. Polling status FINISHED (Reels demora mais que foto — até 2min)
  const containerId = createData.id;
  const ready = await pollContainerReady(containerId, token);
  if (!ready) {
    return { platform: 'instagram', success: false, error: 'container não ficou FINISHED' };
  }

  // 3. Publicar
  const publishParams = new URLSearchParams({
    creation_id: containerId,
    access_token: token,
  });
  const pubRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
    method: 'POST',
    body: publishParams,
  });
  const pubData = (await pubRes.json()) as { id?: string; error?: { message: string } };
  if (!pubRes.ok || !pubData.id) {
    return {
      platform: 'instagram',
      success: false,
      error: pubData.error?.message ?? `HTTP ${pubRes.status}`,
    };
  }

  // 4. Permalink
  let permalink: string | undefined;
  try {
    const permRes = await fetch(
      `${GRAPH_API}/${pubData.id}?fields=permalink&access_token=${token}`
    );
    const permData = (await permRes.json()) as { permalink?: string };
    permalink = permData.permalink;
  } catch {
    // permalink é opcional
  }

  return {
    platform: 'instagram',
    success: true,
    platformPostId: pubData.id,
    platformUrl: permalink,
  };
}

async function pollContainerReady(
  containerId: string,
  token: string,
  maxAttempts = 40,
  intervalMs = 3000
): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((r) => setTimeout(r, intervalMs));
    try {
      const res = await fetch(
        `${GRAPH_API}/${containerId}?fields=status_code&access_token=${token}`
      );
      const data = (await res.json()) as { status_code?: string };
      if (data.status_code === 'FINISHED') return true;
      if (data.status_code === 'ERROR') return false;
    } catch {
      // ignora, continua polling
    }
  }
  return false;
}
