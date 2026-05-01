/**
 * Cron para publicar Story no Instagram.
 * Roda ter/qui/sáb às 14h UTC (11h BRT) — 24-36h após o carrossel principal.
 *
 * Diferente do feed, Story exige formato 1080×1920 (9:16 vertical).
 * Por isso usamos os METADADOS da capa (title, subtitle, category, badge) para
 * gerar uma imagem vertical nativa via /api/social/image/[id]?format=story,
 * em vez de reaproveitar a capa quadrada (que ficava cortada no Story).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getLastCoverMeta, getLastCoverUrl } from '@/lib/social/state';
import { postStoryToInstagram, isMetaConfigured } from '@/lib/social/meta-client';
import { uploadSocialImage } from '@/lib/social/image-storage';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();
const MIN_STORY_BYTES = 5 * 1024;

/**
 * Gera uma imagem 1080×1920 a partir dos metadados da capa e devolve
 * uma URL pública (Supabase Storage) pronta para a Meta API consumir.
 */
async function buildStoryImageUrl(meta: {
  title: string; subtitle: string; category: string; badge: string;
}): Promise<string | null> {
  const params = new URLSearchParams({
    format: 'story',
    type: 'cover',
    badge: meta.badge,
    category: meta.category,
    title: meta.title,
    subtitle: meta.subtitle,
  });
  const slideUrl = `${APP_URL}/api/social/image/story?${params.toString()}`;

  try {
    const res = await fetch(slideUrl);
    if (!res.ok) {
      console.warn(`[Story Cron] Falha ao gerar imagem: HTTP ${res.status}`);
      return null;
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    if (buffer.byteLength < MIN_STORY_BYTES) {
      console.error(`[Story Cron] PNG gerado muito pequeno (${buffer.byteLength} bytes) — rejeitado.`);
      return null;
    }
    return uploadSocialImage({
      data: buffer,
      mimeType: 'image/png',
      filename: `story-${Date.now()}.png`,
    });
  } catch (err) {
    console.error('[Story Cron] Erro ao gerar/upload da imagem:', err);
    return null;
  }
}

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

  // Caminho preferencial: gerar Story 1080×1920 a partir dos metadados.
  const meta = await getLastCoverMeta();
  let imageUrl: string | null = null;

  if (meta) {
    imageUrl = await buildStoryImageUrl(meta);
  }

  // Fallback: posts antigos (antes desta atualização) só salvaram a URL quadrada.
  // Nesse caso reutilizamos a capa quadrada — não fica perfeito, mas evita pular
  // o Story por falta de metadados na transição.
  if (!imageUrl) {
    const fallbackUrl = await getLastCoverUrl();
    if (!fallbackUrl) {
      return NextResponse.json({ skipped: true, reason: 'Nenhuma capa/metadados disponíveis para Story' });
    }
    console.warn('[Story Cron] Usando fallback (capa quadrada) — sem metadados ainda salvos');
    imageUrl = fallbackUrl;
  }

  const result = await postStoryToInstagram({ imageUrl });
  console.log('[Story Cron]', result.success ? `OK (${result.id})` : `ERRO: ${result.error}`);

  return NextResponse.json({ status: result.success ? 'ok' : 'error', imageUrl, ...result }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
