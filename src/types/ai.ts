// ============================================================================
// ContratoSeguro - Tipos para Interacao com IA (Claude API)
// Inputs, outputs e configuracoes dos prompts de analise e correcao
//
// REFERENCIA DEFINITIVA: os prompts DEVEM produzir JSON que corresponda
// EXATAMENTE aos tipos definidos aqui. Campos em snake_case (consistente
// com o banco de dados).
// ============================================================================

import type { ContractType, RiskLevel, ClauseCategory } from './database';

// ---------------------------------------------------------------------------
// Classificacao de Contrato
// ---------------------------------------------------------------------------

/** Entrada para o prompt de classificacao rapida */
export type AIClassifierInput = {
  contract_snippet: string;
};

/** Saida da classificacao rapida do tipo de contrato */
export type AIClassifierOutput = {
  type: ContractType;
  confidence: 'high' | 'medium' | 'low';
  detected_parties: string[];
};

// ---------------------------------------------------------------------------
// Analise de Contrato
// ---------------------------------------------------------------------------

/** Entrada para o prompt de analise de contrato */
export type AIAnalysisInput = {
  contract_text: string;
  contract_type: ContractType;
  tier: 'free' | 'full';
};

/**
 * Saida estruturada da analise de contrato pela IA.
 * Formato JSON que espelha o output do prompt otimizado.
 */
export type AIAnalysisOutput = {
  metadata: AIAnalysisMetadata;
  clauses: AIClauseResult[];
  missing_clauses: AIMissingClause[];
  global_score: AIGlobalScore;
  executive_summary: string;
};

/** Metadados gerais extraidos do contrato */
export type AIAnalysisMetadata = {
  contract_type: ContractType;
  parties: AIParty[];
  applicable_laws: string[];
  is_consumer_relation: boolean;
};

/** Parte identificada no contrato */
export type AIParty = {
  role: string;
  description: string;
  vulnerable: boolean;
};

/** Resultado da analise de uma clausula individual */
export type AIClauseResult = {
  clause_id: string;
  original_text_summary: string;
  risk_level: RiskLevel;
  categories: ClauseCategory[];
  explanation: string;
  legal_basis: string;
  suggestion: string;
  criteria_scores: AICriteriaScores;
};

/**
 * Pontuacoes por criterio de avaliacao de uma clausula.
 * Cada criterio recebe 'ok', 'warning' ou 'fail'.
 */
export type AICriteriaScores = {
  legality: 'ok' | 'warning' | 'fail';
  balance: 'ok' | 'warning' | 'fail';
  clarity: 'ok' | 'warning' | 'fail';
  completeness: 'ok' | 'warning' | 'fail';
  currency: 'ok' | 'warning' | 'fail';
};

/** Clausula faltante identificada pela IA */
export type AIMissingClause = {
  description: string;
  importance: 'critical' | 'recommended' | 'optional';
  legal_basis: string;
};

/**
 * Score global do contrato.
 * Calculado pela IA com base nas clausulas analisadas.
 */
export type AIGlobalScore = {
  value: number;
  interpretation: string;
  formula_detail: string;
};

/** Saida resumida para tier free */
export type AIAnalysisOutputFree = {
  global_score: AIGlobalScore;
  total_issues: number;
  top_issues: AITopIssue[];
  executive_summary: string;
};

/** Issue resumida para tier free */
export type AITopIssue = {
  clause_id: string;
  original_text_summary: string;
  risk_level: RiskLevel;
  explanation: string;
};

// ---------------------------------------------------------------------------
// Correcao de Contrato
// ---------------------------------------------------------------------------

/** Entrada para o prompt de correcao de contrato */
export type AICorrectionInput = {
  contract_text: string;
  analysis_result: AIAnalysisOutput;
};

/** Saida da correcao de contrato pela IA */
export type AICorrectionOutput = {
  corrected_text: string;
  changes_summary: string;
  changes: AICorrectionChange[];
  stats: AICorrectionStats;
  legal_notes: AILegalNote[];
  disclaimer: string;
};

