/**
 * Scheduler — calcula o próximo slot de publicação.
 *
 * Política atual (decisão do usuário):
 *   - Instagram Reels + Facebook Reels: terça e sexta às 19:00 BRT
 *   - YouTube Shorts: terça e sexta às 20:00 BRT (publicado 1h depois do IG/FB)
 *
 * O cron /api/cron/reels-publish roda 19:00 BRT (22:00 UTC) ter/sex e pega
 * reels com status='scheduled' e scheduled_for <= now.
 *
 * Este módulo calcula o `scheduled_for` na hora em que o usuário aprova
 * um reel em /admin/reels/queue. Retorna a PRÓXIMA terça ou sexta 19h BRT
 * livre (sem outro reel com status='scheduled' no mesmo slot).
 */

import type { SupabaseClient } from '@supabase/supabase-js';

const BRT_OFFSET_MINUTES = -180;   // BRT é UTC-3

/**
 * Retorna o próximo slot terça ou sexta 19h BRT que ainda não tem reel agendado.
 *
 * @param admin - client Supabase admin
 * @param from - data de referência (default: agora)
 * @returns Date em UTC correspondente ao slot escolhido
 */
export async function computeNextSlot(
  admin: SupabaseClient,
  from: Date = new Date()
): Promise<Date> {
  // Buscar slots já ocupados (scheduled ou posting)
  const { data: occupied } = await admin
    .from('reels_queue')
    .select('scheduled_for')
    .in('status', ['scheduled', 'posting'])
    .gte('scheduled_for', from.toISOString());

  const occupiedSet = new Set(
    (occupied ?? []).map((r) => (r.scheduled_for ? new Date(r.scheduled_for as string).toISOString() : ''))
  );

  // Procurar o próximo slot livre até 90 dias à frente
  for (let offset = 0; offset < 90; offset++) {
    const candidate = nthFutureTueFriAt19Brt(from, offset);
    if (!candidate) continue;
    if (!occupiedSet.has(candidate.toISOString())) {
      return candidate;
    }
  }
  throw new Error('Nenhum slot livre nos próximos 90 dias');
}

/**
 * Retorna o N-ésimo slot futuro (contando 0 = primeiro slot >= from)
 * nas terças e sextas às 19:00 BRT.
 */
export function nthFutureTueFriAt19Brt(from: Date, n: number): Date | null {
  // Começa do dia de `from` e avança dia a dia até achar N slots válidos
  let count = 0;
  const cursor = new Date(from);
  for (let i = 0; i < 365; i++) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() + i);

    // Construir o ponto "19:00 BRT" naquele dia em UTC.
    // 19:00 BRT = 22:00 UTC
    const slotUtc = new Date(
      Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 22, 0, 0, 0)
    );

    // Se o slot já passou (<= from), pular
    if (slotUtc <= from) continue;

    // Descobrir o dia da semana em BRT (aplicar offset)
    const brtDay = new Date(slotUtc.getTime() + BRT_OFFSET_MINUTES * 60_000);
    const dow = brtDay.getUTCDay(); // 0=dom, 1=seg, 2=ter, 3=qua, 4=qui, 5=sex, 6=sab

    if (dow === 2 || dow === 5) {
      if (count === n) return slotUtc;
      count++;
    }
  }
  return null;
}

/**
 * Pretty-print de um Date em BRT para UI.
 */
export function formatBrt(date: Date): string {
  return date.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'short',
    timeStyle: 'short',
  });
}
