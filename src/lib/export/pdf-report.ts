import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { DISCLAIMER_LEGAL } from '@/config/constants';
import { sanitizeForPdf } from './sanitize-pdf';

type ReportData = {
  filename: string;
  contractType: string;
  score: number;
  interpretation: string;
  summary: string;
  issues: {
    clause_id: string;
    original_text_summary: string;
    risk_level: string;
    explanation: string;
  }[];
  totalIssues: number;
};

const RISK_LABELS: Record<string, string> = {
  critical: 'CRITICO',
  high: 'ALTO',
  medium: 'MEDIO',
  low: 'BAIXO',
  ok: 'OK',
};

/**
 * Gera relatório PDF da análise.
 * Formatação formal: Times 12pt, justificado, margens 3cm/2cm,
 * mesmo padrão visual do contrato corrigido.
 */
export async function generateAnalysisReport(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const fontBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const fontItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  // A4 em pontos (595 x 842)
  const pageWidth = 595;
  const pageHeight = 842;
  // Margens formais: 3cm superior/esquerda, 2cm inferior/direita
  const marginTop = 85;
  const marginBottom = 57;
  const marginLeft = 85;
  const marginRight = 57;
  const contentWidth = pageWidth - marginLeft - marginRight;

  const fontSize = 12;
  const fontSizeTitle = 16;
  const fontSizeSection = 13;
  const fontSizeSmall = 9;
  const lineHeight = 18; // ~1.5 entrelinhas

  const pages: ReturnType<typeof doc.addPage>[] = [];
  let page = doc.addPage([pageWidth, pageHeight]);
  pages.push(page);
  let y = pageHeight - marginTop;

  const black = rgb(0.05, 0.05, 0.05);
  const darkGray = rgb(0.15, 0.15, 0.15);
  const gray = rgb(0.4, 0.4, 0.4);
  const lightGray = rgb(0.55, 0.55, 0.55);
  const blue = rgb(0.15, 0.39, 0.92);

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

  // Desenha texto justificado
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
  }) {
    text = sanitizeForPdf(text);
    const sz = opts.size || fontSize;
    const f = opts.font || font;
    const c = opts.color || darkGray;
    const indent = opts.indent || 0;
    const lh = opts.lh || lineHeight;
    const justify = opts.justify ?? false;
    const center = opts.center ?? false;

    const x = marginLeft + indent;
    const maxW = contentWidth - indent;

    const words = text.split(' ');
    let lineWords: string[] = [];
    let lineTextWidth = 0;

    for (const word of words) {
      const wordW = f.widthOfTextAtSize(word, sz);
      const spaceW = lineWords.length > 0 ? f.widthOfTextAtSize(' ', sz) : 0;

      if (lineWords.length > 0 && lineTextWidth + spaceW + wordW > maxW) {
        checkPage(lh + 5);
        if (justify) {
          drawJustifiedLine(lineWords, x, maxW, sz, f, c);
        } else if (center) {
          const tw = f.widthOfTextAtSize(lineWords.join(' '), sz);
          page.drawText(lineWords.join(' '), { x: marginLeft + (contentWidth - tw) / 2, y, size: sz, font: f, color: c });
        } else {
          page.drawText(lineWords.join(' '), { x, y, size: sz, font: f, color: c });
        }
        y -= lh;
        lineWords = [word];
        lineTextWidth = wordW;
      } else {
        lineTextWidth += spaceW + wordW;
        lineWords.push(word);
      }
    }
    // Última linha — nunca justifica
    if (lineWords.length > 0) {
      checkPage(lh + 5);
      const lineText = lineWords.join(' ');
      if (center) {
        const tw = f.widthOfTextAtSize(lineText, sz);
        page.drawText(lineText, { x: marginLeft + (contentWidth - tw) / 2, y, size: sz, font: f, color: c });
      } else {
        page.drawText(lineText, { x, y, size: sz, font: f, color: c });
      }
      y -= lh;
    }
  }

  // ====== CABEÇALHO ======
  drawWrapped('ContratoSeguro', { size: fontSizeTitle, font: fontBold, color: blue, center: true, lh: 22 });
  drawWrapped('Relatório de Análise de Contrato', { size: fontSizeSection, font: fontItalic, color: gray, center: true, lh: 20 });
  y -= 8;

  // Linha separadora
  page.drawLine({ start: { x: marginLeft, y }, end: { x: pageWidth - marginRight, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;

  // ====== INFORMAÇÕES ======
  drawWrapped(`Arquivo: ${data.filename}`, { size: fontSize, color: gray });
  drawWrapped(`Tipo: ${data.contractType}`, { size: fontSize, color: gray });
  drawWrapped(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { size: fontSize, color: gray });
  y -= 12;

  // ====== SCORE ======
  page.drawLine({ start: { x: marginLeft, y }, end: { x: pageWidth - marginRight, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 16;
  drawWrapped('SCORE DE RISCO', { size: fontSizeSection, font: fontBold, color: blue, center: true });
  y -= 4;
  drawWrapped(`${data.score} de 100 — ${data.interpretation}`, { size: fontSizeTitle, font: fontBold, color: black, center: true, lh: 22 });
  y -= 12;

  // ====== RESUMO ======
  page.drawLine({ start: { x: marginLeft, y }, end: { x: pageWidth - marginRight, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 16;
  drawWrapped('RESUMO EXECUTIVO', { size: fontSizeSection, font: fontBold, color: blue });
  y -= 6;
  drawWrapped(data.summary, { size: fontSize, color: darkGray, justify: true });
  y -= 12;

  // ====== PROBLEMAS ======
  page.drawLine({ start: { x: marginLeft, y }, end: { x: pageWidth - marginRight, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 16;
  drawWrapped(`PROBLEMAS IDENTIFICADOS (${data.totalIssues} total)`, { size: fontSizeSection, font: fontBold, color: blue });
  y -= 10;

  for (let i = 0; i < data.issues.length; i++) {
    const issue = data.issues[i];
    checkPage(70);

    const label = RISK_LABELS[issue.risk_level] || issue.risk_level.toUpperCase();

    // Número + severidade + cláusula
    drawWrapped(`${i + 1}. [${label}] Cláusula ${issue.clause_id}`, { size: fontSize, font: fontBold, color: black });
    y -= 2;

    // Resumo do problema
    drawWrapped(issue.original_text_summary, { size: fontSize, color: darkGray, justify: true, indent: 15 });
    y -= 2;

    // Explicação
    drawWrapped(issue.explanation, { size: fontSize, font: fontItalic, color: gray, justify: true, indent: 15 });
    y -= 10;

    // Separador entre issues
    if (i < data.issues.length - 1) {
      checkPage(10);
      const centerX = marginLeft + contentWidth / 2;
      page.drawText('- - -', {
        x: centerX - font.widthOfTextAtSize('- - -', 9) / 2,
        y,
        size: 9,
        font,
        color: rgb(0.8, 0.8, 0.8),
      });
      y -= 14;
    }
  }

  // ====== DISCLAIMER ======
  y -= 20;
  checkPage(60);
  page.drawLine({ start: { x: marginLeft, y }, end: { x: pageWidth - marginRight, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 14;
  drawWrapped('AVISO LEGAL', { size: fontSizeSmall, font: fontBold, color: lightGray });
  y -= 2;
  drawWrapped(DISCLAIMER_LEGAL, { size: fontSizeSmall, font: fontItalic, color: lightGray, justify: true });

  // ====== NUMERAÇÃO DE PÁGINAS ======
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
