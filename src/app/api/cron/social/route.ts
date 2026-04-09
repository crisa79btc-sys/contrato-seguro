/**
 * Endpoint do Vercel Cron para postagem automática em redes sociais.
 * Configurado em vercel.json para rodar diariamente às 12:00 UTC (9:00 BRT).
 *
 * Protegido por CRON_SECRET — Vercel envia automaticamente no header Authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { runSocialPost } from '@/lib/social/post-orchestrator';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verificar autorização do cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verificar se é teste manual (query param ?dryRun=true)
  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';

  // Executar com waitUntil para garantir que o Vercel não mate o processo
  const resultPromise = runSocialPost({ dryRun });

  // Se não é dry run, usar waitUntil para background processing
  if (!dryRun) {
    waitUntil(resultPromise.catch((err) => {
      console.error('[Social Cron] Erro fatal:', err);
    }));

    return NextResponse.json({
      status: 'processing',
      message: 'Post social iniciado em background',
      dryRun,
    });
  }

  // Dry run: esperar resultado e retornar
  try {
    const result = await resultPromise;
    return NextResponse.json({ status: 'ok', ...result, dryRun });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ status: 'error', error: msg }, { status: 500 });
  }
}
