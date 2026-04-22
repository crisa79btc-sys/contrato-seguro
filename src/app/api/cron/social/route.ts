/**
 * Endpoint do Vercel Cron para postagem automática em redes sociais.
 * Configurado em vercel.json para rodar diariamente às 12:00 UTC (9:00 BRT).
 *
 * Protegido por CRON_SECRET — Vercel envia automaticamente no header Authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSocialPost } from '@/lib/social/post-orchestrator';
import { sendAlert } from '@/lib/social/alert';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

export async function GET(request: NextRequest) {
  // Verificar autorização do cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar parâmetros
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
  const force = request.nextUrl.searchParams.get('force') === 'true';

  // Estratégia 7 posts/semana: todos os dias às 22h UTC (19h BRT).
  // Calendário editorial em src/lib/social/topics.ts DAY_OF_WEEK_CALENDAR.
  if (!force && !dryRun) {
    const hourUtc = new Date().getUTCHours();
    if (hourUtc !== 22) {
      return NextResponse.json({ skipped: true, reason: 'horário não é 22h UTC (19h BRT)' });
    }
  }

  try {
    const result = await runSocialPost({ dryRun, force });
    return NextResponse.json({ status: 'ok', ...result, dryRun }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social Cron] Erro fatal:', err);
    await sendAlert(`🚨 <b>Social Cron — erro fatal</b>\n<code>${msg.slice(0, 500)}</code>`);
    return NextResponse.json({ status: 'error', error: msg }, { status: 500 });
  }
}
