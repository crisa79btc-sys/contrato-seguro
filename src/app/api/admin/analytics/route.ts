import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

function authorized(request: NextRequest): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  // Aceita via query param ou header Authorization
  const fromQuery = request.nextUrl.searchParams.get('secret');
  if (fromQuery === secret) return true;

  const authHeader = request.headers.get('authorization');
  if (authHeader === `Bearer ${secret}`) return true;

  return false;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) {
    return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  }

  try {
    const db = getAdminClient();

    // Executar queries em paralelo
    const [
      contractsRes,
      analysesRes,
      correctionsRes,
      last7Res,
      last30Res,
      byDayRes,
      byTypeRes,
      costAnalysesRes,
      costCorrectionsRes,
      avgScoreRes,
      avgTimeRes,
      recentRes,
    ] = await Promise.all([
      // Total contratos
      db.from('contracts').select('*', { count: 'exact', head: true }),
      // Total análises
      db.from('analyses').select('*', { count: 'exact', head: true }),
      // Total correções
      db.from('corrected_contracts').select('*', { count: 'exact', head: true }),
      // Últimos 7 dias
      db.from('contracts').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 7 * 86400000).toISOString()),
      // Últimos 30 dias
      db.from('contracts').select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
      // Contratos por dia (últimos 30 dias)
      db.from('contracts')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString())
        .order('created_at', { ascending: true }),
      // Contratos por tipo
      db.from('contracts')
        .select('contract_type'),
      // Custo análises
      db.from('analyses')
        .select('ai_tokens_input, ai_tokens_output, estimated_cost_usd'),
      // Custo correções
      db.from('corrected_contracts')
        .select('ai_tokens_input, ai_tokens_output, estimated_cost_usd'),
      // Score médio
      db.from('analyses')
        .select('risk_score'),
      // Tempo médio processamento
      db.from('analyses')
        .select('processing_time_ms'),
      // 10 contratos mais recentes
      db.from('contracts')
        .select('id, original_filename, contract_type, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    // Agregar por dia
    const byDay: Record<string, number> = {};
    if (byDayRes.data) {
      for (const row of byDayRes.data) {
        const day = row.created_at.slice(0, 10); // YYYY-MM-DD
        byDay[day] = (byDay[day] || 0) + 1;
      }
    }

    // Agregar por tipo
    const byType: Record<string, number> = {};
    if (byTypeRes.data) {
      for (const row of byTypeRes.data) {
        const type = row.contract_type || 'nao_classificado';
        byType[type] = (byType[type] || 0) + 1;
      }
    }

    // Somar custos e tokens
    let totalTokensInput = 0;
    let totalTokensOutput = 0;
    let totalCostUsd = 0;

    for (const rows of [costAnalysesRes.data, costCorrectionsRes.data]) {
      if (rows) {
        for (const row of rows) {
          totalTokensInput += row.ai_tokens_input || 0;
          totalTokensOutput += row.ai_tokens_output || 0;
          totalCostUsd += parseFloat(row.estimated_cost_usd) || 0;
        }
      }
    }

    // Score médio
    let avgRiskScore = 0;
    if (avgScoreRes.data && avgScoreRes.data.length > 0) {
      const scores = avgScoreRes.data.map((r: { risk_score: number }) => r.risk_score).filter(Boolean);
      avgRiskScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
    }

    // Tempo médio
    let avgProcessingTimeMs = 0;
    if (avgTimeRes.data && avgTimeRes.data.length > 0) {
      const times = avgTimeRes.data.map((r: { processing_time_ms: number }) => r.processing_time_ms).filter(Boolean);
      avgProcessingTimeMs = times.length > 0 ? Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length) : 0;
    }

    return NextResponse.json({
      totalContracts: contractsRes.count || 0,
      totalAnalyses: analysesRes.count || 0,
      totalCorrections: correctionsRes.count || 0,
      last7Days: last7Res.count || 0,
      last30Days: last30Res.count || 0,
      totalTokensInput,
      totalTokensOutput,
      totalCostUsd: Math.round(totalCostUsd * 10000) / 10000,
      avgRiskScore,
      avgProcessingTimeMs,
      byDay,
      byType,
      recent: recentRes.data || [],
    });
  } catch (err) {
    console.error('[Admin Analytics] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao buscar analytics.' },
      { status: 500 }
    );
  }
}
