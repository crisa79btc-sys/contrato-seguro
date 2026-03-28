const MAX_TEXT_LENGTH = 50_000; // ~12k tokens no Haiku

/**
 * Limpa e otimiza o texto extraído de um PDF para envio à IA.
 * Reduz tokens (custo) e melhora qualidade da análise.
 */
export function cleanContractText(text: string): string {
  let cleaned = text;

  // Normalizar quebras de linha
  cleaned = cleaned.replace(/\r\n/g, '\n');

  // Remover linhas em branco excessivas (3+ viram 2)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remover espaços múltiplos
  cleaned = cleaned.replace(/ {2,}/g, ' ');

  // Remover linhas com apenas espaços
  cleaned = cleaned.replace(/^ +$/gm, '');

  // Remover headers/footers repetidos (padrão de paginação PDF)
  // Ex: "Página 1 de 10", "1/10", etc.
  cleaned = cleaned.replace(/^(?:P[áa]gina\s+)?\d+\s*(?:de|\/)\s*\d+\s*$/gm, '');

  // Truncar se muito longo
  if (cleaned.length > MAX_TEXT_LENGTH) {
    const truncated = cleaned.slice(0, MAX_TEXT_LENGTH);
    // Cortar na última quebra de linha para não cortar uma cláusula no meio
    const lastNewline = truncated.lastIndexOf('\n');
    cleaned =
      (lastNewline > MAX_TEXT_LENGTH * 0.8 ? truncated.slice(0, lastNewline) : truncated) +
      '\n\n[NOTA: Contrato truncado por exceder o limite de análise. As cláusulas finais não foram analisadas.]';
  }

  return cleaned.trim();
}
