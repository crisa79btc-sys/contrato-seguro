// ============================================================================
// ContratoSeguro - Tipos do Banco de Dados
// Espelham EXATAMENTE as tabelas definidas em 001_initial_schema.sql
// FONTE DE VERDADE: SQL. Este arquivo deve ser atualizado sempre que o SQL mudar.
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Tipos de contrato suportados pela plataforma */
export type ContractType =
  | 'aluguel'
  | 'trabalho'
  | 'servico'
  | 'compra_venda'
  | 'financiamento'
  | 'digital'
  | 'outro';

/** Status do ciclo de vida de um contrato na plataforma */
export type ContractStatus =
  | 'uploaded'
  | 'classifying'
  | 'classified'
  | 'analyzing'
  | 'analyzed'
  | 'correcting'
  | 'corrected'
  | 'error';

/** Nivel de risco de uma clausula ou contrato */
export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'ok';

/** Categoria de problema identificado em uma clausula */
export type ClauseCategory =
  | 'abusiva'
  | 'desequilibrada'
  | 'ambigua'
  | 'incompleta'
  | 'desatualizada'
  | 'ok';

/** Nivel de analise: gratuita (resumida) ou completa (paga) */
export type AnalysisTier = 'free' | 'full';

/** Produto disponivel para compra */
export type PaymentProduct =
  | 'full_analysis'
  | 'corrected_contract'
  | 'complete_package'
  | 'template';

/** Status de um pagamento */
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

/** Provedor de pagamento integrado */
export type PaymentProvider = 'mercado_pago' | 'stripe';

/** Plano do usuario */
export type UserPlan = 'free' | 'pro' | 'enterprise';

/** Formato de arquivo suportado para upload/download */
export type FileFormat = 'pdf' | 'docx';

// ---------------------------------------------------------------------------
// Tipos auxiliares
// ---------------------------------------------------------------------------

/** UUID representado como string */
export type UUID = string;

/** Timestamp ISO-8601 representado como string (ex: "2026-03-28T12:00:00Z") */
export type ISOTimestamp = string;

// ---------------------------------------------------------------------------
// Tabelas
// ---------------------------------------------------------------------------

/**
 * Usuario da plataforma.
 * Sincronizado com auth.users do Supabase via trigger.
 * Tabela: public.users
 */
export type User = {
  id: UUID;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  plan: UserPlan;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
};

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'>;
export type UserUpdate = Partial<Omit<User, 'id' | 'created_at'>>;

/**
 * Contrato enviado pelo usuario para analise.
 * O arquivo original e armazenado no Supabase Storage.
 * user_id e nullable porque na fase beta o upload pode ser anonimo.
 * Tabela: public.contracts
 */
export type Contract = {
  id: UUID;
  user_id: UUID | null;
  original_file_url: string | null;
  original_text: string | null;
  original_filename: string | null;
  contract_type: ContractType | null;
  file_format: FileFormat | null;
  status: ContractStatus;
  file_size_bytes: number | null;
  page_count: number | null;
  error_message: string | null;
  progress: number | null;
  current_step: string | null;
  expires_at: ISOTimestamp;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
};

export type ContractInsert = Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'status' | 'expires_at'> & {
  status?: ContractStatus;
  expires_at?: ISOTimestamp;
};
export type ContractUpdate = Partial<Omit<Contract, 'id' | 'created_at'>>;

/**
 * Resultado consolidado da analise de um contrato pela IA.
 * Relacao 1:1 com contracts (UNIQUE em contract_id).
 * Tabela: public.analyses
 */
export type Analysis = {
  id: UUID;
  contract_id: UUID;
  risk_score: number | null;
  global_score_interpretation: string | null;
  summary: string | null;
  applicable_laws: string[] | null;
  is_consumer_relation: boolean | null;
  parties: unknown | null;
  missing_clauses: unknown | null;
  tier: AnalysisTier;
  total_clauses_analyzed: number | null;
  problematic_clauses_count: number | null;
  ai_model_used: string | null;
  ai_tokens_input: number | null;
  ai_tokens_output: number | null;
  processing_time_ms: number | null;
  estimated_cost_usd: number | null;
  created_at: ISOTimestamp;
};

export type AnalysisInsert = Omit<Analysis, 'id' | 'created_at'>;
export type AnalysisUpdate = Partial<Omit<Analysis, 'id' | 'contract_id' | 'created_at'>>;

/**
 * Analise detalhada de uma clausula individual do contrato.
 * Vinculada a uma Analysis via analysis_id.
 * Tabela: public.clause_analyses
 */
export type ClauseAnalysis = {
  id: UUID;
  analysis_id: UUID;
  clause_id: string;
  order_index: number | null;
  original_text_summary: string | null;
  risk_level: RiskLevel;
  category: ClauseCategory[];
  explanation: string | null;
  legal_basis: string | null;
  suggestion: string | null;
  criteria_scores: unknown | null;
  created_at: ISOTimestamp;
};

