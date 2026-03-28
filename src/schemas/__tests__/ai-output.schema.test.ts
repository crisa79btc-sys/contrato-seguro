import { describe, it, expect } from 'vitest';
import { classifierOutputSchema, analysisOutputFreeSchema } from '../ai-output.schema';

describe('classifierOutputSchema', () => {
  it('aceita output válido', () => {
    const result = classifierOutputSchema.safeParse({
      type: 'aluguel',
      confidence: 'high',
      detected_parties: ['LOCADOR', 'LOCATÁRIO'],
    });
    expect(result.success).toBe(true);
  });

  it('rejeita tipo inválido', () => {
    const result = classifierOutputSchema.safeParse({
      type: 'invalido',
      confidence: 'high',
      detected_parties: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejeita confidence inválida', () => {
    const result = classifierOutputSchema.safeParse({
      type: 'trabalho',
      confidence: 'muito_alto',
      detected_parties: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejeita campos faltantes', () => {
    const result = classifierOutputSchema.safeParse({ type: 'aluguel' });
    expect(result.success).toBe(false);
  });
});

describe('analysisOutputFreeSchema', () => {
  const validFreeOutput = {
    global_score: {
      value: 65,
      interpretation: 'Contrato com riscos moderados',
      formula_detail: '100 - ((14 / 32) * 100) = 56',
    },
    total_issues: 5,
    top_issues: [
      {
        clause_id: '3',
        original_text_summary: 'Multa de 100% do valor',
        risk_level: 'critical' as const,
        explanation: 'Multa desproporcional',
      },
    ],
    executive_summary: 'Contrato apresenta riscos significativos.',
  };

  it('aceita output válido', () => {
    const result = analysisOutputFreeSchema.safeParse(validFreeOutput);
    expect(result.success).toBe(true);
  });

  it('rejeita score acima de 100', () => {
    const result = analysisOutputFreeSchema.safeParse({
      ...validFreeOutput,
      global_score: { ...validFreeOutput.global_score, value: 150 },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita score abaixo de 0', () => {
    const result = analysisOutputFreeSchema.safeParse({
      ...validFreeOutput,
      global_score: { ...validFreeOutput.global_score, value: -10 },
    });
    expect(result.success).toBe(false);
  });

  it('rejeita risk_level inválido', () => {
    const result = analysisOutputFreeSchema.safeParse({
      ...validFreeOutput,
      top_issues: [
        { ...validFreeOutput.top_issues[0], risk_level: 'CRITICAL' },
      ],
    });
    expect(result.success).toBe(false);
  });

  it('rejeita mais de 3 top_issues', () => {
    const issues = Array.from({ length: 4 }, (_, i) => ({
      clause_id: String(i),
      original_text_summary: 'teste',
      risk_level: 'high' as const,
      explanation: 'teste',
    }));
    const result = analysisOutputFreeSchema.safeParse({
      ...validFreeOutput,
      top_issues: issues,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita executive_summary vazio', () => {
    const result = analysisOutputFreeSchema.safeParse({
      ...validFreeOutput,
      executive_summary: '',
    });
    expect(result.success).toBe(false);
  });
});
