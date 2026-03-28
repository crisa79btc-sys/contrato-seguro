import { callClaude } from './client';
import { safeParseJSON } from './utils';
import { AI_MODELS, AI_MAX_TOKENS, CLASSIFICATION_TIMEOUT_MS } from '@/config/constants';
import { classifierOutputSchema } from '@/schemas/ai-output.schema';
import type { AIClassifierOutput } from '@/types';

const SYSTEM_PROMPT = `Classifique o tipo do contrato abaixo. Retorne APENAS JSON valido.

<tipos_validos>
- aluguel
- trabalho
- servico
- compra_venda
- financiamento
- digital
- outro
</tipos_validos>

<formato>
{
  "type": "string (um dos tipos acima, em minusculo)",
  "confidence": "high | medium | low",
  "detected_parties": ["string (papel de cada parte detectada)"]
}
</formato>

<exemplos>
Trecho: "LOCADOR... LOCATARIO... imovel residencial situado na... aluguel mensal..."
Resposta: {"type":"aluguel","confidence":"high","detected_parties":["LOCADOR","LOCATARIO"]}

Trecho: "CONTRATANTE... CONTRATADO... prestacao de servicos de consultoria..."
Resposta: {"type":"servico","confidence":"high","detected_parties":["CONTRATANTE","CONTRATADO"]}

Trecho: "EMPREGADOR... EMPREGADO... carteira de trabalho... salario mensal..."
Resposta: {"type":"trabalho","confidence":"high","detected_parties":["EMPREGADOR","EMPREGADO"]}
</exemplos>

Se o texto nao parecer um contrato, retorne: {"type":"outro","confidence":"low","detected_parties":[]}`;

/**
 * Classifica o tipo de contrato usando os primeiros 1000 caracteres.
 */
export async function classifyContract(contractText: string) {
  const snippet = contractText.slice(0, 1000);

  const result = await callClaude({
    model: AI_MODELS.classifier,
    systemPrompt: SYSTEM_PROMPT,
    userPrompt: `<trecho>\n${snippet}\n</trecho>`,
    maxTokens: AI_MAX_TOKENS.classifier,
    temperature: 0.1,
    timeoutMs: CLASSIFICATION_TIMEOUT_MS,
  });

  const raw = safeParseJSON(result.content);
  const validated = classifierOutputSchema.safeParse(raw);
  if (!validated.success) {
    throw new Error(
      `Classificação retornou formato inválido: ${validated.error.issues.map((i) => i.message).join(', ')}`
    );
  }
  const parsed = validated.data as AIClassifierOutput;

  return {
    classification: parsed,
    usage: {
      tokensInput: result.tokensInput,
      tokensOutput: result.tokensOutput,
      model: result.model,
      durationMs: result.durationMs,
    },
  };
}
