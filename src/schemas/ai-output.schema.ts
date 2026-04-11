import { z } from 'zod';

// Schema do classificador
export const classifierOutputSchema = z.object({
  type: z.enum([
    'aluguel', 'trabalho', 'servico', 'compra_venda',
    'financiamento', 'digital', 'outro',
  ]),
  confidence: z.enum(['high', 'medium', 'low']),
  detected_parties: z.array(z.string()),
});

// Schema da análise free (tier=free)
export const analysisOutputFreeSchema = z.object({
  global_score: z.object({
    value: z.number().min(0).max(100),
    interpretation: z.string().min(1),
    formula_detail: z.string(),
  }),
  total_issues: z.number().min(0),
  top_issues: z
    .array(
      z.object({
        clause_id: z.string(),
        original_text_summary: z.string(),
        risk_level: z.enum(['critical', 'high', 'medium', 'low', 'ok']),
        explanation: z.string(),
      })
    )
    .transform((arr) => arr.slice(0, 3)),
  missing_clauses: z
    .array(
      z.object({
        description: z.string(),
        importance: z.enum(['critical', 'recommended', 'optional']),
        legal_basis: z.string(),
      })
    )
    .default([]),
  executive_summary: z.string().min(1),
});

// Schema da análise completa (tier=full)
export const analysisOutputFullSchema = z.object({
  metadata: z.object({
    contract_type: z.string(),
    parties: z.array(
      z.object({
        role: z.string(),
        description: z.string(),
        vulnerable: z.boolean(),
      })
    ),
    applicable_laws: z.array(z.string()),
    is_consumer_relation: z.boolean(),
  }),
  clauses: z.array(
    z.object({
      clause_id: z.string(),
      original_text_summary: z.string(),
      risk_level: z.enum(['critical', 'high', 'medium', 'low', 'ok']),
      categories: z.array(z.string()),
      explanation: z.string(),
      legal_basis: z.string(),
      suggestion: z.string(),
      criteria_scores: z.object({
        legality: z.enum(['ok', 'warning', 'fail']),
        balance: z.enum(['ok', 'warning', 'fail']),
        clarity: z.enum(['ok', 'warning', 'fail']),
        completeness: z.enum(['ok', 'warning', 'fail']),
        currency: z.enum(['ok', 'warning', 'fail']),
      }),
    })
  ),
  missing_clauses: z.array(
    z.object({
      description: z.string(),
      importance: z.enum(['critical', 'recommended', 'optional']),
      legal_basis: z.string(),
    })
  ),
  global_score: z.object({
    value: z.number().min(0).max(100),
    interpretation: z.string(),
    formula_detail: z.string(),
  }),
  executive_summary: z.string(),
});

// Schema da correção (tolerante a variações do Haiku)
export const correctionOutputSchema = z.object({
  corrected_text: z.string().min(1),
  changes_summary: z.string().default('Contrato corrigido com base na análise prévia.'),
  changes: z.array(
    z.object({
      clause_id: z.string(),
      action: z.string().transform((v) => {
        const valid = ['removed', 'modified', 'clarified', 'added', 'updated', 'simplified'];
        return valid.includes(v.toLowerCase()) ? v.toLowerCase() : 'modified';
      }),
      original_summary: z.string().default(''),
      new_summary: z.string().default(''),
      legal_basis: z.string().default(''),
    })
  ).default([]),
  stats: z.object({
    total_changes: z.number().min(0),
    removed: z.number().min(0).default(0),
    modified: z.number().min(0).default(0),
    added: z.number().min(0).default(0),
  }).default({ total_changes: 0, removed: 0, modified: 0, added: 0 }),
  legal_notes: z.array(
    z.object({
      topic: z.string(),
      issue: z.string().default(''),
      legal_basis: z.string().default(''),
      explanation: z.string().default(''),
    })
  ).default([]),
  disclaimer: z.string().default('Este contrato corrigido é uma sugestão gerada por inteligência artificial. Recomenda-se revisão por advogado antes da assinatura.'),
});

export type ClassifierOutput = z.infer<typeof classifierOutputSchema>;
export type AnalysisOutputFree = z.infer<typeof analysisOutputFreeSchema>;
export type AnalysisOutputFull = z.infer<typeof analysisOutputFullSchema>;
export type CorrectionOutput = z.infer<typeof correctionOutputSchema>;
