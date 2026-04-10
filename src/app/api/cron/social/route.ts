/**
 * Endpoint do Vercel Cron para postagem automática em redes sociais.
 * Configurado em vercel.json para rodar diariamente às 12:00 UTC (9:00 BRT).
 *
 * Protegido por CRON_SECRET — Vercel envia automaticamente no header Authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { runSocialPost } from '@/lib/social/post-orchestrator';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

  try {
    const result = await runSocialPost({ dryRun, force });
    return NextResponse.json({ status: 'ok', ...result, dryRun });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social Cron] Erro fatal:', err);
    return NextResponse.json({ status: 'error', error: msg }, { status: 500 });
  }
}
