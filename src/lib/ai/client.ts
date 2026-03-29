import Anthropic from '@anthropic-ai/sdk';

const globalAI = globalThis as typeof globalThis & {
  __anthropicClient?: Anthropic;
  __anthropicKey?: string;
};

export function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não configurada');
  }
  // Recriar client se a chave mudou (ex: .env.local editado em dev)
  if (!globalAI.__anthropicClient || globalAI.__anthropicKey !== apiKey) {
    globalAI.__anthropicClient = new Anthropic({ apiKey, maxRetries: 2 });
    globalAI.__anthropicKey = apiKey;
  }
  return globalAI.__anthropicClient;
}

export type AICallResult = {
  content: string;
  tokensInput: number;
  tokensOutput: number;
  model: string;
  durationMs: number;
};

/**
 * Faz uma chamada ao Claude e retorna o conteúdo + métricas de uso.
 * Suporta timeout opcional via AbortSignal.
 */
export async function callClaude(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature?: number;
  timeoutMs?: number;
}): Promise<AICallResult> {
  const anthropic = getAnthropicClient();
  const start = Date.now();

  const requestOptions: Record<string, unknown> = {};
  if (params.timeoutMs) {
    requestOptions.signal = AbortSignal.timeout(params.timeoutMs);
  }

  try {
    const response = await anthropic.messages.create(
      {
        model: params.model,
        max_tokens: params.maxTokens,
        temperature: params.temperature ?? 0.2,
        system: params.systemPrompt,
        messages: [
          {
            role: 'user',
            content: params.userPrompt,
          },
        ],
      },
      requestOptions
    );

    const durationMs = Date.now() - start;

    const textBlock = response.content.find((b) => b.type === 'text');
    const content = textBlock?.type === 'text' ? textBlock.text : '';

    return {
      content,
      tokensInput: response.usage.input_tokens,
      tokensOutput: response.usage.output_tokens,
      model: params.model,
      durationMs,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'TimeoutError') {
      const seconds = Math.round((params.timeoutMs || 0) / 1000);
      throw new Error(
        `A análise excedeu o tempo limite de ${seconds}s. Tente novamente com um contrato menor.`
      );
    }
    throw err;
  }
}
