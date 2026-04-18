/**
 * GET /api/cron/reels-metrics
 *
 * Vercel Cron — diário. Atualiza views/likes/comments/shares dos reels postados
 * nos últimos 30 dias.
 *
 * Auth: CRON_SECRET (padrão Vercel).
 *
 * Configurado em vercel.json: `"30 12 * * *"` → /api/cron/reels-metrics
 * (após o cron social das 12h).
 *
 * TODO-Sonnet:
 *   Implementar fetchers para cada plataforma (funções plainas, sem SDK):
 *
 *   INSTAGRAM (Graph API):
 *     GET /{ig-media-id}/insights?metric=plays,likes,comments,saved
 *         &access_token={token}
 *     ou mais simples:
 *     GET /{ig-media-id}?fields=like_count,comments_count,media_url&access_token=...
 *
 *   FACEBOOK (Graph API):
 *     GET /{video-id}?fields=post_impressions,likes.summary(true),comments.summary(true),shares&access_token=...
 *     ou
 *     GET /{video-id}/video_insights?metric=total_video_views,total_video_reactions_by_type_total
 *
 *   YOUTUBE (Data API v3):
 *     GET https://www.googleapis.com/youtube/v3/videos?part=statistics&id={videoId}&key={apiKey}
 *     → statistics.viewCount, likeCount, commentCount
 *
 *   Atualizar reels_posts:
 *     UPDATE reels_posts SET views=..., likes=..., comments=..., shares=...,
 *            last_metrics_at=NOW() WHERE id=...
 *
 * Este arquivo já carrega os posts e agrupa — só falta implementar os 3 fetchers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import type { Platform, ReelPostRow } from '@/lib/reels/types';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

function authorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization');
  if (auth === `Bearer ${secret}`) return true;
  const ua = request.headers.get('user-agent') ?? '';
  return ua.toLowerCase().startsWith('vercel-cron');
}

type Metrics = {
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
};

async function fetchInstagramMetrics(mediaId: string): Promise<Metrics> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) return {};
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${mediaId}?fields=like_count,comments_count&access_token=${token}`
    );
    const data = (await res.json()) as { like_count?: number; comments_count?: number };
    return { likes: data.like_count, comments: data.comments_count };
    // TODO-Sonnet: adicionar /insights?metric=plays para views quando o token
    // tiver permissão "instagram_manage_insights".
  } catch {
    return {};
  }
}

async function fetchFacebookMetrics(videoId: string): Promise<Metrics> {
  const token = process.env.META_PAGE_ACCESS_TOKEN;
  if (!token) return {};
  try {
    const res = await fetch(
      `https://graph.facebook.com/v21.0/${videoId}?fields=likes.summary(true),comments.summary(true)&access_token=${token}`
    );
    const data = (await res.json()) as {
      likes?: { summary?: { total_count?: number } };
      comments?: { summary?: { total_count?: number } };
    };
    return {
      likes: data.likes?.summary?.total_count,
      comments: data.comments?.summary?.total_count,
    };
    // TODO-Sonnet: buscar views via /{videoId}/video_insights
    //   ?metric=total_video_views
  } catch {
    return {};
  }
}

async function fetchYoutubeMetrics(videoId: string): Promise<Metrics> {
  // YouTube permite leitura pública de statistics com uma API Key simples.
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) return {};
  try {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=statistics&id=${videoId}&key=${key}`
    );
    const data = (await res.json()) as {
      items?: Array<{ statistics?: { viewCount?: string; likeCount?: string; commentCount?: string } }>;
    };
    const s = data.items?.[0]?.statistics;
    return {
      views: s?.viewCount ? Number(s.viewCount) : undefined,
      likes: s?.likeCount ? Number(s.likeCount) : undefined,
      comments: s?.commentCount ? Number(s.commentCount) : undefined,
    };
  } catch {
    return {};
  }
}

const FETCHERS: Record<Platform, (id: string) => Promise<Metrics>> = {
  instagram: fetchInstagramMetrics,
  facebook: fetchFacebookMetrics,
  youtube: fetchYoutubeMetrics,
};

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = getAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const { data: posts, error } = await admin
    .from('reels_posts')
    .select('*')
    .not('platform_post_id', 'is', null)
    .gte('posted_at', thirtyDaysAgo);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!posts) return NextResponse.json({ updated: 0 });

  let updated = 0;
  for (const post of posts as ReelPostRow[]) {
    if (!post.platform_post_id) continue;
    const metrics = await FETCHERS[post.platform](post.platform_post_id);
    if (Object.keys(metrics).length === 0) continue;

    await admin
      .from('reels_posts')
      .update({
        views: metrics.views ?? post.views,
        likes: metrics.likes ?? post.likes,
        comments: metrics.comments ?? post.comments,
        shares: metrics.shares ?? post.shares,
        last_metrics_at: new Date().toISOString(),
      })
      .eq('id', post.id);
    updated++;
  }

  return NextResponse.json({ updated, total: posts.length });
}
