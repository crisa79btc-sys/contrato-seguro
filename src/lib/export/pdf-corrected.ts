import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CorrectionOutput } from '@/schemas/ai-output.schema';

type PdfData = {
  filename: string;
  contractType: string;
  correction: CorrectionOutput;
};

/**
 * Gera PDF contendo APENAS o contrato corrigido limpo.
 * Formatação profissional: negrito em títulos, espaçamento correto, numeração de páginas.
 */
export async function generateCorrectedPdf(data: PdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);

  const pageWidth = 595;
  const pageHeight = 842;
  const marginTop = 70;
  const marginBottom = 60;
  const marginLeft = 65;
  const marginRight = 65;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const pages: ReturnType<typeof doc.addPage>[] = [];
  let page = doc.addPage([pageWidth, pageHeight]);
  pages.push(page);
  let y = pageHeight - marginTop;

  const black = rgb(0.1, 0.1, 0.1);
  const darkGray = rgb(0.25, 0.25, 0.25);
  const lightGray = rgb(0.6, 0.6, 0.6);

  function newPage() {
    page = doc.addPage([pageWidth, pageHeight]);
    pages.push(page);
    y = pageHeight - marginTop;
  }

  function checkPage(needed: number) {
    if (y < marginBottom + needed) {
      newPage();
    }
  }

  function drawWrapped(text: string, opts: {
    size?: number;
    font?: typeof font;
    color?: typeof black;
    indent?: number;
    lineHeight?: number;
  }) {
    const sz = opts.size || 10;
    const f = opts.font || font;
    const c = opts.color || darkGray;
    const indent = opts.indent || 0;
    const lh = opts.lineHeight || sz + 4;
    const x = marginLeft + indent;
    const maxW = contentWidth - indent;

    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, sz) > maxW && line) {
        checkPage(lh + 5);
        page.drawText(line, { x, y, size: sz, font: f, color: c });
        y -= lh;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      checkPage(lh + 5);
      page.drawText(line, { x, y, size: sz, font: f, color: c });
      y -= lh;
    }
  }

  // Limpar tags de marcação
  const cleanText = data.correction.corrected_text
    .replace(/\[(REMOVED|MODIFIED|CLARIFIED|ADDED|UPDATED|SIMPLIFIED)\]\s*/g, '');

  const lines = cleanText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Linha vazia = espaço entre parágrafos
    if (!trimmed) {
      y -= 10;
      continue;
    }

    // Título principal do contrato (ex: "CONTRATO DE COMPRA E VENDA DE VEÍCULO")
    const isTitleMain = /^CONTRATO\s/i.test(trimmed) && trimmed === trimmed.toUpperCase() && trimmed.length < 80;

    // Seções (ex: "DO OBJETO DO CONTRATO", "DA GARANTIA", "DO FORO")
    const isSection = /^(DAS?\s|DOS?\s|CONDI[CÇ][OÕ]ES|DISPOSI[CÇ][OÕ]ES|TESTEMUNHAS)/i.test(trimmed)
      && trimmed.length < 60;

    // Cláusulas (ex: "Cláusula 1ª.", "Cláusula 8-A.")
    const isClause = /^CL[AÁ]USULA\s/i.test(trimmed);

    // Parágrafos (§1º, §2º, Parágrafo único)
    const isParagraph = /^(§\d|Par[aá]grafo)/i.test(trimmed);

    // Incisos (I., II., III., etc.)
    const isInciso = /^[IVX]+\.\s/.test(trimmed) || /^[a-z]\)\s/.test(trimmed);

    if (isTitleMain) {
      y -= 10;
      checkPage(30);
      drawWrapped(trimmed, { size: 14, font: fontBold, color: black, lineHeight: 20 });
      y -= 12;
    } else if (isSection) {
      y -= 14;
      checkPage(25);
      drawWrapped(trimmed, { size: 11, font: fontBold, color: black, lineHeight: 16 });
      y -= 4;
    } else if (isClause) {
      y -= 8;
      checkPage(20);
      drawWrapped(trimmed, { size: 10, font: fontBold, color: darkGray, lineHeight: 14.5 });
      y -= 2;
    } else if (isParagraph) {
      checkPage(15);
      drawWrapped(trimmed, { size: 9.5, font: font, color: darkGray, indent: 15, lineHeight: 13.5 });
    } else if (isInciso) {
      checkPage(15);
      drawWrapped(trimmed, { size: 9.5, font: font, color: darkGray, indent: 25, lineHeight: 13.5 });
    } else {
      checkPage(15);
      drawWrapped(trimmed, { size: 10, font: font, color: darkGray, lineHeight: 14 });
    }
  }

  // Rodapé discreto na última página
  y -= 25;
  checkPage(30);
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: pageWidth - marginRight, y },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });
  y -= 10;
  drawWrapped(
    'Documento gerado por ContratoSeguro. Recomenda-se revisao por advogado antes da assinatura.',
    { size: 7, font: fontItalic, color: lightGray }
  );

  // Numeração de páginas
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const p = pages[i];
    const text = `${i + 1} / ${totalPages}`;
    const textWidth = font.widthOfTextAtSize(text, 8);
    p.drawText(text, {
      x: (pageWidth - textWidth) / 2,
      y: 30,
      size: 8,
      font,
      color: lightGray,
    });
  }

  return doc.save();
}
