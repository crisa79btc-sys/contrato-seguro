// Limites de upload
export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = ['application/pdf'] as const;
export const ALLOWED_EXTENSIONS = ['.pdf'] as const;

// Limites de tempo (ms)
export const ANALYSIS_TIMEOUT_MS = 120_000; // 2 minutos
export const CLASSIFICATION_TIMEOUT_MS = 15_000; // 15 segundos

// Contratos
export const CONTRACT_EXPIRY_DAYS = 7;

// AI Models
export const AI_MODELS = {
  classifier: process.env.AI_MODEL_CLASSIFIER || 'claude-haiku-4-5-20251001',
  analysis: process.env.AI_MODEL_ANALYSIS || 'claude-haiku-4-5-20251001',
  correction: process.env.AI_MODEL_CORRECTION || 'claude-haiku-4-5-20251001',
  negotiation: process.env.AI_MODEL_NEGOTIATION || 'claude-haiku-4-5-20251001',
} as const;

// AI Token limits
export const AI_MAX_TOKENS = {
  classifier: 256,
  analysis_free: 2048,
  analysis_full: 4096,
  correction: 8192,
  negotiation: 4096,
} as const;

// Feature flags
export const isBillingEnabled = () => process.env.BILLING_ENABLED === 'true';

// Disclaimer legal
export const DISCLAIMER_LEGAL =
  'O ContratoSeguro é uma ferramenta de análise automatizada que utiliza inteligência artificial para identificar possíveis riscos em contratos. Esta análise NÃO constitui parecer jurídico, consultoria legal ou aconselhamento profissional. Para decisões importantes, recomendamos consultar um advogado. O ContratoSeguro não se responsabiliza por decisões tomadas com base exclusiva nesta análise.';
