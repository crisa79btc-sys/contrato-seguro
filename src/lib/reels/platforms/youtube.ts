/**
 * Postagem de YouTube Shorts via YouTube Data API v3.
 *
 * Docs:
 *   https://developers.google.com/youtube/v3/docs/videos/insert
 *   https://developers.google.com/youtube/v3/guides/uploading_a_video
 *
 * YouTube trata um vídeo como Short quando:
 *   - Aspect ratio 9:16 (vertical)
 *   - Duração ≤ 60s (preferencialmente — até 3min também é aceito como Short)
 *   - Título ou descrição com #Shorts
 *
 * Autenticação: OAuth 2.0 Refresh Token (Desktop app).
 *
 * SETUP EXTERNO (uma vez):
 *   1. https://console.cloud.google.com → novo projeto "ContratoSeguro"
 *   2. APIs & Services → Library → habilitar "YouTube Data API v3"
 *   3. Credentials → Create OAuth Client ID → "Desktop app"
 *   4. Download JSON → YOUTUBE_CLIENT_ID e YOUTUBE_CLIENT_SECRET
 *   5. Pegar refresh token via https://developers.google.com/oauthplayground :
 *      a. Settings (⚙) → marcar "Use your own OAuth credentials" e colar Client ID/Secret
 *      b. Select scope: https://www.googleapis.com/auth/youtube.upload
 *      c. Authorize → login Google → Exchange authorization code for tokens
 *      d. Copiar refresh_token → YOUTUBE_REFRESH_TOKEN
 */

import type { PostResult } from '../types';

const OAUTH_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const UPLOAD_URL =
  'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status';

type PublishParams = {
  videoUrl: string;
  title: string;
  description: string;
  tags: string[];
  categoryId?: string;
};

function getConfig() {
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET e YOUTUBE_REFRESH_TOKEN são obrigatórios'
    );
  }
  return { clientId, clientSecret, refreshToken };
}

async function getAccessToken(): Promise<string> {
  const { clientId, clientSecret, refreshToken } = getConfig();
  const res = await fetch(OAUTH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  const data = (await res.json()) as { access_token?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(`Falha ao obter YouTube access_token: ${data.error ?? res.status}`);
  }
  return data.access_token;
}

/**
 * Upload resumable em 2 fases:
 *   Fase 1 — inicia a sessão de upload, obtém upload URL
 *   Fase 2 — envia o binário do vídeo
 */
export async function publishYouTubeShort(params: PublishParams): Promise<PostResult> {
  try {
    const accessToken = await getAccessToken();

    // ── Fase 0: baixar o vídeo do Storage para um ArrayBuffer ─────────────
    const videoRes = await fetch(params.videoUrl);
    if (!videoRes.ok) {
      throw new Error(`Falha ao baixar vídeo para YouTube: ${videoRes.status}`);
    }
    const videoBuffer = await videoRes.arrayBuffer();
    const videoBytes = videoBuffer.byteLength;

    // Garantir #Shorts no título (obrigatório para aparecer como Short)
    const title = params.title.includes('#Shorts')
      ? params.title.slice(0, 100)
      : `${params.title} #Shorts`.slice(0, 100);

    // ── Fase 1: iniciar sessão resumable ──────────────────────────────────
    const metadata = {
      snippet: {
        title,
        description: params.description.slice(0, 5000),
        tags: params.tags.slice(0, 15),
        categoryId: params.categoryId ?? '22', // 22 = People & Blogs
      },
      status: {
        privacyStatus: 'public',
        selfDeclaredMadeForKids: false,
      },
    };

    const initRes = await fetch(UPLOAD_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Upload-Content-Type': 'video/mp4',
        'X-Upload-Content-Length': String(videoBytes),
      },
      body: JSON.stringify(metadata),
    });

    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`YouTube init upload falhou (${initRes.status}): ${errText}`);
    }

    const uploadLocation = initRes.headers.get('location');
    if (!uploadLocation) {
      throw new Error('YouTube não retornou upload URL no header Location');
    }

    // ── Fase 2: enviar o binário ───────────────────────────────────────────
    const uploadRes = await fetch(uploadLocation, {
      method: 'PUT',
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Length': String(videoBytes),
      },
      body: videoBuffer,
    });

    if (!uploadRes.ok && uploadRes.status !== 201) {
      const errText = await uploadRes.text();
      throw new Error(`YouTube upload falhou (${uploadRes.status}): ${errText}`);
    }

    const data = (await uploadRes.json()) as {
      id?: string;
      error?: { message: string };
    };

    if (!data.id) {
      throw new Error(data.error?.message ?? 'YouTube não retornou ID do vídeo');
    }

    return {
      platform: 'youtube',
      success: true,
      platformPostId: data.id,
      platformUrl: `https://www.youtube.com/shorts/${data.id}`,
    };
  } catch (err) {
    return {
      platform: 'youtube',
      success: false,
      error: err instanceof Error ? err.message : 'Erro desconhecido',
    };
  }
}
