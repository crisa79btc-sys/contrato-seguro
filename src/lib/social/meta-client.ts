/**
 * Cliente para a Meta Graph API (Facebook + Instagram).
 * Publica posts em páginas do Facebook e contas Business do Instagram.
 */

import type { MetaPostResult } from './types';

const GRAPH_API = 'https://graph.facebook.com/v21.0';

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
