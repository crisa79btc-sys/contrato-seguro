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
  LineRuleType,
  convertMillimetersToTwip,
} from 'docx';
import type { CorrectionOutput } from '@/schemas/ai-output.schema';

type DocxData = {
  filename: string;
  contractType: string;
  correction: CorrectionOutput;
};

// Padrão formal brasileiro: Times New Roman 12pt, justificado, 1.5 entrelinhas
const FONT = 'Times New Roman';
const FONT_SIZE = 24; // docx usa half-points: 24 = 12pt
const FONT_SIZE_TITLE = 28; // 14pt
const FONT_SIZE_SECTION = 26; // 13pt
const FONT_SIZE_SMALL = 20; // 10pt
const FIRST_LINE_INDENT = convertMillimetersToTwip(12.5); // 1,25cm recuo parágrafo
const LINE_SPACING = 360; // 1.5 entrelinhas (240 = single, 360 = 1.5)

/**
 * Gera DOCX contendo APENAS o contrato corrigido limpo.
 * Formatação formal: Times New Roman 12pt, justificado, espaçamento 1.5,
 * margens 3cm (superior/esquerda) e 2cm (inferior/direita), recuo de parágrafo.
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
      children.push(new Paragraph({ spacing: { after: 80 } }));
      continue;
    }

    // Título principal (ex: "CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL")
    const isTitleMain = /^CONTRATO\s/i.test(trimmed) && trimmed === trimmed.toUpperCase() && trimmed.length < 80;

    // Seções em caixa alta (ex: "CLÁUSULAS CONTRATUAIS", "DO OBJETO", "TESTEMUNHAS:")
    const isSection = (
      /^(DAS?\s|DOS?\s|CONDI[CÇ][OÕ]ES|DISPOSI[CÇ][OÕ]ES|TESTEMUNHAS|CL[AÁ]USULAS\s)/i.test(trimmed)
      && trimmed.length < 60
    ) || (
      trimmed === trimmed.toUpperCase() && trimmed.length > 3 && trimmed.length < 60
      && !/^\d/.test(trimmed) && !/^_{3,}/.test(trimmed) && !isTitleMain
    );

    // Cláusulas numeradas por ordinal (ex: "PRIMEIRA – DO IMÓVEL:", "DÉCIMA SEGUNDA – DAS BENFEITORIAS:")
    // ou por número (ex: "Cláusula 1ª.", "CLÁUSULA PRIMEIRA")
    const isClause = /^CL[AÁ]USULA\s/i.test(trimmed)
      || /^(PRIMEIRA|SEGUNDA|TERCEIRA|QUARTA|QUINTA|SEXTA|S[EÉ]TIMA|OITAVA|NONA|D[EÉ]CIMA|VIG[EÉ]SIMA|TRIG[EÉ]SIMA|QUADRAG[EÉ]SIMA|QUINQUAG[EÉ]SIMA)\b/i.test(trimmed);

    // Parágrafos jurídicos (§1º, Parágrafo único)
    const isParagraph = /^(§\d|Par[aá]grafo)/i.test(trimmed);

    // Incisos (I., II., I –, a), b))
    const isInciso = /^[IVX]+[\.\s]\s*[–\-]?\s/.test(trimmed) || /^[a-z]\)\s/.test(trimmed);

    // Assinaturas, campos para preencher, local/data
    const isSignatureLine = /^_{5,}/.test(trimmed) || /^Assinatura:/i.test(trimmed)
      || /^(Nome|CPF|RG)\s*:/i.test(trimmed)
      || /^.{1,50},\s*_{2,}.*de\s+\d{4}/.test(trimmed);

    // Bloco de identificação sob assinatura
    const isSignatureBlock = /^(LOCAT[AÁ]RI[OA]|LOCADORA|CPF\s+\d)/.test(trimmed)
      || /^TESTEMUNHAS:?\s*$/i.test(trimmed);

    if (isTitleMain) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: FONT_SIZE_TITLE, font: FONT })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 240, after: 360, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
        })
      );
    } else if (isSection) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: FONT_SIZE_SECTION, font: FONT })],
          alignment: AlignmentType.CENTER,
          spacing: { before: 360, after: 200, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
        })
      );
    } else if (isClause) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, bold: true, size: FONT_SIZE, font: FONT })],
          spacing: { before: 240, after: 120, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: FIRST_LINE_INDENT },
        })
      );
    } else if (isParagraph) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: FONT_SIZE, font: FONT })],
          spacing: { after: 120, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: FIRST_LINE_INDENT },
        })
      );
    } else if (isInciso) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: FONT_SIZE, font: FONT })],
          spacing: { after: 80, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: convertMillimetersToTwip(12.5) },
        })
      );
    } else if (isSignatureLine) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: FONT_SIZE, font: FONT })],
          spacing: { before: 200, after: 80, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.CENTER,
        })
      );
    } else if (isSignatureBlock) {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: FONT_SIZE, font: FONT })],
          spacing: { after: 40, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.CENTER,
        })
      );
    } else {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: trimmed, size: FONT_SIZE, font: FONT })],
          spacing: { after: 120, line: LINE_SPACING, lineRule: LineRuleType.AUTO },
          alignment: AlignmentType.JUSTIFIED,
          indent: { firstLine: FIRST_LINE_INDENT },
        })
      );
    }
  }

  // Rodapé discreto
  children.push(
    new Paragraph({ spacing: { before: 600 } }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
      spacing: { before: 200, after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Documento gerado por ContratoSeguro. Recomenda-se revisão por advogado antes da assinatura.',
          size: FONT_SIZE_SMALL,
          color: '999999',
          font: FONT,
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
          margin: {
            top: convertMillimetersToTwip(30),    // 3cm
            bottom: convertMillimetersToTwip(20),  // 2cm
            left: convertMillimetersToTwip(30),    // 3cm
            right: convertMillimetersToTwip(20),   // 2cm
          },
        },
      },
      children,
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              children: [
                new TextRun({ children: [PageNumber.CURRENT], size: FONT_SIZE_SMALL, color: '999999', font: FONT }),
                new TextRun({ text: ' / ', size: FONT_SIZE_SMALL, color: '999999', font: FONT }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], size: FONT_SIZE_SMALL, color: '999999', font: FONT }),
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
