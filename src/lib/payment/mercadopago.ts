/**
 * Integração com Mercado Pago — Checkout Pro.
 * Cria preferência de pagamento e valida webhooks.
 *
 * Variáveis de ambiente necessárias:
 *   MERCADOPAGO_ACCESS_TOKEN  — token de produção (ou sandbox)
 *   NEXT_PUBLIC_APP_URL       — URL base para callbacks
 *
 * Docs: https://www.mercadopago.com.br/developers/pt/reference/preferences/_checkout_preferences/post
 */

const BASE_URL = 'https://api.mercadopago.com';

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado');
  return token;
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';
}

// Preços em centavos (BRL) — sincronizado com docs/database/001_initial_schema.sql
export const PRICES: Record<string, number> = {
  corrected_contract: 990, // R$ 9,90
};

export type PreferenceInput = {
  contractId: string;
  product: string;
  title: string;
  amountCents: number;
};

export type PreferenceResult = {
  preferenceId: string;
  paymentUrl: string; // init_point (produção) ou sandbox_init_point
};

/**
 * Cria uma preferência de pagamento no Mercado Pago (Checkout Pro).
 * O comprador é redirecionado para a URL retornada.
 */
export async function createPreference(input: PreferenceInput): Promise<PreferenceResult> {
  const appUrl = getAppUrl();

  const body = {
    items: [
      {
        id: input.contractId,
        title: input.title,
        description: `Download do contrato corrigido — ${input.title}`,
        quantity: 1,
        currency_id: 'BRL',
        unit_price: input.amountCents / 100, // MP usa reais, não centavos
      },
    ],
    back_urls: {
      success: `${appUrl}/analise/${input.contractId}?payment=success`,
      failure: `${appUrl}/analise/${input.contractId}?payment=failure`,
      pending: `${appUrl}/analise/${input.contractId}?payment=pending`,
    },
    auto_return: 'approved' as const,
    external_reference: `${input.contractId}:${input.product}`,
    notification_url: `${appUrl}/api/payment/webhook`,
    statement_descriptor: 'ContratoSeguro',
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
  };

  const res = await fetch(`${BASE_URL}/checkout/preferences`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAccessToken()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('[MercadoPago] Erro ao criar preferência:', err);
    throw new Error(`Erro ao criar pagamento: ${res.status}`);
  }

  const data = await res.json();

  return {
    preferenceId: data.id,
    paymentUrl: data.init_point, // sandbox_init_point em sandbox
  };
}

/**
 * Consulta detalhes de um pagamento pelo ID recebido no webhook.
 */
export async function getPaymentDetails(paymentId: string) {
  const res = await fetch(`${BASE_URL}/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  if (!res.ok) {
    console.error('[MercadoPago] Erro ao consultar pagamento:', res.status);
    return null;
  }

  return res.json();
}

/**
 * Mapeia status do Mercado Pago para status interno.
 */
export function mapPaymentStatus(mpStatus: string): 'pending' | 'completed' | 'failed' | 'refunded' {
  const map: Record<string, 'pending' | 'completed' | 'failed' | 'refunded'> = {
    approved: 'completed',
    authorized: 'pending',
    pending: 'pending',
    in_process: 'pending',
    in_mediation: 'pending',
    rejected: 'failed',
    cancelled: 'failed',
    refunded: 'refunded',
    charged_back: 'refunded',
  };
  return map[mpStatus] || 'pending';
}
