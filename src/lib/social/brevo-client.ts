/**
 * Cliente para o Brevo (ex-Sendinblue) — email marketing.
 * Permite capturar emails de usuários e enviar newsletters automáticas.
 *
 * Setup:
 * 1. Criar conta gratuita em brevo.com (300 emails/dia grátis)
 * 2. Obter API key em: app.brevo.com → Settings → API Keys
 * 3. Configurar no Vercel: BREVO_API_KEY
 * 4. Criar lista em Brevo e anotar o ID (BREVO_LIST_ID)
 */

const BREVO_API = 'https://api.brevo.com/v3';

export function isBrevoConfigured(): boolean {
  return !!process.env.BREVO_API_KEY;
}

function getBrevoHeaders() {
  return {
    'api-key': process.env.BREVO_API_KEY || '',
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

/**
 * Adiciona email à lista de newsletters.
 * Chamado quando usuário faz upload de contrato.
 */
export async function addEmailToList(params: {
  email: string;
  firstName?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!isBrevoConfigured()) {
    return { success: false, error: 'BREVO_API_KEY não configurado' };
  }

  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;

  try {
    const body: Record<string, unknown> = {
      email: params.email,
      updateEnabled: true, // Não gerar erro se email já existir
      attributes: {
        FIRSTNAME: params.firstName || '',
        SOURCE: 'contrato-upload',
      },
    };

    if (listId) {
      body.listIds = [listId];
    }

    const res = await fetch(`${BREVO_API}/contacts`, {
      method: 'POST',
      headers: getBrevoHeaders(),
      body: JSON.stringify(body),
    });

    if (res.ok || res.status === 204) {
      return { success: true };
    }

    const data = await res.json().catch(() => ({}));
    const errorMsg = (data as { message?: string }).message || `HTTP ${res.status}`;
    console.error('[Social] Erro Brevo (addEmail):', errorMsg);
    return { success: false, error: errorMsg };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Brevo:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Envia email de newsletter para a lista configurada.
 * Chamado pelo cron diário — envia versão email do post social.
 */
export async function sendNewsletter(params: {
  subject: string;
  htmlContent: string;
  senderName?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!isBrevoConfigured()) {
    return { success: false, error: 'BREVO_API_KEY não configurado' };
  }

  const listId = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;

  if (!listId) {
    return { success: false, error: 'BREVO_LIST_ID não configurado' };
  }

  try {
    const body = {
      name: `Newsletter ${new Date().toISOString().split('T')[0]}`,
      subject: params.subject,
      htmlContent: params.htmlContent,
      sender: {
        name: params.senderName || 'ContratoSeguro',
        email: process.env.BREVO_SENDER_EMAIL || 'noreply@contrato-seguro.com',
      },
      recipients: { listIds: [listId] },
      scheduledAt: undefined, // enviar imediatamente
    };

    const res = await fetch(`${BREVO_API}/emailCampaigns`, {
      method: 'POST',
      headers: getBrevoHeaders(),
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({})) as { id?: number; message?: string };

    if (!res.ok) {
      console.error('[Social] Erro Brevo (sendNewsletter):', data.message);
      return { success: false, error: data.message || `HTTP ${res.status}` };
    }

    // Disparar envio imediato
    if (data.id) {
      await fetch(`${BREVO_API}/emailCampaigns/${data.id}/sendNow`, {
        method: 'POST',
        headers: getBrevoHeaders(),
      });
    }

    return { success: true, id: String(data.id || '') };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Brevo:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Gera HTML simples para email de newsletter a partir do texto do post.
 */
export function buildNewsletterHtml(params: {
  text: string;
  hashtags: string[];
  imageUrl?: string;
  appUrl: string;
}): string {
  const paragraphs = params.text
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => `<p style="margin:0 0 12px;line-height:1.6;color:#374151;">${l}</p>`)
    .join('');

  const hashtagsHtml = params.hashtags
    .map((h) => `<span style="color:#7c3aed;font-size:13px;">${h}</span>`)
    .join(' ');

  const imageHtml = params.imageUrl
    ? `<img src="${params.imageUrl}" alt="ContratoSeguro" style="width:100%;max-width:600px;border-radius:8px;margin:16px 0;">`
    : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#1a1035,#7c3aed);padding:24px 32px;">
          <p style="margin:0;color:#fff;font-size:20px;font-weight:bold;">🛡️ ContratoSeguro</p>
          <p style="margin:4px 0 0;color:#c4b5fd;font-size:13px;">Dica Jurídica do Dia</p>
        </td></tr>
        <!-- Content -->
        <tr><td style="padding:32px;">
          ${imageHtml}
          ${paragraphs}
          <div style="margin:16px 0 8px;">${hashtagsHtml}</div>
        </td></tr>
        <!-- CTA -->
        <tr><td style="padding:0 32px 32px;">
          <a href="${params.appUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:bold;font-size:14px;">
            Analisar meu contrato gratuitamente →
          </a>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f3f4f6;padding:16px 32px;border-top:1px solid #e5e7eb;">
          <p style="margin:0;font-size:11px;color:#6b7280;text-align:center;">
            ContratoSeguro — Análise de contratos com IA<br>
            <a href="${params.appUrl}" style="color:#7c3aed;">${params.appUrl}</a><br>
            <a href="${params.appUrl}/unsubscribe" style="color:#9ca3af;">Descadastrar</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`.trim();
}
