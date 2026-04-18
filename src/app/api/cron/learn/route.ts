/**
 * Cron semanal — agrega perguntas do chat e extrai padrões de aprendizado.
 *
 * Configurado em vercel.json para rodar aos domingos 03:00 UTC (00:00 BRT).
 * Protegido por CRON_SECRET (header Authorization: Bearer <secret>).
 *
 * Fluxo:
 *   1. Para cada contract_type distinto com chat nos últimos 7 dias:
 *      a. Buscar últimas 50 perguntas de usuário (chat_messages.role='user')
 *         dos contratos daquele tipo.
 *      b. Se < 10 perguntas, pular (ruído).
 *      c. Chamar extractLearnings(contract_type, questions).
 *      d. Inserir patterns em analyzer_learnings com status='pending'.
 *   2. Retornar JSON com summary.
 *
 * Query params suportados:
 *   - dryRun=true: roda mas não persiste (útil para debug manual)
 *
 * Chamada manual para teste:
 *   curl -H "Authorization: Bearer $CRON_SECRET" \
 *     https://contrato-seguro-inky.vercel.app/api/cron/learn?dryRun=true
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/db/supabase';
import { extractLearnings } from '@/lib/ai/learn-from-chat';

export const dynamic = 'force-dynamic';
export const maxDuration = 90;

const LOOKBACK_DAYS = 7;
const MIN_QUESTIONS_PER_TYPE = 10;
const MAX_QUESTIONS_PER_TYPE = 50;

type TypeSummary = {
  contract_type: string;
  questionsAnalyzed: number;
  patternsFound: number;
  tokensInput: number;
  tokensOutput: number;
  error?: string;
};

export async function GET(request: NextRequest) {
  // Auth
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dryRun = request.nextUrl.searchParams.get('dryRun') === 'true';
  const admin = getAdminClient();

  try {
    // 1. Descobrir contract_types com chat recente.
    //    Query: distinct contracts.contract_type onde há chat_messages recentes.
    const since = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000).toISOString();

    // Buscar IDs de contratos com mensagens de usuário nos últimos 7 dias
    const { data: recentMessages, error: msgError } = await admin
      .from('chat_messages')
      .select('contract_id')
      .eq('role', 'user')
      .gte('created_at', since);

    if (msgError) throw new Error(`Falha ao buscar chat_messages: ${msgError.message}`);

    const uniqueContractIds = Array.from(
      new Set((recentMessages ?? []).map((m) => m.contract_id as string))
    );

    if (uniqueContractIds.length === 0) {
      return NextResponse.json({
        status: 'ok',
        message: 'Nenhum chat_message recente. Nada a aprender.',
        typesProcessed: 0,
        dryRun,
      });
    }

    // Buscar contract_type de cada contrato
    const { data: contracts, error: contractsError } = await admin
      .from('contracts')
      .select('id, contract_type')
      .in('id', uniqueContractIds);

    if (contractsError) throw new Error(`Falha ao buscar contracts: ${contractsError.message}`);

    // Agrupar contract_ids por contract_type (ignora null/unknown)
    const contractIdsByType = new Map<string, string[]>();
    for (const c of contracts ?? []) {
      const type = (c.contract_type as string | null) ?? 'outro';
      if (!contractIdsByType.has(type)) contractIdsByType.set(type, []);
      contractIdsByType.get(type)!.push(c.id as string);
    }

    // 2. Para cada tipo, buscar perguntas e extrair padrões
    const summaries: TypeSummary[] = [];

    for (const [contractType, contractIds] of contractIdsByType.entries()) {
      const summary: TypeSummary = {
        contract_type: contractType,
        questionsAnalyzed: 0,
        patternsFound: 0,
        tokensInput: 0,
        tokensOutput: 0,
      };

      try {
        // Buscar perguntas de usuário desses contratos, ordem ASC, limite 50
        const { data: questions, error: qError } = await admin
          .from('chat_messages')
          .select('content')
          .eq('role', 'user')
          .in('contract_id', contractIds)
          .gte('created_at', since)
          .order('created_at', { ascending: true })
          .limit(MAX_QUESTIONS_PER_TYPE);

        if (qError) throw new Error(qError.message);

        const questionTexts = (questions ?? [])
          .map((q) => (q.content as string) ?? '')
          .filter((c) => c.length > 5);

        summary.questionsAnalyzed = questionTexts.length;

        if (questionTexts.length < MIN_QUESTIONS_PER_TYPE) {
          summary.error = `Apenas ${questionTexts.length} perguntas (mínimo ${MIN_QUESTIONS_PER_TYPE}). Pulando.`;
          summaries.push(summary);
          continue;
        }

        // Extrair padrões via Claude
        const result = await extractLearnings(contractType, questionTexts);
        summary.patternsFound = result.patterns.length;
        summary.tokensInput = result.tokensInput;
        summary.tokensOutput = result.tokensOutput;

        // Persistir se não for dryRun
        if (!dryRun && result.patterns.length > 0) {
          const rows = result.patterns.map((p) => ({
            contract_type: contractType,
            pattern: p.pattern,
            source_sample: { questions: p.sample_questions },
            status: 'pending',
          }));
          const { error: insertError } = await admin
            .from('analyzer_learnings')
            .insert(rows);
          if (insertError) {
            summary.error = `Falha ao inserir: ${insertError.message}`;
          }
        }
      } catch (err) {
        summary.error = err instanceof Error ? err.message : 'Erro desconhecido';
        console.error(`[Learn Cron] Erro em ${contractType}:`, err);
      }

      summaries.push(summary);
    }

    return NextResponse.json(
      {
        status: 'ok',
        dryRun,
        typesProcessed: summaries.length,
        totalPatternsFound: summaries.reduce((s, t) => s + t.patternsFound, 0),
        summaries,
      },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Learn Cron] Erro fatal:', err);
    return NextResponse.json({ status: 'error', error: msg }, { status: 500 });
  }
}
