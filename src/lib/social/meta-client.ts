/**
 * Cliente para a Meta Graph API (Facebook + Instagram).
 * Publica posts em páginas do Facebook e contas Business do Instagram.
 */

import type { MetaPostResult } from './types';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

/**
 * Aguarda um container do Instagram ficar com status FINISHED.
 * Necessário antes de criar o carrossel (Meta requer filhos FINISHED).
 * Retorna true se ficou pronto, false se deu erro ou timeout.
 */
async function pollContainerStatus(
  containerId: string,
  token: string,
  maxAttempts = 10,
  intervalMs = 3000
): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise(r => setTimeout(r, intervalMs));
    try {
      const qs = new URLSearchParams({ fields: 'status_code', access_token: token });
      const res = await fetch(`${GRAPH_API}/${containerId}?${qs.toString()}`);
      const data = await res.json() as { status_code?: string };
      if (data.status_code === 'FINISHED') return true;
      if (data.status_code === 'ERROR') {
        console.error(`[Social] Container ${containerId} com status ERROR`);
        return false;
      }
      console.log(`[Social] Container ${containerId}: ${data.status_code ?? 'sem status'} (${attempt}/${maxAttempts})`);
    } catch {
      // ignora erros de rede na verificação e continua polling
    }
  }
  console.warn(`[Social] Container ${containerId}: timeout após ${maxAttempts} tentativas`);
  return false;
}

function getConfig() {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  const pageId = process.env.META_PAGE_ID;
  const igUserId = process.env.META_IG_USER_ID;

  if (!token || !pageId) {
    throw new Error('META_PAGE_ACCESS_TOKEN e META_PAGE_ID são obrigatórios');
  }

  return { token, pageId, igUserId };
}

/**
 * Publica um post com imagem na página do Facebook.
 */
