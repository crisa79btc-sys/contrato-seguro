/**
 * Extrai e parseia JSON de uma resposta do Claude que pode conter
 * texto extra, blocos markdown, ou formatação inesperada.
 */
export function safeParseJSON<T = unknown>(raw: string): T {
  const trimmed = raw.trim();

  // Tentativa 1: parse direto
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // continua
  }

  // Tentativa 2: extrair de bloco markdown ```json ... ```
  const markdownMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (markdownMatch) {
    try {
      return JSON.parse(markdownMatch[1].trim()) as T;
    } catch {
      // continua
    }
  }

  // Tentativa 3: encontrar primeiro { e último } (ou [ e ])
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(trimmed.slice(firstBrace, lastBrace + 1)) as T;
    } catch {
      // continua
    }
  }

  const firstBracket = trimmed.indexOf('[');
  const lastBracket = trimmed.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(trimmed.slice(firstBracket, lastBracket + 1)) as T;
    } catch {
      // continua
    }
  }

  throw new Error(
    'A IA retornou uma resposta em formato inválido. Tente novamente.'
  );
}
