/**
 * Cliente para a LinkedIn Marketing API.
 * Publica posts em Company Page.
 *
 * Setup:
 * 1. Criar Company Page em linkedin.com/company/setup/new
 * 2. Criar app em linkedin.com/developers/apps/new
 * 3. Solicitar produtos: "Share on LinkedIn" + "Marketing Developer Platform"
 * 4. OAuth 2.0 com escopo: w_organization_social, r_organization_social
 * 5. Configurar no Vercel:
 *    - LINKEDIN_ACCESS_TOKEN (access token gerado via OAuth, válido 60 dias)
 *    - LINKEDIN_REFRESH_TOKEN (refresh token, válido 365 dias)
 *    - LINKEDIN_CLIENT_ID + LINKEDIN_CLIENT_SECRET (para renovar)
 *    - LINKEDIN_ORGANIZATION_ID (ex: "123456789")
 */

const LINKEDIN_API = 'https://api.linkedin.com/rest';

export function isLinkedInConfigured(): boolean {
  return !!(process.env.LINKEDIN_ACCESS_TOKEN && process.env.LINKEDIN_ORGANIZATION_ID);
}

/**
 * Renova o access token usando o refresh token.
 * LinkedIn access tokens expiram em 60 dias, refresh tokens em 365 dias.
 */
async function refreshLinkedInToken(): Promise<string | null> {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const refreshToken = process.env.LINKEDIN_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) return null;

  try {
    const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
      }).toString(),
    });

    const data = await res.json();
    if (data.access_token) {
      console.log('[Social] LinkedIn token renovado com sucesso');
      return data.access_token;
    }
    return null;
  } catch {
    return null;
  }
}

export async function postToLinkedIn(params: {
  text: string;
  url?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const orgId = process.env.LINKEDIN_ORGANIZATION_ID;
  let token = process.env.LINKEDIN_ACCESS_TOKEN;

  if (!token || !orgId) {
    return { success: false, error: 'LINKEDIN_ACCESS_TOKEN ou LINKEDIN_ORGANIZATION_ID não configurado' };
  }

  try {
    const body: Record<string, unknown> = {
      author: `urn:li:organization:${orgId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: params.text },
          shareMediaCategory: params.url ? 'ARTICLE' : 'NONE',
          ...(params.url
            ? {
                media: [
                  {
                    status: 'READY',
                    originalUrl: params.url,
                  },
                ],
              }
            : {}),
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const doPost = async (accessToken: string) =>
      fetch(`${LINKEDIN_API}/posts`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'LinkedIn-Version': '202501',
          'X-Restli-Protocol-Version': '2.0.0',
        },
        body: JSON.stringify(body),
      });

    let response = await doPost(token);

    // Se 401 → tentar renovar token
    if (response.status === 401) {
      console.warn('[Social] LinkedIn token expirado, tentando renovar...');
      const newToken = await refreshLinkedInToken();
      if (newToken) {
        token = newToken;
        response = await doPost(token);
      }
    }

    if (response.ok) {
      // LinkedIn retorna ID no header X-RestLi-Id
      const postId = response.headers.get('x-restli-id') || response.headers.get('X-RestLi-Id') || '';
      return { success: true, id: postId };
    }

    const errData = await response.json().catch(() => ({}));
    const errorMsg = (errData as { message?: string }).message || `HTTP ${response.status}`;
    console.error('[Social] Erro LinkedIn:', errorMsg);
    return { success: false, error: errorMsg };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro LinkedIn:', msg);
    return { success: false, error: msg };
  }
}