export async function postToFacebook(params: {
  message: string;
  imageUrl?: string;
  link?: string;
}): Promise<MetaPostResult> {
  const { token, pageId } = getConfig();

  try {
    let url: string;
    const body = new URLSearchParams();
    body.append('access_token', token);

    if (params.imageUrl) {
      // Post com imagem
      url = `${GRAPH_API}/${pageId}/photos`;
      body.append('url', params.imageUrl);
      body.append('message', params.message);
    } else {
      // Post de texto (com link opcional)
      url = `${GRAPH_API}/${pageId}/feed`;
      body.append('message', params.message);
      if (params.link) body.append('link', params.link);
    }

    const response = await fetch(url, {
      method: 'POST',
      body: body.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.error?.message || `HTTP ${response.status}`;
      console.error('[Social] Erro Facebook:', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    return { id: data.id || data.post_id || '', success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Facebook:', msg);
    return { id: '', success: false, error: msg };
  }
}

/**
 * Publica uma imagem no Instagram Business (2 etapas).
 * Etapa 1: Cria container de mídia
 * Etapa 2: Publica o container
 */
export async function postToInstagram(params: {
  caption: string;
  imageUrl: string;
}): Promise<MetaPostResult> {
  const { token, igUserId } = getConfig();

  if (!igUserId) {
    return { id: '', success: false, error: 'META_IG_USER_ID não configurado' };
  }

  try {
    // Etapa 1: Criar container
    const createUrl = `${GRAPH_API}/${igUserId}/media`;
    const createBody = new URLSearchParams({
      access_token: token,
      image_url: params.imageUrl,
      caption: params.caption,
    });

    const createResponse = await fetch(createUrl, {
      method: 'POST',
      body: createBody.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      const errorMsg = createData.error?.message || `HTTP ${createResponse.status}`;
      console.error('[Social] Erro Instagram (criar container):', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    const creationId = createData.id;

    // Etapa 2: Publicar (com retry)
    for (let attempt = 1; attempt <= 3; attempt++) {
      // Esperar Instagram processar a imagem
      await new Promise((resolve) => setTimeout(resolve, attempt * 5000));

      const publishUrl = `${GRAPH_API}/${igUserId}/media_publish`;
      const publishBody = new URLSearchParams({
        access_token: token,
        creation_id: creationId,
      });

      const publishResponse = await fetch(publishUrl, {
        method: 'POST',
        body: publishBody.toString(),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const publishData = await publishResponse.json();

      if (publishResponse.ok && publishData.id) {
        return { id: publishData.id, success: true };
      }

      const errorMsg = publishData.error?.message || '';
      console.warn(`[Social] Instagram tentativa ${attempt}/3:`, errorMsg);

      // Se não é erro de "não está pronto", não adianta tentar de novo
      if (!errorMsg.includes('not ready') && !errorMsg.includes('MEDIA_NOT_READY')) {
        return { id: '', success: false, error: errorMsg };
      }
    }

    return { id: '', success: false, error: 'Instagram: imagem não ficou pronta após 3 tentativas' };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Instagram:', msg);
    return { id: '', success: false, error: msg };
  }
}

/**
 * Publica um carrossel de imagens no Instagram Business (3 etapas).
 * Etapa 1: Cria containers filhos e aguarda cada um ficar FINISHED
 * Etapa 2: Cria container de carrossel e aguarda ficar FINISHED
 * Etapa 3: Publica o carrossel
 */
export async function postCarouselToInstagram(params: {
  caption: string;
  imageUrls: string[];
}): Promise<MetaPostResult> {
  const { token, igUserId } = getConfig();

  if (!igUserId) {
    return { id: '', success: false, error: 'META_IG_USER_ID não configurado' };
  }

  if (params.imageUrls.length < 2 || params.imageUrls.length > 10) {
    return { id: '', success: false, error: 'Carrossel requer entre 2 e 10 imagens' };
  }

  try {
    // Etapa 1: Criar containers filhos em série
    const childIds: string[] = [];

    for (const imageUrl of params.imageUrls) {
      const childRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          image_url: imageUrl,
          is_carousel_item: true,
        }),
      });

      const childData = await childRes.json() as { id?: string; error?: { message: string } };

      if (!childRes.ok || !childData.id) {
        const errorMsg = childData.error?.message || `HTTP ${childRes.status}`;
        console.error('[Social] Erro Instagram (criar filho carrossel):', errorMsg);
        return { id: '', success: false, error: `Falha no filho ${childIds.length + 1}: ${errorMsg}` };
      }

      childIds.push(childData.id);
    }

    // Aguardar todos os filhos ficarem FINISHED em paralelo
    // (Meta exige status FINISHED antes de criar o carrossel)
    console.log(`[Social] Aguardando ${childIds.length} containers filhos ficarem prontos...`);
    const readyResults = await Promise.all(
      childIds.map(id => pollContainerStatus(id, token))
    );
    const failedIndex = readyResults.findIndex(r => !r);
    if (failedIndex !== -1) {
      return { id: '', success: false, error: `Container filho ${failedIndex + 1} não ficou pronto (FINISHED)` };
    }

    // Etapa 2: Criar container de carrossel
    const carouselRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        media_type: 'CAROUSEL',
        children: childIds.join(','),
        caption: params.caption,
      }),
    });

    const carouselData = await carouselRes.json() as { id?: string; error?: { message: string } };

    if (!carouselRes.ok || !carouselData.id) {
      const errorMsg = carouselData.error?.message || `HTTP ${carouselRes.status}`;
      console.error('[Social] Erro Instagram (criar carrossel):', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    // Aguardar container do carrossel ficar FINISHED
    console.log(`[Social] Aguardando container do carrossel (${carouselData.id}) ficar pronto...`);
    const carouselReady = await pollContainerStatus(carouselData.id, token);
    if (!carouselReady) {
      return { id: '', success: false, error: 'Container do carrossel não ficou pronto (FINISHED)' };
    }

    // Etapa 3: Publicar
    const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        creation_id: carouselData.id,
      }),
    });

    const publishData = await publishRes.json() as { id?: string; error?: { message: string } };

    if (publishRes.ok && publishData.id) {
      return { id: publishData.id, success: true };
    }

    const errorMsg = publishData.error?.message || `HTTP ${publishRes.status}`;
    console.error('[Social] Erro Instagram (publicar carrossel):', errorMsg);
    return { id: '', success: false, error: errorMsg };

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Instagram carrossel:', msg);
    return { id: '', success: false, error: msg };
  }
}

/**
 * Publica um álbum de imagens no Facebook (post com múltiplas fotos).
 * Etapa 1: Faz upload de cada foto (published: false)
 * Etapa 2: Cria post no feed com as fotos anexadas
 */
