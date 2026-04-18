/**
 * Cron para publicar Story no Instagram.
 * Roda ter/qui/sáb às 14h UTC (11h BRT) — 24-36h após o carrossel principal.
 * Reaproveita a capa do último carrossel para gerar alcance extra.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLastCoverUrl } from '@/lib/social/state';
import { postStoryToInstagram, isMetaConfigured } from '@/lib/social/meta-client';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const force = request.nextUrl.searchParams.get('force') === 'true';

  if (!force) {
    const now = new Date();
    const hourUtc = now.getUTCHours();
    const dayOfWeek = now.getUTCDay();
    const shouldPost = hourUtc === 14 && [2, 4, 6].includes(dayOfWeek);
    if (!shouldPost) {
      return NextResponse.json({ skipped: true, reason: 'horário não é slot de story (ter/qui/sáb 11h BRT)' });
    }
  }

  const { instagram } = isMetaConfigured();
  if (!instagram) {
    return NextResponse.json({ skipped: true, reason: 'Instagram não configurado' });
  }

  const coverUrl = await getLastCoverUrl();
  if (!coverUrl) {
    return NextResponse.json({ skipped: true, reason: 'Nenhuma capa disponível para Story' });
  }

  const result = await postStoryToInstagram({ imageUrl: coverUrl });
  console.log('[Story Cron]', result.success ? `OK (${result.id})` : `ERRO: ${result.error}`);

  return NextResponse.json({ status: result.success ? 'ok' : 'error', ...result }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
