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
    .max(3),
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

export type ClassifierOutput = z.infer<typeof classifierOutputSchema>;
export type AnalysisOutputFree = z.infer<typeof analysisOutputFreeSchema>;
export type AnalysisOutputFull = z.infer<typeof analysisOutputFullSchema>;