export async function postAlbumToFacebook(params: {
  message: string;
  imageUrls: string[];
}): Promise<MetaPostResult> {
  const { token, pageId } = getConfig();

  try {
    // Etapa 1: Upload das fotos como não publicadas
    const photoIds: string[] = [];

    for (const imageUrl of params.imageUrls) {
      const photoRes = await fetch(`${GRAPH_API}/${pageId}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          url: imageUrl,
          published: false,
        }),
      });

      const photoData = await photoRes.json();

      if (!photoRes.ok || !photoData.id) {
        const errorMsg = photoData.error?.message || `HTTP ${photoRes.status}`;
        console.error('[Social] Erro Facebook (upload foto):', errorMsg);
        return { id: '', success: false, error: `Falha na foto ${photoIds.length + 1}: ${errorMsg}` };
      }

      photoIds.push(photoData.id);
    }

    // Etapa 2: Criar post no feed com fotos anexadas
    const attachedMedia = photoIds.map((id) => ({ media_fbid: id }));

    const feedRes = await fetch(`${GRAPH_API}/${pageId}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        message: params.message,
        attached_media: attachedMedia,
      }),
    });

    const feedData = await feedRes.json();

    if (!feedRes.ok || !feedData.id) {
      const errorMsg = feedData.error?.message || `HTTP ${feedRes.status}`;
      console.error('[Social] Erro Facebook (publicar álbum):', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    return { id: feedData.id, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Facebook álbum:', msg);
    return { id: '', success: false, error: msg };
  }
}

/**
 * Publica um post de texto no Threads.
 * Requer token OAuth separado (graph.threads.net).
 *
 * Setup:
 * 1. No app Meta, adicionar o produto "Threads API"
 * 2. OAuth via https://www.threads.net/oauth/authorize
 *    Escopos: threads_basic, threads_content_publish
 * 3. Configurar no Vercel: META_THREADS_ACCESS_TOKEN e META_THREADS_USER_ID
 */
export async function postToThreads(params: {
  text: string;
  imageUrl?: string;
}): Promise<MetaPostResult> {
  const token = process.env.META_THREADS_ACCESS_TOKEN;
  const userId = process.env.META_THREADS_USER_ID;

  if (!token || !userId) {
    return { id: '', success: false, error: 'META_THREADS_ACCESS_TOKEN ou META_THREADS_USER_ID não configurado' };
  }

  const THREADS_API = 'https://graph.threads.net/v1.0';

  try {
    // Etapa 1: Criar container
    const createBody = new URLSearchParams({
      access_token: token,
      media_type: params.imageUrl ? 'IMAGE' : 'TEXT',
      text: params.text,
    });

    if (params.imageUrl) {
      createBody.append('image_url', params.imageUrl);
    }

    const createResponse = await fetch(`${THREADS_API}/${userId}/threads`, {
      method: 'POST',
      body: createBody.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const createData = await createResponse.json();

    if (!createResponse.ok) {
      const errorMsg = createData.error?.message || `HTTP ${createResponse.status}`;
      console.error('[Social] Erro Threads (criar):', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    const creationId = createData.id;

    // Etapa 2: Publicar
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const publishBody = new URLSearchParams({
      access_token: token,
      creation_id: creationId,
    });

    const publishResponse = await fetch(`${THREADS_API}/${userId}/threads_publish`, {
      method: 'POST',
      body: publishBody.toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const publishData = await publishResponse.json();

    if (publishResponse.ok && publishData.id) {
      return { id: publishData.id, success: true };
    }

    const errorMsg = publishData.error?.message || `HTTP ${publishResponse.status}`;
    console.error('[Social] Erro Threads (publicar):', errorMsg);
    return { id: '', success: false, error: errorMsg };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Threads:', msg);
    return { id: '', success: false, error: msg };
  }
}

/**
 * Posta um comentário como a própria conta num post do Instagram.
 * Usado logo após a publicação para hackear o algoritmo:
 * - Gera sinal inicial de conversação
 * - Permite incluir link clicável (caption do IG não tem links)
 * - Aumenta probabilidade de outros comentários
 *
 * Requer que o post já esteja publicado (mediaId retornado pelo publish).
 */
export async function postFirstComment(params: {
  mediaId: string;
  text: string;
}): Promise<MetaPostResult> {
  const { token } = getConfig();

  try {
    const response = await fetch(`${GRAPH_API}/${params.mediaId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        message: params.text,
      }),
    });

    const data = await response.json() as { id?: string; error?: { message: string } };

    if (!response.ok || !data.id) {
      const errorMsg = data.error?.message || `HTTP ${response.status}`;
      console.error('[Social] Erro postFirstComment:', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    return { id: data.id, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro postFirstComment:', msg);
    return { id: '', success: false, error: msg };
  }
}

/**
 * Publica um Story no Instagram Business.
 * Story reaproveita capa do carrossel — posta 24h depois, gera alcance extra.
 */
export async function postStoryToInstagram(params: {
  imageUrl: string;
}): Promise<MetaPostResult> {
  const { token, igUserId } = getConfig();
  if (!igUserId) return { id: '', success: false, error: 'META_IG_USER_ID não configurado' };

  try {
    const createRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        image_url: params.imageUrl,
        media_type: 'STORIES',
      }),
    });
    const createData = await createRes.json() as { id?: string; error?: { message: string } };
    if (!createRes.ok || !createData.id) {
      return { id: '', success: false, error: createData.error?.message || `HTTP ${createRes.status}` };
    }

    await new Promise(r => setTimeout(r, 3000));
    const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token, creation_id: createData.id }),
    });
    const publishData = await publishRes.json() as { id?: string; error?: { message: string } };
    if (publishRes.ok && publishData.id) return { id: publishData.id, success: true };
    return { id: '', success: false, error: publishData.error?.message || `HTTP ${publishRes.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return { id: '', success: false, error: msg };
  }
}

/**
 * Verifica se as credenciais Meta estão configuradas.
 */
export function isMetaConfigured(): { facebook: boolean; instagram: boolean; threads: boolean } {
  return {
    facebook: !!(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_PAGE_ID),
    instagram: !!(
      process.env.META_PAGE_ACCESS_TOKEN &&
      process.env.META_PAGE_ID &&
      process.env.META_IG_USER_ID
    ),
    threads: !!(process.env.META_THREADS_ACCESS_TOKEN && process.env.META_THREADS_USER_ID),
  };
}
