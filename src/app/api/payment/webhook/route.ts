import { NextRequest, NextResponse } from 'next/server';
import { getPaymentDetails, mapPaymentStatus } from '@/lib/payment/mercadopago';
import { store } from '@/lib/store';

/**
 * POST /api/payment/webhook
 * Webhook do Mercado Pago — chamado automaticamente quando pagamento muda de status.
 *
 * Fluxo:
 * 1. MP envia notificação com type='payment' e data.id
 * 2. Consultamos a API do MP para pegar detalhes do pagamento
 * 3. Se aprovado, marcamos o contrato como 'paid' no store
 * 4. Na próxima vez que o frontend checar, libera download
 *
 * Docs: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // MP envia diferentes tipos de notificação
    if (body.type !== 'payment') {
      return NextResponse.json({ received: true });
    }

    const paymentId = body.data?.id;
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    // Consultar detalhes do pagamento na API do MP (fonte de verdade)
    // Isso garante que o pagamento é real — um atacante não consegue forjar
    // um pagamento aprovado na API oficial do Mercado Pago
    const payment = await getPaymentDetails(String(paymentId));
    if (!payment) {
      console.error('[Webhook] Não conseguiu consultar pagamento:', paymentId);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    // Validar que o notification_url bate com nosso domínio (anti-replay de outro merchant)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
    if (payment.notification_url && !payment.notification_url.startsWith(appUrl)) {
      console.error('[Webhook] notification_url não bate:', payment.notification_url);
      return NextResponse.json({ received: true });
    }

    const status = mapPaymentStatus(payment.status);
    const externalRef = payment.external_reference as string | null;

    if (!externalRef) {
      console.error('[Webhook] Pagamento sem external_reference:', paymentId);
      return NextResponse.json({ received: true });
    }

    // external_reference formato: "contractId:product"
    const [contractId] = externalRef.split(':');

    if (status === 'completed') {
      // Marcar contrato como pago — libera download
      await store.updateContract(contractId, {
        status: 'paid',
      } as Record<string, unknown>);

      console.log(`[Webhook] Pagamento aprovado para contrato ${contractId}`);
    } else if (status === 'failed') {
      console.log(`[Webhook] Pagamento falhou para contrato ${contractId}: ${payment.status}`);
    }

    // Sempre retornar 200 para o MP não reenviar
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Erro:', err);
    // Retornar 200 mesmo com erro para evitar retry infinito do MP
    return NextResponse.json({ received: true });
  }
}
