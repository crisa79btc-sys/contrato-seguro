/**
 * GET /api/admin/reels/queue
 *
 * Lista reels da fila com filtros. Usado pelo painel /admin/reels/queue.
 *
 * Auth: ADMIN_SECRET
 * Query:
 *   ?status=uploaded|transcribing|processing|ready|scheduled|posting|posted|failed|all
 *   ?limit=50 (default)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = request.nextUrl.searchParams.get('status') ?? 'all';
  const limitParam = request.nextUrl.searchParams.get('limit');
  const limit = Math.min(200, Math.max(1, Number(limitParam ?? 50) || 50));

  const admin = getAdminClient();
  let query = admin
    .from('reels_queue')
    .select('*, reels_posts(*)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status !== 'all') query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reels: data ?? [] });
}
