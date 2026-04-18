/**
 * GET /api/admin/learnings — lista learnings (default: status=pending).
 *
 * Query params:
 *   ?secret=ADMIN_SECRET
 *   ?status=pending|approved|rejected (default: pending)
 *   ?contract_type=aluguel (opcional, filtra por tipo)
 *
 * Usado pelo painel /admin/learnings.
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

  const status = request.nextUrl.searchParams.get('status') ?? 'pending';
  const contractType = request.nextUrl.searchParams.get('contract_type');

  const admin = getAdminClient();
  let query = admin
    .from('analyzer_learnings')
    .select('id, contract_type, pattern, source_sample, status, created_at, reviewed_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (status !== 'all') query = query.eq('status', status);
  if (contractType) query = query.eq('contract_type', contractType);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ learnings: data ?? [] });
}
