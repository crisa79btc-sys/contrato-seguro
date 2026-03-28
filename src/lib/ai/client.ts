import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurada');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
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
 */
export async function callClaude(params: {
  model: string;
  systemPrompt: string;
  userPrompt: string;
  maxTokens: number;
  temperature?: number;
}): Promise<AICallResult> {
  const client = getAnthropicClient();
  const start = Date.now();

  const response = await client.messages.create({
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
  });

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
}
