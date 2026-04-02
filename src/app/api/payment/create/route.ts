import { NextRequest, NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { isBillingEnabled } from '@/config/constants';
import { createPreference, PRICES } from '@/lib/payment/mercadopago';

/**
 * POST /api/payment/create
 * Cria sessão de pagamento no Mercado Pago para download do contrato corrigido.
 *
 * Body: { contractId: string }
 * Returns: { paymentUrl: string, paymentId: string }
 *
 * Se billing estiver desabilitado (beta), retorna 200 com download liberado.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { contractId } = body;

    if (!contractId) {
      return NextResponse.json(
        { error: 'contractId é obrigatório.', code: 'MISSING_FIELD' },
        { status: 400 }
      );
    }

    const contract = await store.getContract(contractId);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contrato não encontrado.', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (contract.status !== 'corrected' || !contract.correction_result) {
      return NextResponse.json(
        { error: 'O contrato precisa ser corrigido antes do pagamento.', code: 'NOT_CORRECTED' },
        { status: 400 }
      );
    }

    // Beta: billing desabilitado — download é grátis
    if (!isBillingEnabled()) {
      return NextResponse.json({
        free: true,
        message: 'Download gratuito na versão beta.',
      });
    }

    // Produção: criar preferência de pagamento no Mercado Pago
    const amountCents = PRICES.corrected_contract;
    const contractType = contract.contract_type || 'Contrato';

    const result = await createPreference({
      contractId,
      product: 'corrected_contract',
      title: `Contrato Corrigido — ${contractType}`,
      amountCents,
    });

    return NextResponse.json({
      paymentUrl: result.paymentUrl,
      paymentId: result.preferenceId,
      amount: amountCents,
      currency: 'BRL',
    });
  } catch (err) {
    console.error('[Payment Create] Erro:', err);
    return NextResponse.json(
      { error: 'Erro ao criar pagamento.', code: 'PAYMENT_ERROR' },
      { status: 500 }
    );
  }
}
