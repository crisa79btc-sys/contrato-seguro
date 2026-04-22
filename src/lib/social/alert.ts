/**
 * Alertas operacionais via Telegram.
 *
 * Destino:
 * - TELEGRAM_ALERT_CHAT_ID (preferido — chat privado do admin)
 * - Se não configurado, cai para TELEGRAM_CHANNEL_ID
 *
 * Uso: disparado sempre que um cron social falha (publicação ou heartbeat).
 * Objetivo: saber na hora, não descobrir olhando o feed dias depois.
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

function getAlertChatId(): string | undefined {
  return process.env.TELEGRAM_ALERT_CHAT_ID || process.env.TELEGRAM_CHANNEL_ID;
}

export function isAlertConfigured(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && getAlertChatId());
}

/**
 * Envia um alerta operacional. Nunca lança — falha silenciosa se não configurado.
 */
export async function sendAlert(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = getAlertChatId();

  if (!token || !chatId) {
    console.warn('[Alert] Telegram não configurado — alerta perdido:', message.slice(0, 120));
    return;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message.slice(0, 4096),
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.error(`[Alert] Falha ao enviar alerta: HTTP ${response.status}`, body);
    }
  } catch (err) {
    console.error('[Alert] Erro ao enviar alerta:', err);
  }
}

/**
 * Formata e envia um resumo de erros do cron social.
 */
export async function alertSocialFailure(params: {
  topicKey: string;
  failures: Array<{ channel: string; error: string }>;
  context?: string;
}): Promise<void> {
  const lines = [
    `🚨 <b>ContratoSeguro — Falha no post social</b>`,
    `Tema: <code>${escapeHtml(params.topicKey)}</code>`,
    ...(params.context ? [`Contexto: ${escapeHtml(params.context)}`] : []),
    '',
    '<b>Canais com erro:</b>',
    ...params.failures.map((f) => `• ${escapeHtml(f.channel)}: ${escapeHtml(f.error).slice(0, 240)}`),
  ];
  await sendAlert(lines.join('\n'));
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
