import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  Footer,
  PageNumber,
  NumberFormat,
} from 'docx';
import type { CorrectionOutput } from '@/schemas/ai-output.schema';

type DocxData = {
  filename: string;
  contractType: string;
  correction: CorrectionOutput;
};

/**
 * Gera DOCX contendo APENAS o contrato corrigido limpo.
 * Formatação profissional com títulos em negrito, espaçamento adequado.
 */
export async function generateCorrectedDocx(data: DocxData): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Limpar tags de marcação
  const cleanText = data.correction.corrected_text
    .replace(/\[(REMOVED|MODIFIED|CLARIFIED|ADDED|UPDATED|SIMPLIFIED)\]\s*/g, '');

  const lines = cleanText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      children.push(new Paragraph({ spacing: { after: 120 } }));
      continue;
    }

    // Título principal
    const isTitleMain = /^CONTRATO\s/i.test(trimmed) && trimmed === trimmed.toUpperCase() && trimmed.length < 80;

    // Seções
    const isSection = /^(DAS?\s|DOS?\s|CONDI[CÇ][OÕ]ES|DISPOSI[CÇ][OÕ]ES|TESTEMUNHAS)/i.test(trimmed)
      && trimmed.length < 60;

    // Cláusulas
    const isClause = /^CL[AÁ]USULA\s/i.test(trimmed);

    // Parágrafos
    const isParagraph = /^(§\d|Par[aá]grafo)/i.test(trimmed);

    // Incisos
    const isInciso = /^[IVX]+\.\s/.test(trimmed) || /^[a-z]\)\s/.test(trimmed);

    // Assinaturas
    const isSignatureLine = /^_{5,}/.test(trimmed) || /^Assinatura:/.test(trimmed);

    if (isTitleMain) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 28, font: 'Arial' })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 300 },
        })
      );
    } else if (isSection) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 24, font: 'Arial' })],
          spacing: { before: 300, after: 150 },
        })
      );
    } else if (isClause) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: 22, font: 'Arial' })],
          spacing: { before: 200, after: 80 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    } else if (isParagraph) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 21, font: 'Arial' })],
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: 300 },
        })
      );
    } else if (isInciso) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 21, font: 'Arial' })],
          spacing: { after: 40 },
          indent: { left: 500 },
        })
      );
    } else if (isSignatureLine) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22, font: 'Arial' })],
          spacing: { before: 100, after: 40 },
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: 22, font: 'Arial' })],
          spacing: { after: 60 },
          alignment: AlignmentType.JUSTIFIED,
        })
      );
    }
  }

  // Rodapé discreto
  children.push(
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'DDDDDD' } },
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Documento gerado por ContratoSeguro. Recomenda-se revisao por advogado antes da assinatura.',
          size: 16,
          color: 'AAAAAA',
          font: 'Arial',
          italics: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
        },
      },
      children,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: 'AAAAAA', font: 'Arial' }),
                new TextRun({ text: ' / ', size: 16, color: 'AAAAAA', font: 'Arial' }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: 'AAAAAA', font: 'Arial' }),
              ],
              alignment: AlignmentType.CENTER,
            }),
          ],
        }),
      },
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
