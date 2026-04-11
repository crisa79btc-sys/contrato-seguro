/**
 * Cliente para a Telegram Bot API.
 * Publica mensagens em canal público usando um bot.
 *
 * Setup:
 * 1. Criar bot via @BotFather no Telegram → /newbot → obter BOT_TOKEN
 * 2. Criar canal (ex: @ContratoSeguroBR) e adicionar bot como administrador
 * 3. Configurar TELEGRAM_BOT_TOKEN e TELEGRAM_CHANNEL_ID no Vercel
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

export function isTelegramConfigured(): boolean {
  return !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHANNEL_ID);
}

export async function postToTelegram(params: {
  text: string;
  imageUrl?: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !channelId) {
    return { success: false, error: 'TELEGRAM_BOT_TOKEN ou TELEGRAM_CHANNEL_ID não configurado' };
  }

  try {
    let url: string;
    let body: Record<string, unknown>;

    if (params.imageUrl) {
      // Post com imagem
      url = `${TELEGRAM_API_BASE}${token}/sendPhoto`;
      body = {
        chat_id: channelId,
        photo: params.imageUrl,
        caption: params.text.slice(0, 1024), // Telegram limite caption = 1024 chars
        parse_mode: 'HTML',
      };
    } else {
      // Post só texto
      url = `${TELEGRAM_API_BASE}${token}/sendMessage`;
      body = {
        chat_id: channelId,
        text: params.text.slice(0, 4096), // Telegram limite mensagem = 4096 chars
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!data.ok) {
      console.error('[Social] Erro Telegram:', data.description);
      return { success: false, error: data.description };
    }

    const msgId = String(data.result?.message_id || '');
    return { success: true, id: msgId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro Telegram:', msg);
    return { success: false, error: msg };
  }
}
