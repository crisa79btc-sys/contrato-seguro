// ============================================================================
// ContratoSeguro - Re-export centralizado de todos os tipos
// Uso: import type { Contract, AnalyzeRequest, AIAnalysisOutput } from '@/types';
// ============================================================================

export type {
  // Enums
  ContractType,
  ContractStatus,
  RiskLevel,
  ClauseCategory,
  AnalysisTier,
  PaymentProduct,
  PaymentStatus,
  PaymentProvider,
  UserPlan,
  FileFormat,

  // Tipos auxiliares
  UUID,
  ISOTimestamp,

  // Tabelas (Row)
  User,
  Contract,
  Analysis,
  ClauseAnalysis,
  CorrectedContract,
  Payment,
  ContractTemplate,
  AuditLog,
  AppConfig,

  // Tabelas (Insert)
  UserInsert,
  ContractInsert,
  AnalysisInsert,
  ClauseAnalysisInsert,
  CorrectedContractInsert,
  PaymentInsert,
  ContractTemplateInsert,
  AuditLogInsert,
  AppConfigInsert,

  // Tabelas (Update)
  UserUpdate,
  ContractUpdate,
  AnalysisUpdate,
  ClauseAnalysisUpdate,
  CorrectedContractUpdate,
  PaymentUpdate,
  ContractTemplateUpdate,
  AppConfigUpdate,

  // Schema helper
  Database,
} from './database';

export type {
  // Upload
  UploadRequest,
  UploadResponse,

  // Análise
  AnalyzeRequest,
  AnalyzeResponse,

  // Correção
  CorrectRequest,
  CorrectResponse,

  // Documento
  GenerateDocRequest,
  GenerateDocResponse,

  // Pagamento
  PaymentCreateRequest,
  PaymentCreateResponse,
  PaymentWebhookPayload,
  MercadoPagoPaymentDetail,
  MercadoPagoStatusMap,

  // Erro
  ErrorResponse,

  // Helpers
  PaginatedResponse,
  PaginationParams,
  SuccessResponse,
} from './api';

export type {
  // Classificador
  AIClassifierInput,
  AIClassifierOutput,

  // Análise IA
  AIAnalysisInput,
  AIAnalysisOutput,
  AIAnalysisOutputFree,
  AIAnalysisMetadata,
  AIParty,
  AIClauseResult,
  AICriteriaScores,
  AIMissingClause,
  AIGlobalScore,
  AITopIssue,

  // Correção IA
  AICorrectionInput,
  AICorrectionOutput,
  AICorrectionChange,
  AICorrectionStats,
  AILegalNote,

  // Negociação IA
  AINegotiationInput,
  AINegotiationOutput,
  AINegotiationContext,
  AINegotiationPreparation,
  AINegotiationOpening,
  AINegotiationPoint,
  AINegotiationTradeCoin,
  AINegotiationClosing,
  AINegotiationPlanB,

  // Config e métricas
  AIModelConfig,
  AIUsageMetrics,

  // Claude API
  ClaudeMessage,
  ClaudeContentBlock,
  ClaudeAPIRequest,
  ClaudeAPIResponse,
} from './ai';
