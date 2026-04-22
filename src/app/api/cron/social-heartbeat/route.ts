/**
 * Heartbeat semanal do sistema social.
 * Roda toda segunda-feira às 15h UTC (12h BRT).
 *
 * Se não houve post nos últimos 3 dias, envia alerta no Telegram.
 * Rede de segurança caso os alertas de erro não tenham disparado (ex: cron caiu antes de rodar).
 *
 * Protegido por CRON_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLastPostDate } from '@/lib/social/state';
import { sendAlert, isAlertConfigured } from '@/lib/social/alert';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const MAX_SILENCE_DAYS = 3;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const lastDateStr = await getLastPostDate();
    const now = new Date();

    if (!lastDateStr) {
      const msg = `⚠️ <b>ContratoSeguro — Heartbeat</b>\nNenhum post social registrado até hoje. Verifique o cron <code>/api/cron/social</code>.`;
      await sendAlert(msg);
      return NextResponse.json({ status: 'alert', reason: 'sem histórico' });
    }

    const lastDate = new Date(lastDateStr + 'T00:00:00Z');
    const diffMs = now.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > MAX_SILENCE_DAYS) {
      const msg = [
        `🚨 <b>ContratoSeguro — Silêncio nas redes sociais</b>`,
        `Último post: <code>${lastDateStr}</code> (${diffDays} dias atrás).`,
        `Limite: ${MAX_SILENCE_DAYS} dias.`,
        '',
        `Checar:`,
        `• Vercel → Logs de <code>/api/cron/social</code>`,
        `• Meta token ainda válido?`,
        `• Rota <code>/api/social/image/carousel</code> retorna PNG > 5KB?`,
      ].join('\n');
      await sendAlert(msg);
      return NextResponse.json({
        status: 'alert',
        reason: 'silêncio excessivo',
        lastPostDate: lastDateStr,
        daysSinceLastPost: diffDays,
      });
    }

    return NextResponse.json({
      status: 'ok',
      lastPostDate: lastDateStr,
      daysSinceLastPost: diffDays,
      alertConfigured: isAlertConfigured(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Heartbeat] Erro:', err);
    return NextResponse.json({ status: 'error', error: msg }, { status: 500 });
  }
}
