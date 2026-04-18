import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { store } from '@/lib/store';
import { correctContract } from '@/lib/ai/corrector';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessContract } from '@/lib/auth/contract-access';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Rate limiting: 5 correções por hora por IP
  const ip = getClientIp(request);
  const rl = await checkRateLimit({ name: 'correct', key: ip, maxRequests: 5, windowSeconds: 3600 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas correções em pouco tempo. Tente novamente em alguns minutos.', code: 'RATE_LIMITED' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  // Ler cláusulas solicitadas pelo usuário (opcional)
  const body = await request.json().catch(() => ({}));
  const requestedClauses = Array.isArray(body?.requested_clauses) ? body.requested_clauses : [];

  const [contract, user] = await Promise.all([
    store.getContract(params.id),
    getCurrentUser(),
  ]);

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  if (!canAccessContract(contract.user_id, user?.id)) {
    return NextResponse.json(
      { error: 'Acesso negado.', code: 'FORBIDDEN' },
      { status: 403 }
    );
  }

  // Se já foi corrigido, retorna direto
  if (contract.correction_result) {
    return NextResponse.json({ status: 'corrected' });
  }

  // Permitir re-disparar se status ficou preso em 'correcting' por mais de 5 minutos
  const stuckInCorrecting =
    contract.status === 'correcting' &&
    contract.created_at &&
    Date.now() - new Date(contract.created_at).getTime() > 5 * 60 * 1000;

  if (contract.status !== 'analyzed' && !stuckInCorrecting) {
    return NextResponse.json(
      { error: 'O contrato precisa ser analisado antes de ser corrigido.', code: 'NOT_ANALYZED' },
      { status: 400 }
    );
  }

  // Disparar correção em background
  await store.updateContract(params.id, { status: 'correcting' });

  const backgroundTask = processCorrection(params.id, requestedClauses).catch(async (err) => {
    console.error(`Erro na correção do contrato ${params.id}:`, err);
    await store.updateContract(params.id, {
      status: 'analyzed',
      error_message: `Erro na correção: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
    });
  });
  waitUntil(backgroundTask);

  return NextResponse.json({ status: 'correcting' }, { status: 202 });
}

async function processCorrection(
  contractId: string,
  requestedClauses?: { description: string; importance: string; legal_basis: string }[]
) {
  const contract = await store.getContract(contractId);
  if (!contract) throw new Error('Contrato não encontrado');

  console.log(`[Correção] Iniciando correção do contrato ${contractId}${requestedClauses?.length ? ` (+${requestedClauses.length} cláusulas solicitadas)` : ''}...`);
  const start = Date.now();

  const { correction, usage } = await correctContract(
    contract.original_text,
    contract.analysis_result,
    requestedClauses
  );

  const elapsed = Math.round((Date.now() - start) / 1000);
  console.log(`[Correção] Contrato ${contractId} corrigido em ${elapsed}s (${usage.tokensOutput} tokens)`);

  await store.updateContract(contractId, {
    status: 'corrected',
    correction_result: {
      ...correction,
      usage,
    },
    error_message: null,
  });
}
