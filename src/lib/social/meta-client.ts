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
    console.log('[Instagram] igUserId:', igUserId);
    console.log('[Instagram] imageUrl:', params.imageUrl);
    console.log('[Instagram] caption length:', params.caption.length);

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
    console.log('[Instagram] container response:', JSON.stringify(createData));

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
 * Verifica se as credenciais Meta estão configuradas.
 */
export function isMetaConfigured(): { facebook: boolean; instagram: boolean } {
  return {
    facebook: !!(process.env.META_PAGE_ACCESS_TOKEN && process.env.META_PAGE_ID),
    instagram: !!(
      process.env.META_PAGE_ACCESS_TOKEN &&
      process.env.META_PAGE_ID &&
      process.env.META_IG_USER_ID
    ),
  };
}
