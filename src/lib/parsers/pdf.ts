import pdfParse from 'pdf-parse';

export type ParseResult = {
  text: string;
  pageCount: number;
};

/**
 * Extrai texto de um buffer PDF.
 * Retorna o texto e número de páginas.
 */
export async function parsePdf(buffer: Buffer): Promise<ParseResult> {
  const data = await pdfParse(buffer);

  const text = data.text?.trim();
  if (!text || text.length < 50) {
    throw new Error(
      'Não foi possível extrair texto deste PDF. Ele pode ser uma imagem escaneada. No momento, analisamos apenas PDFs com texto selecionável.'
    );
  }

  return {
    text,
    pageCount: data.numpages || 1,
  };
}
