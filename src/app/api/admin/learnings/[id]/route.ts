/**
 * Admin endpoint — aprovar/rejeitar um analyzer_learning.
 *
 * PATCH /api/admin/learnings/[id]
 *   Body: { status: 'approved' | 'rejected' }
 *   Auth: ADMIN_SECRET via query ?secret= ou header Authorization: Bearer
 *
 * GET /api/admin/learnings
 *   Lista learnings pendentes para o painel /admin/learnings.
 *   (Esta rota está em route.ts do diretório pai — ver src/app/api/admin/learnings/route.ts)
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

type PatchBody = { status?: 'approved' | 'rejected' };

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  if (body.status !== 'approved' && body.status !== 'rejected') {
    return NextResponse.json(
      { error: 'status deve ser "approved" ou "rejected"' },
      { status: 400 }
    );
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('analyzer_learnings')
    .update({
      status: body.status,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', params.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ learning: data });
}
