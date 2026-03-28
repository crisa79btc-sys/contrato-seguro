import pdfParse from 'pdf-parse';
import { extractTextFromPdfImages } from './ocr-vision';

export type ParseResult = {
  text: string;
  pageCount: number;
  method: 'text' | 'vision';
};

/**
 * Extrai texto de um buffer PDF.
 * Tenta extração de texto direto primeiro.
 * Se falhar (PDF escaneado), usa Claude Vision como fallback.
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  const data = await pdfParse(buffer);
  const text = data.text?.trim();

  // Se conseguiu extrair texto suficiente, retorna direto
  if (text && text.length >= 50) {
    return {
      text,
      pageCount: data.numpages || 1,
      method: 'text',
    };
  }

  // Fallback: PDF escaneado — usar Claude Vision
  console.log('PDF sem texto extraível, usando Claude Vision...');
  const visionText = await extractTextFromPdfImages(buffer);

  return {
    text: visionText,
    pageCount: data.numpages || 1,
    method: 'vision',
  };
}