export type ClauseAnalysisInsert = Omit<ClauseAnalysis, 'id' | 'created_at'>;
export type ClauseAnalysisUpdate = Partial<Omit<ClauseAnalysis, 'id' | 'analysis_id' | 'created_at'>>;

/**
 * Versao corrigida de um contrato gerada pela IA.
 * Armazena o texto completo corrigido e o resumo das alteracoes.
 * Tabela: public.corrected_contracts
 */
export type CorrectedContract = {
  id: UUID;
  contract_id: UUID;
  analysis_id: UUID | null;
  corrected_text: string | null;
  changes_summary: string | null;
  changes: unknown | null;
  docx_file_url: string | null;
  pdf_file_url: string | null;
  diff_html: string | null;
  negotiation_script: string | null;
  ai_model_used: string | null;
  ai_tokens_input: number | null;
  ai_tokens_output: number | null;
  processing_time_ms: number | null;
  estimated_cost_usd: number | null;
  created_at: ISOTimestamp;
};

export type CorrectedContractInsert = Omit<CorrectedContract, 'id' | 'created_at'>;
export type CorrectedContractUpdate = Partial<Omit<CorrectedContract, 'id' | 'contract_id' | 'created_at'>>;

/**
 * Registro de pagamento.
 * Suporta Mercado Pago e Stripe.
 * Tabela: public.payments
 */
export type Payment = {
  id: UUID;
  user_id: UUID;
  contract_id: UUID | null;
  product: PaymentProduct;
  amount_cents: number;
  currency: string;
  status: PaymentStatus;
  payment_provider: PaymentProvider | null;
  provider_payment_id: string | null;
  payment_url: string | null;
  paid_at: ISOTimestamp | null;
  metadata: unknown | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
};

export type PaymentInsert = Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'status'> & {
  status?: PaymentStatus;
};
export type PaymentUpdate = Partial<Omit<Payment, 'id' | 'user_id' | 'created_at'>>;

/**
 * Template de contrato disponivel para download.
 * Pode ser gratuito ou premium.
 * Tabela: public.contract_templates
 */
export type ContractTemplate = {
  id: UUID;
  contract_type: string;
  title: string;
  description: string | null;
  price_cents: number;
  preview_text: string | null;
  file_url: string | null;
  file_format: string | null;
  download_count: number | null;
  is_active: boolean;
  is_premium: boolean | null;
  created_at: ISOTimestamp;
  updated_at: ISOTimestamp;
};

export type ContractTemplateInsert = Omit<ContractTemplate, 'id' | 'created_at' | 'updated_at' | 'download_count'> & {
  download_count?: number;
};
export type ContractTemplateUpdate = Partial<Omit<ContractTemplate, 'id' | 'created_at'>>;

/**
 * Log de auditoria para acoes relevantes na plataforma.
 * Imutavel — somente insercao, sem tipo Update.
 * Tabela: public.audit_logs
 */
export type AuditLog = {
  id: UUID;
  user_id: UUID | null;
  action: string;
  resource_type: string;
  resource_id: UUID | null;
  ip_address: string | null;
  user_agent: string | null;
  metadata: unknown | null;
  created_at: ISOTimestamp;
};

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;

/**
 * Configuracoes globais da aplicacao.
 * Chave-valor com tipagem flexivel via JSONB.
 * PK e o campo "key" — nao possui campo "id".
 * Tabela: public.app_config
 */
export type AppConfig = {
  key: string;
  value: unknown;
  description: string | null;
  created_at: ISOTimestamp | null;
  updated_at: ISOTimestamp;
};

export type AppConfigInsert = Omit<AppConfig, 'created_at' | 'updated_at'>;
export type AppConfigUpdate = Partial<Omit<AppConfig, 'key' | 'created_at'>>;

// ---------------------------------------------------------------------------
// Helper: tipagem do schema completo (util para Supabase client)
// ---------------------------------------------------------------------------

/** Mapa de todas as tabelas do banco com seus tipos de Row, Insert e Update */
export type Database = {
  public: {
    Tables: {
      users: { Row: User; Insert: UserInsert; Update: UserUpdate };
      contracts: { Row: Contract; Insert: ContractInsert; Update: ContractUpdate };
      analyses: { Row: Analysis; Insert: AnalysisInsert; Update: AnalysisUpdate };
      clause_analyses: { Row: ClauseAnalysis; Insert: ClauseAnalysisInsert; Update: ClauseAnalysisUpdate };
      corrected_contracts: { Row: CorrectedContract; Insert: CorrectedContractInsert; Update: CorrectedContractUpdate };
      payments: { Row: Payment; Insert: PaymentInsert; Update: PaymentUpdate };
      contract_templates: { Row: ContractTemplate; Insert: ContractTemplateInsert; Update: ContractTemplateUpdate };
      audit_logs: { Row: AuditLog; Insert: AuditLogInsert; Update: never };
      app_config: { Row: AppConfig; Insert: AppConfigInsert; Update: AppConfigUpdate };
    };
  };
};
