import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { CorrectionOutput } from '@/schemas/ai-output.schema';

type PdfData = {
  filename: string;
  contractType: string;
  correction: CorrectionOutput;
};

/**
 * Gera PDF contendo APENAS o contrato corrigido limpo.
 * Formatação formal: Times (serif) 12pt, texto justificado, espaçamento 1.5,
 * margens 3cm/2cm, recuo de parágrafo 1,25cm, numeração de páginas.
 */
export async function generateCorrectedPdf(data: PdfData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // A4 em pontos (595 x 842)
  const pageWidth = 595;
  const pageHeight = 842;
  // Margens formais: 3cm superior/esquerda, 2cm inferior/direita
  // 1cm ≈ 28.35pt
  const marginTop = 85;     // ~3cm
  const marginBottom = 57;   // ~2cm
  const marginLeft = 85;     // ~3cm
  const marginRight = 57;    // ~2cm
  const contentWidth = pageWidth - marginLeft - marginRight;
  const firstLineIndent = 35.4; // ~1,25cm recuo de parágrafo

  const fontSize = 12;
  const fontSizeTitle = 14;
  const fontSizeSection = 13;
  const fontSizeSmall = 9;
  const lineHeight = 18; // ~1.5 entrelinhas para 12pt

  const pages: ReturnType<typeof doc.addPage>[] = [];
  let page = doc.addPage([pageWidth, pageHeight]);
  pages.push(page);
  let y = pageHeight - marginTop;

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const lightGray = rgb(0.55, 0.55, 0.55);

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

  // Desenha texto justificado: distribui espaço entre palavras para preencher a largura
  function drawJustifiedLine(words: string[], x: number, maxW: number, sz: number, f: typeof font, c: typeof black) {
    if (words.length <= 1) {
      page.drawText(words.join(''), { x, y, size: sz, font: f, color: c });
      return;
    }
    const textWidth = words.reduce((sum, w) => sum + f.widthOfTextAtSize(w, sz), 0);
    const totalSpace = maxW - textWidth;
    const spacePerGap = totalSpace / (words.length - 1);

    let cx = x;
    for (let i = 0; i < words.length; i++) {
      page.drawText(words[i], { x: cx, y, size: sz, font: f, color: c });
      cx += f.widthOfTextAtSize(words[i], sz) + spacePerGap;
    }
  }

  function drawWrapped(text: string, opts: {
    size?: number;
    font?: typeof font;
    color?: typeof black;
    indent?: number;
    lh?: number;
    justify?: boolean;
    center?: boolean;
    firstIndent?: number;
  }) {
    const sz = opts.size || fontSize;
    const f = opts.font || font;
    const c = opts.color || darkGray;
    const indent = opts.indent || 0;
    const lh = opts.lh || lineHeight;
    const justify = opts.justify ?? false;
    const center = opts.center ?? false;
    const fi = opts.firstIndent || 0;

    const x = marginLeft + indent;
    const maxW = contentWidth - indent;
    let isFirstLine = true;

    const words = text.split(' ');
    let lineWords: string[] = [];
    let lineTextWidth = 0;

    for (const word of words) {
      const wordW = f.widthOfTextAtSize(word, sz);
      const spaceW = lineWords.length > 0 ? f.widthOfTextAtSize(' ', sz) : 0;
      const currentIndent = isFirstLine ? fi : 0;
      const availW = maxW - currentIndent;

      if (lineWords.length > 0 && lineTextWidth + spaceW + wordW > availW) {
        checkPage(lh + 5);
        const lx = x + currentIndent;
        if (justify) {
          drawJustifiedLine(lineWords, lx, availW, sz, f, c);
        } else if (center) {
          const tw = f.widthOfTextAtSize(lineWords.join(' '), sz);
          page.drawText(lineWords.join(' '), { x: marginLeft + (contentWidth - tw) / 2, y, size: sz, font: f, color: c });
        } else {
          page.drawText(lineWords.join(' '), { x: lx, y, size: sz, font: f, color: c });
        }
        y -= lh;
        isFirstLine = false;
        lineWords = [word];
        lineTextWidth = wordW;
      } else {
        lineTextWidth += spaceW + wordW;
        lineWords.push(word);
      }
    }
    // Última linha — nunca justifica (padrão tipográfico)
    if (lineWords.length > 0) {
      checkPage(lh + 5);
      const currentIndent = isFirstLine ? fi : 0;
      const lx = x + currentIndent;
      const lineText = lineWords.join(' ');
      if (center) {
        const tw = f.widthOfTextAtSize(lineText, sz);
        page.drawText(lineText, { x: marginLeft + (contentWidth - tw) / 2, y, size: sz, font: f, color: c });
      } else {
        page.drawText(lineText, { x: lx, y, size: sz, font: f, color: c });
      }
      y -= lh;
    }
  }

  // Limpar tags de marcação
  const cleanText = data.correction.corrected_text
    .replace(/\[(REMOVED|MODIFIED|CLARIFIED|ADDED|UPDATED|SIMPLIFIED)\]\s*/g, '');

  const lines = cleanText.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      y -= 8;
      continue;
    }

    // Título principal do contrato (ex: "CONTRATO DE LOCAÇÃO DE IMÓVEL RESIDENCIAL")
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
      || /^.{1,50},\s*_{2,}.*de\s+\d{4}/.test(trimmed); // "Aracruz-ES, _____ de ..."

    // Bloco de identificação sob assinatura (nome da parte, "LOCADORA", "LOCATÁRIO", "CPF xxx")
    const isSignatureBlock = /^(LOCAT[AÁ]RI[OA]|LOCADORA|CPF\s+\d)/.test(trimmed)
      || /^TESTEMUNHAS:?\s*$/i.test(trimmed);

    if (isTitleMain) {
      y -= 10;
      checkPage(30);
      drawWrapped(trimmed, { size: fontSizeTitle, font: fontBold, color: black, lh: 22, center: true });
      y -= 14;
    } else if (isSection) {
      y -= 16;
      checkPage(25);
      drawWrapped(trimmed, { size: fontSizeSection, font: fontBold, color: black, lh: 20, center: true });
      y -= 6;
    } else if (isClause) {
      y -= 8;
      checkPage(20);
      drawWrapped(trimmed, { size: fontSize, font: fontBold, color: darkGray, justify: true, firstIndent: firstLineIndent });
      y -= 2;
    } else if (isParagraph) {
      checkPage(18);
      drawWrapped(trimmed, { size: fontSize, color: darkGray, justify: true, firstIndent: firstLineIndent });
    } else if (isInciso) {
      checkPage(18);
      drawWrapped(trimmed, { size: fontSize, color: darkGray, justify: true, indent: firstLineIndent });
    } else if (isSignatureLine) {
      y -= 10;
      checkPage(20);
      drawWrapped(trimmed, { size: fontSize, color: darkGray, center: true });
    } else if (isSignatureBlock) {
      checkPage(18);
      drawWrapped(trimmed, { size: fontSize, color: darkGray, center: true });
    } else {
      checkPage(18);
      drawWrapped(trimmed, { size: fontSize, color: darkGray, justify: true, firstIndent: firstLineIndent });
    }
  }

  // Rodapé discreto na última página
  y -= 25;
  checkPage(30);
  page.drawLine({
    start: { x: marginLeft, y },
    end: { x: pageWidth - marginRight, y },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });
  y -= 12;
  drawWrapped(
    'Documento gerado por ContratoSeguro. Recomenda-se revisão por advogado antes da assinatura.',
    { size: fontSizeSmall, font: fontItalic, color: lightGray, center: true }
  );

  // Numeração de páginas
  const totalPages = pages.length;
  for (let i = 0; i < totalPages; i++) {
    const p = pages[i];
    const text = `${i + 1} / ${totalPages}`;
    const textWidth = font.widthOfTextAtSize(text, 9);
    p.drawText(text, {
      x: (pageWidth - textWidth) / 2,
      y: 30,
      size: 9,
      font,
      color: lightGray,
    });
  }

  return doc.save();
}
