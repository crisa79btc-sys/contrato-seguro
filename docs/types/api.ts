// ============================================================================
// ContratoSeguro - Tipos das API Routes
// Request/Response para todas as rotas do Next.js App Router
// ============================================================================

import type {
  Analysis,
  AnalysisTier,
  ClauseAnalysis,
  CorrectedContract,
  FileFormat,
  PaymentProduct,
  PaymentProvider,
  PaymentStatus,
  UUID,
  ISOTimestamp,
} from './database';

// ---------------------------------------------------------------------------
// Upload
// ---------------------------------------------------------------------------

/**
 * Request de upload de contrato.
 * Enviado como multipart/form-data.
 * O campo `file` e do tipo File (PDF ou DOCX).
 */
export type UploadRequest = {
  file: File;
};

/** Resposta apos upload bem-sucedido */
export type UploadResponse = {
  contractId: UUID;
  status: string;
};

// ---------------------------------------------------------------------------
// Analise
// ---------------------------------------------------------------------------

/** Request para iniciar analise de um contrato */
export type AnalyzeRequest = {
  contractId: UUID;
  tier: AnalysisTier;
};

/**
 * Resposta da analise.
 * No tier 'free', apenas as 3 clausulas mais criticas sao retornadas.
 */
export type AnalyzeResponse = {
  analysis: Analysis;
  clauses: ClauseAnalysis[];
};

// ---------------------------------------------------------------------------
// Correcao
// ---------------------------------------------------------------------------

/** Request para gerar versao corrigida do contrato */
export type CorrectRequest = {
  contractId: UUID;
};

/** Resposta com o contrato corrigido */
export type CorrectResponse = {
  correctedContract: CorrectedContract;
};

// ---------------------------------------------------------------------------
// Geracao de Documento
// ---------------------------------------------------------------------------

/** Request para gerar documento formatado (DOCX ou PDF) */
export type GenerateDocRequest = {
  contractId: UUID;
  format: FileFormat;
};

/** Resposta com URL temporaria para download */
export type GenerateDocResponse = {
  downloadUrl: string;
  expires_at: ISOTimestamp;
};

// ---------------------------------------------------------------------------
// Pagamento
// ---------------------------------------------------------------------------

/** Request para criar uma sessao de pagamento */
export type PaymentCreateRequest = {
  contractId: UUID;
  product: PaymentProduct;
};

/** Resposta com URL de redirecionamento para o gateway de pagamento */
export type PaymentCreateResponse = {
  paymentUrl: string;
  paymentId: UUID;
};

/**
 * Payload do webhook do Mercado Pago.
 * Documentacao: https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
 */
export type PaymentWebhookPayload = {
  id: number;
  live_mode: boolean;
  type: 'payment' | 'plan' | 'subscription' | 'invoice';
  date_created: ISOTimestamp;
  user_id: number;
  api_version: string;
  action: string;
  data: {
    id: string;
  };
};

/**
 * Detalhes do pagamento retornados pela API do Mercado Pago
 * ao consultar o pagamento pelo ID recebido no webhook.
 */
export type MercadoPagoPaymentDetail = {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  description: string;
  payer: {
    id: number | null;
    email: string | null;
  };
  metadata: Record<string, unknown>;
  external_reference: string | null;
  date_approved: ISOTimestamp | null;
  date_created: ISOTimestamp;
};

/** Mapeamento de status do Mercado Pago para status interno */
export type MercadoPagoStatusMap = {
  approved: 'completed';
  rejected: 'failed';
  cancelled: 'failed';
  refunded: 'refunded';
  charged_back: 'refunded';
  pending: 'pending';
  authorized: 'pending';
  in_process: 'pending';
  in_mediation: 'pending';
};

// ---------------------------------------------------------------------------
// Erro padrao
// ---------------------------------------------------------------------------

/**
 * Resposta de erro padronizada para todas as API Routes.
 * Formato flat (nao aninhado). O campo `code` segue o padrao UPPER_SNAKE_CASE (ex: CONTRACT_NOT_FOUND).
 */
export type ErrorResponse = {
  error: string;
  code: string;
  details?: string;
};

// ---------------------------------------------------------------------------
// Helpers genericos para API Routes
// ---------------------------------------------------------------------------

/** Wrapper para respostas paginadas */
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

/** Parametros comuns de paginacao */
export type PaginationParams = {
  page?: number;
  pageSize?: number;
};

/** Resposta de sucesso generica */
export type SuccessResponse<T = void> = T extends void
  ? { success: true }
  : { success: true; data: T };