/** Nota jurisprudencial sobre questão pacificada nos Tribunais Superiores */
export type AILegalNote = {
  topic: string;
  issue: string;
  legal_basis: string;
  explanation: string;
};

/** Alteracao individual feita pela IA na correcao */
export type AICorrectionChange = {
  clause_id: string;
  action: 'removed' | 'modified' | 'clarified' | 'added' | 'updated' | 'simplified';
  original_summary: string;
  new_summary: string;
  legal_basis: string;
};

/** Estatisticas da correcao */
export type AICorrectionStats = {
  total_changes: number;
  removed: number;
  modified: number;
  added: number;
};

// ---------------------------------------------------------------------------
// Roteiro de Negociacao
// ---------------------------------------------------------------------------

/** Entrada para o prompt de geracao de roteiro de negociacao */
export type AINegotiationInput = {
  contract_text: string;
  analysis_result: AIAnalysisOutput;
  user_role: string;
  context: string;
  bargaining_power: 'alto' | 'medio' | 'baixo';
};

/** Saida do roteiro de negociacao gerado pela IA */
export type AINegotiationOutput = {
  context: AINegotiationContext;
  preparation: AINegotiationPreparation;
  opening: AINegotiationOpening;
  negotiation_points: AINegotiationPoint[];
  trade_coins: AINegotiationTradeCoin[];
  closing: AINegotiationClosing;
  plan_b: AINegotiationPlanB;
  disclaimer: string;
};

export type AINegotiationContext = {
  user_role: string;
  counterparty: string;
  bargaining_power: 'alto' | 'medio' | 'baixo';
  contract_type: string;
};

export type AINegotiationPreparation = {
  batna: string;
  key_interests: string[];
  counterparty_interests: string[];
};

export type AINegotiationOpening = {
  tone: string;
  suggested_phrase: string;
};

export type AINegotiationPoint = {
  clause: string;
  priority: 'inegociavel' | 'recomendada' | 'flexivel';
  current_issue: string;
  suggested_phrase: string;
  argument: string;
  legal_basis: string;
  fallback_levels: string[];
};

export type AINegotiationTradeCoin = {
  give: string;
  get: string;
  when: string;
};

export type AINegotiationClosing = {
  suggested_phrase: string;
  checklist: string[];
};

export type AINegotiationPlanB = {
  walkaway_point: string;
  suggested_phrase: string;
};

// ---------------------------------------------------------------------------
// Configuracao e Metricas
// ---------------------------------------------------------------------------

/** Configuracao do modelo de IA utilizado */
export type AIModelConfig = {
  model: string;
  max_tokens: number;
  temperature: number;
};

/**
 * Metricas de uso da IA para uma chamada.
 * Usado para controle de custo e monitoramento.
 */
export type AIUsageMetrics = {
  tokens_input: number;
  tokens_output: number;
  model: string;
  processing_time_ms: number;
  estimated_cost_usd: number;
};

// ---------------------------------------------------------------------------
// Tipos auxiliares para chamadas a Claude API
// ---------------------------------------------------------------------------

/** Mensagem no formato da Claude Messages API */
export type ClaudeMessage = {
  role: 'user' | 'assistant';
  content: string | ClaudeContentBlock[];
};

/** Bloco de conteudo da Claude API */
export type ClaudeContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: { type: 'base64'; media_type: string; data: string } };

/** Request simplificado para a Claude Messages API */
export type ClaudeAPIRequest = {
  model: string;
  max_tokens: number;
  temperature?: number;
  system?: string;
  messages: ClaudeMessage[];
};

/** Resposta simplificada da Claude Messages API */
export type ClaudeAPIResponse = {
  id: string;
  type: 'message';
  role: 'assistant';
  content: ClaudeContentBlock[];
  model: string;
  stop_reason: 'end_turn' | 'max_tokens' | 'stop_sequence';
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
};
