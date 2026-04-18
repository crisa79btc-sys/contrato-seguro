/**
 * GET /api/cron/reels-publish
 *
 * Vercel Cron — terça e sexta 22:00 UTC (= 19:00 BRT).
 * Publica reels com status='scheduled' e scheduled_for <= now.
 *
 * Para cada reel:
 *   1. status → 'posting'
 *   2. Gerar signed URLs (ou usar URL pública do bucket reels-ready)
 *   3. Chamar os 3 publishers em paralelo:
 *        - publishInstagramReel({ videoUrl, caption, thumbnailUrl })
 *        - publishFacebookReel({ videoUrl, description })
 *        - publishYouTubeShort({ videoUrl, title, description, tags })
 *   4. Para cada PostResult com success=true, UPSERT em reels_posts
 *   5. status → 'posted' se pelo menos 1 plataforma teve sucesso, senão 'failed'
 *
 * Auth: CRON_SECRET (padrão Vercel).
 *
 * Configurado em vercel.json: `"0 22 * * 2,5"` → /api/cron/reels-publish
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { publishInstagramReel } from '@/lib/reels/platforms/instagram';
import { publishFacebookReel } from '@/lib/reels/platforms/facebook';
import { publishYouTubeShort } from '@/lib/reels/platforms/youtube';
import { formatHashtagsInline } from '@/lib/reels/hashtag-optimizer';
import type { PostResult, ReelRow } from '@/lib/reels/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  // Permitir chamadas do próprio Vercel Cron (user-agent vercel-cron/1.0)
  const ua = request.headers.get('user-agent') ?? '';
  return ua.toLowerCase().startsWith('vercel-cron');
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getAdminClient();
  const now = new Date().toISOString();

  // Buscar reels prontos para publicar
  const { data: reels, error } = await admin
    .from('reels_queue')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_for', now)
    .order('scheduled_for', { ascending: true })
    .limit(5);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!reels || reels.length === 0) {
    return NextResponse.json({ published: 0, message: 'Nenhum reel agendado' });
  }

  const results: Array<{ reelId: string; platforms: PostResult[]; success: boolean }> = [];

  for (const reel of reels as ReelRow[]) {
    // Mark as posting
    await admin
      .from('reels_queue')
      .update({ status: 'posting' })
      .eq('id', reel.id);

    if (!reel.ready_storage_path) {
      await admin
        .from('reels_queue')
        .update({ status: 'failed', error_message: 'ready_storage_path ausente' })
        .eq('id', reel.id);
      continue;
    }

    // Build public URLs (bucket reels-ready é público)
    const videoUrl = admin.storage
      .from('reels-ready')
      .getPublicUrl(reel.ready_storage_path).data.publicUrl;

    const thumbnailUrl = reel.thumbnail_path
      ? admin.storage.from('reels-ready').getPublicUrl(reel.thumbnail_path).data.publicUrl
      : undefined;

    const igHashtags = formatHashtagsInline(reel.hashtags_instagram ?? []);
    const ytHashtags = reel.hashtags_youtube ?? [];

    const igCaption = `${reel.title ?? ''}\n\n${reel.description ?? ''}\n\n${igHashtags}`.slice(0, 2200);
    const fbDescription = `${reel.title ?? ''}\n\n${reel.description ?? ''}\n\n${igHashtags}`.slice(0, 2200);

    // Publicar nas 3 plataformas em paralelo
    const [ig, fb, yt] = await Promise.all([
      publishInstagramReel({ videoUrl, caption: igCaption, thumbnailUrl }).catch((e): PostResult => ({
        platform: 'instagram',
        success: false,
        error: e instanceof Error ? e.message : String(e),
      })),
      publishFacebookReel({ videoUrl, description: fbDescription }).catch((e): PostResult => ({
        platform: 'facebook',
        success: false,
        error: e instanceof Error ? e.message : String(e),
      })),
      publishYouTubeShort({
        videoUrl,
        title: `${reel.title ?? 'Contrato Seguro'} #Shorts`.slice(0, 100),
        description: `${reel.description ?? ''}\n\n${igHashtags}`.slice(0, 5000),
        tags: ytHashtags,
      }).catch((e): PostResult => ({
        platform: 'youtube',
        success: false,
        error: e instanceof Error ? e.message : String(e),
      })),
    ]);

    const platformResults = [ig, fb, yt];
    const anySuccess = platformResults.some((r) => r.success);

    // Gravar em reels_posts (UPSERT pelo UNIQUE reel_id+platform)
    const postRows = platformResults.map((r) => ({
      reel_id: reel.id,
      platform: r.platform,
      platform_post_id: r.platformPostId ?? null,
      platform_url: r.platformUrl ?? null,
      posted_at: r.success ? new Date().toISOString() : null,
      error_message: r.success ? null : r.error ?? 'erro desconhecido',
    }));
    await admin.from('reels_posts').upsert(postRows, { onConflict: 'reel_id,platform' });

    await admin
      .from('reels_queue')
      .update({
        status: anySuccess ? 'posted' : 'failed',
        error_message: anySuccess
          ? null
          : 'Nenhuma plataforma publicou: ' + platformResults.map((r) => `${r.platform}=${r.error}`).join(' | '),
      })
      .eq('id', reel.id);

    results.push({ reelId: reel.id, platforms: platformResults, success: anySuccess });
  }

  return NextResponse.json({
    published: results.filter((r) => r.success).length,
    total: results.length,
    results,
  });
}
