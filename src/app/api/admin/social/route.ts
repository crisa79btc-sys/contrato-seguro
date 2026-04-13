/**
 * Endpoint admin para visibilidade do sistema de postagem social.
 * Retorna histórico, previsão do calendário e próxima data especial.
 * Protegido por ADMIN_SECRET.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { DAY_OF_WEEK_CALENDAR, SPECIAL_DATES } from '@/lib/social/topics';
import type { PostHistoryEntry } from '@/lib/social/types';

export const dynamic = 'force-dynamic';

const DAY_NAMES = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;
  const fromQuery = request.nextUrl.searchParams.get('secret');
  if (fromQuery === secret) return true;
  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;
  return false;
}

async function getPostHistory(): Promise<PostHistoryEntry[]> {
  try {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'social_post_history')
      .single();
    return (data?.value as PostHistoryEntry[]) || [];
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Histórico dos últimos 7 posts
  const history = await getPostHistory();
  const recentHistory = history.slice(0, 7);

  // Previsão dos próximos 7 dias
  const today = new Date();
  const nextPosts = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dow = d.getDay();
    const dateMD = d.toISOString().slice(5, 10);
    const dateStr = d.toISOString().split('T')[0];
    const special = SPECIAL_DATES[dateMD];
    const preferred = DAY_OF_WEEK_CALENDAR[dow];
    return {
      date: dateStr,
      dayName: DAY_NAMES[dow],
      category: special ? special.category : preferred.category,
      type: special ? special.type : preferred.type,
      isSpecial: !!special,
      specialHint: special?.hint || null,
    };
  });

  // Próxima data especial
  let nextSpecialDate: { date: string; hint: string } | null = null;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const dateMD = d.toISOString().slice(5, 10);
    const special = SPECIAL_DATES[dateMD];
    if (special) {
      nextSpecialDate = { date: d.toISOString().split('T')[0], hint: special.hint };
      break;
    }
  }

  return NextResponse.json({
    history: recentHistory,
    nextPosts,
    nextSpecialDate,
  });
}

/**
 * POST — força execução imediata do cron de postagem.
 * Só funciona se CRON_SECRET estiver configurado.
 */
export async function POST(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET não configurado' }, { status: 500 });
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();
  const cronUrl = `${appUrl}/api/cron/social?force=true`;

  try {
    const res = await fetch(cronUrl, {
      method: 'GET',
      headers: { Authorization: `Bearer ${cronSecret}` },
    });
    const data = await res.json();
    return NextResponse.json({ triggered: true, cronResponse: data }, { status: res.status });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
