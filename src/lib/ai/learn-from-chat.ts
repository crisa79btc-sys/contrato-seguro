/**
 * learn-from-chat — extrai padrões de dúvida das perguntas do chat.
 *
 * Consumido pelo cron semanal /api/cron/learn. A partir de um lote de perguntas
 * sobre um mesmo contract_type, o Claude Haiku identifica até 5 padrões que um
 * analisador deveria detectar de forma autônoma (sem precisar o usuário perguntar).
 *
 * Os padrões voltam como status='pending' em analyzer_learnings (tabela criada em
 * docs/database/005_analyzer_learnings.sql) e são aprovados/rejeitados em
 * /admin/learnings. Depois de aprovados, analyzer.ts injeta no system prompt.
 */

import { callClaude } from './client';
import { safeParseJSON } from './utils';
import { AI_MODELS } from '@/config/constants';

export type LearningPattern = {
  pattern: string;
  sample_questions: string[];
};

export type ExtractLearningsResult = {
  patterns: LearningPattern[];
  tokensInput: number;
  tokensOutput: number;
  durationMs: number;
};

const SYSTEM_PROMPT = `Você é um engenheiro de prompt especializado em análise de contratos brasileiros.

Sua tarefa: dado um lote de perguntas que usuários fizeram em um chat sobre contratos de um determinado tipo, identificar PADRÕES de dúvida que um analisador automático deveria detectar SOZINHO, sem o usuário ter que perguntar.

REGRAS:
1. Foque em padrões que representam LACUNAS do analisador atual — coisas que ele deveria ter marcado como issue mas não marcou.
2. Ignore perguntas triviais, curiosidades gerais ("o que é cláusula?") ou coisas que já estariam cobertas por uma análise normal.
3. Cada padrão deve ser acionável: descreva o que o analisador deveria verificar e, se possível, cite a base legal.
4. Máximo 5 padrões por lote. Se não houver padrões claros, retorne array vazio.
5. Responda APENAS JSON válido, sem texto antes ou depois.

FORMATO DE SAÍDA:
{
  "patterns": [
    {
      "pattern": "descrição acionável do que o analisador deveria detectar, em 1-2 frases, com base legal se aplicável",
      "sample_questions": ["pergunta 1 do usuário", "pergunta 2", "pergunta 3"]
    }
  ]
}`;

/**
 * Extrai padrões de dúvida a partir de uma lista de perguntas do chat.
 *
 * @param contractType - tipo do contrato (aluguel, trabalho, servico, etc.)
 * @param questions - lista de perguntas do usuário (role='user' em chat_messages)
 * @returns padrões extraídos + métricas de uso
 */
export async function extractLearnings(
  contractType: string,
  questions: string[]
): Promise<ExtractLearningsResult> {
  if (questions.length === 0) {
    return { patterns: [], tokensInput: 0, tokensOutput: 0, durationMs: 0 };
  }

  const userPrompt = `<tipo_de_contrato>${contractType}</tipo_de_contrato>

<perguntas>
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}
</perguntas>

Identifique até 5 padrões de dúvida que um analisador automático de contratos do tipo "${contractType}" deveria detectar sozinho. Retorne APENAS o JSON.`;

  const result = await callClaude({
    model: AI_MODELS.analysis,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    maxTokens: 1500,
    temperature: 0.3,
    timeoutMs: 60_000,
  });

  const parsed = safeParseJSON(result.content) as { patterns?: LearningPattern[] } | null;
  const patterns = Array.isArray(parsed?.patterns) ? parsed!.patterns : [];

  // Validação mínima: cada pattern precisa ter string não-vazia e sample_questions array
  const validPatterns = patterns
    .filter((p) => typeof p?.pattern === 'string' && p.pattern.trim().length > 10)
    .map((p) => ({
      pattern: p.pattern.trim(),
      sample_questions: Array.isArray(p.sample_questions)
        ? p.sample_questions.filter((q) => typeof q === 'string').slice(0, 5)
        : [],
    }))
    .slice(0, 5);

  return {
    patterns: validPatterns,
    tokensInput: result.tokensInput,
    tokensOutput: result.tokensOutput,
    durationMs: result.durationMs,
  };
}
