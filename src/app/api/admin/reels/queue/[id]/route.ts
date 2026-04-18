/**
 * PATCH /api/admin/reels/queue/[id]
 *
 * Atualiza um reel da fila:
 *   - Editar título/descrição/hashtags antes de publicar
 *   - Agendar: action=schedule (chama scheduler.computeNextSlot)
 *   - Reagendar: action=schedule com scheduledFor ISO string
 *   - Cancelar: action=cancel → status='failed' com error_message="cancelado"
 *   - Publicar agora: action=publish_now (agenda para now+10s)
 *
 * Auth: ADMIN_SECRET
 * Body:
 *   { action: 'update_copy' | 'schedule' | 'cancel' | 'publish_now',
 *     title?, description?, hashtags_instagram?, hashtags_youtube?,
 *     scheduledFor? (ISO) }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { computeNextSlot } from '@/lib/reels/scheduler';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return false;
}

type PatchBody = {
  action: 'update_copy' | 'schedule' | 'cancel' | 'publish_now';
  title?: string;
  description?: string;
  hashtags_instagram?: string[];
  hashtags_youtube?: string[];
  scheduledFor?: string;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const admin = getAdminClient();

  if (body.action === 'update_copy') {
    const updates: Record<string, unknown> = {};
    if (typeof body.title === 'string') updates.title = body.title;
    if (typeof body.description === 'string') updates.description = body.description;
    if (Array.isArray(body.hashtags_instagram)) updates.hashtags_instagram = body.hashtags_instagram;
    if (Array.isArray(body.hashtags_youtube)) updates.hashtags_youtube = body.hashtags_youtube;
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Nada para atualizar' }, { status: 400 });
    }
    const { data, error } = await admin
      .from('reels_queue')
      .update(updates)
      .eq('id', params.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reel: data });
  }

  if (body.action === 'schedule') {
    let scheduled: Date;
    if (body.scheduledFor) {
      scheduled = new Date(body.scheduledFor);
      if (isNaN(scheduled.getTime())) {
        return NextResponse.json({ error: 'scheduledFor inválido' }, { status: 400 });
      }
    } else {
      scheduled = await computeNextSlot(admin);
    }
    const { data, error } = await admin
      .from('reels_queue')
      .update({ status: 'scheduled', scheduled_for: scheduled.toISOString() })
      .eq('id', params.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reel: data });
  }

  if (body.action === 'publish_now') {
    const in10s = new Date(Date.now() + 10_000);
    const { data, error } = await admin
      .from('reels_queue')
      .update({ status: 'scheduled', scheduled_for: in10s.toISOString() })
      .eq('id', params.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reel: data });
  }

  if (body.action === 'cancel') {
    const { data, error } = await admin
      .from('reels_queue')
      .update({ status: 'failed', error_message: 'cancelado pelo admin' })
      .eq('id', params.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ reel: data });
  }

  return NextResponse.json({ error: 'action inválida' }, { status: 400 });
}
