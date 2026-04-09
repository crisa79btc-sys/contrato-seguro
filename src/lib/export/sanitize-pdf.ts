/**
 * Sanitiza texto para uso com pdf-lib StandardFonts (WinAnsi encoding).
 *
 * StandardFonts (Helvetica, TimesRoman, etc.) só suportam caracteres no range
 * WinAnsi (Latin-1, 0x0020-0x00FF). Caracteres Unicode fora desse range
 * (smart quotes, bullets, em-dash, etc.) causam crash:
 *   Error: WinAnsi cannot encode "X"
 *
 * Esta função substitui caracteres problemáticos por equivalentes seguros.
 */

const REPLACEMENTS: Record<string, string> = {
  // Smart quotes → aspas simples
  '\u2018': "'",  // left single quote
  '\u2019': "'",  // right single quote / apostrophe
  '\u201A': "'",  // single low-9 quote
  '\u2039': "'",  // single left-pointing angle quote
  '\u203A': "'",  // single right-pointing angle quote

  // Smart double quotes → aspas duplas
  '\u201C': '"',  // left double quote
  '\u201D': '"',  // right double quote
  '\u201E': '"',  // double low-9 quote
  '\u00AB': '"',  // left-pointing double angle «
  '\u00BB': '"',  // right-pointing double angle »

  // Dashes
  '\u2013': '-',  // en-dash
  '\u2014': '--', // em-dash
  '\u2015': '--', // horizontal bar

  // Spaces
  '\u00A0': ' ',  // non-breaking space
  '\u2003': ' ',  // em space
  '\u2002': ' ',  // en space
  '\u2009': ' ',  // thin space
  '\u200A': ' ',  // hair space
  '\u200B': '',   // zero-width space
  '\uFEFF': '',   // BOM / zero-width no-break space

  // Bullets e símbolos
  '\u2022': '-',  // bullet •
  '\u2023': '-',  // triangular bullet
  '\u25CF': '-',  // black circle
  '\u25CB': '-',  // white circle
  '\u25AA': '-',  // black small square
  '\u00B7': '-',  // middle dot ·

  // Ellipsis
  '\u2026': '...', // horizontal ellipsis

  // Outros comuns
  '\u2032': "'",  // prime (minutos)
  '\u2033': '"',  // double prime (segundos)
  '\u2122': '(TM)', // trademark
  '\u00AE': '(R)',   // registered (está em WinAnsi mas por segurança)
  '\u2116': 'No.',   // numero sign
  '\u2212': '-',     // minus sign
  '\u2010': '-',     // hyphen
  '\u2011': '-',     // non-breaking hyphen
};

// Regex com todos os caracteres a substituir
const REPLACEMENT_PATTERN = new RegExp(
  Object.keys(REPLACEMENTS).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'),
  'g'
);

export function sanitizeForPdf(text: string): string {
  if (!text) return text;

  // Passo 1: Substituições conhecidas
  let result = text.replace(REPLACEMENT_PATTERN, (match) => REPLACEMENTS[match] ?? match);

  // Passo 2: Remover qualquer caractere restante fora do range WinAnsi printável
  // WinAnsi printável: 0x0020-0x007E (ASCII) + 0x00A1-0x00FF (Latin-1 Supplement)
  // Mantém: tab (0x09), newline (0x0A), carriage return (0x0D)
  result = result.replace(/[^\x09\x0A\x0D\x20-\x7E\xA1-\xFF]/g, '');

  return result;
}
