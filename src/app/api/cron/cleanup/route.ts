/**
 * Cron job para limpeza de contratos com mais de 7 dias.
 * Cumpre a promessa de privacidade (LGPD) feita na FAQ.
 * Configurado em vercel.json para rodar diariamente às 03:00 UTC (00:00 BRT).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

const RETENTION_DAYS = 7;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  const cutoff = cutoffDate.toISOString();

  // Buscar IDs dos contratos expirados
  const { data: expired, error: fetchError } = await supabase
    .from('contracts')
    .select('id')
    .lt('created_at', cutoff);

  if (fetchError) {
    console.error('[Cleanup] Erro ao buscar contratos expirados:', fetchError.message);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  if (!expired || expired.length === 0) {
    return NextResponse.json({ deleted: 0, message: 'Nenhum contrato expirado' });
  }

  const ids = expired.map((c) => c.id);

  // Deletar nas tabelas dependentes primeiro (FK), depois contracts
  const [delCorrections, delAnalyses, delContracts] = await Promise.all([
    supabase.from('corrected_contracts').delete().in('contract_id', ids),
    supabase.from('analyses').delete().in('contract_id', ids),
    // contracts por último — aguarda as dependentes
    Promise.resolve(null),
  ]);

  if (delCorrections.error) {
    console.error('[Cleanup] Erro ao deletar correções:', delCorrections.error.message);
  }
  if (delAnalyses.error) {
    console.error('[Cleanup] Erro ao deletar análises:', delAnalyses.error.message);
  }

  // Agora deletar contracts
  const { error: delContractsError } = await supabase
    .from('contracts')
    .delete()
    .in('id', ids);

  if (delContractsError) {
    console.error('[Cleanup] Erro ao deletar contratos:', delContractsError.message);
    return NextResponse.json({ error: delContractsError.message }, { status: 500 });
  }

  console.log(`[Cleanup] ${ids.length} contratos expirados removidos (>${RETENTION_DAYS} dias)`);

  return NextResponse.json({
    deleted: ids.length,
    cutoff,
    message: `${ids.length} contratos removidos`,
  });
}
