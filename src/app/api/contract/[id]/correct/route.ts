import { NextRequest, NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { store } from '@/lib/store';
import { correctContract } from '@/lib/ai/corrector';

export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const contract = await store.getContract(params.id);

  if (!contract) {
    return NextResponse.json(
      { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
      { status: 404 }
    );
  }

  if (contract.status !== 'analyzed') {
    return NextResponse.json(
      { error: 'O contrato precisa ser analisado antes de ser corrigido.', code: 'NOT_ANALYZED' },
      { status: 400 }
    );
  }

  // Se já foi corrigido, retorna direto
  if (contract.correction_result) {
    return NextResponse.json({ status: 'corrected' });
  }

  // Disparar correção em background
  await store.updateContract(params.id, { status: 'correcting' });

  const backgroundTask = processCorrection(params.id).catch(async (err) => {
    console.error(`Erro na correção do contrato ${params.id}:`, err);
    await store.updateContract(params.id, {
      status: 'analyzed',
      error_message: `Erro na correção: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
    });
  });
  waitUntil(backgroundTask);

  return NextResponse.json({ status: 'correcting' }, { status: 202 });
}

async function processCorrection(contractId: string) {
  const contract = await store.getContract(contractId);
  if (!contract) throw new Error('Contrato não encontrado');

  console.log(`[Correção] Iniciando correção do contrato ${contractId}...`);
  const start = Date.now();

  const { correction, usage } = await correctContract(
    contract.original_text,
    contract.analysis_result
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
