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

export async function generateAnalysisReport(data: ReportData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 50;
  const contentWidth = pageWidth - margin * 2;

  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const blue = rgb(0.15, 0.39, 0.92);
  const gray = rgb(0.4, 0.4, 0.4);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.6, 0.6, 0.6);

  function drawText(text: string, opts: { x?: number; size?: number; font?: typeof font; color?: typeof blue; maxWidth?: number }) {
    text = sanitizeForPdf(text);
    const sz = opts.size || 10;
    const f = opts.font || font;
    const c = opts.color || darkGray;
    const x = opts.x || margin;
    const maxW = opts.maxWidth || contentWidth;

    // Quebra de linha simples
    const words = text.split(' ');
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (f.widthOfTextAtSize(test, sz) > maxW && line) {
        if (y < margin + 30) {
          page = doc.addPage([pageWidth, pageHeight]);
          y = pageHeight - margin;
        }
        page.drawText(line, { x, y, size: sz, font: f, color: c });
        y -= sz + 4;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      if (y < margin + 30) {
        page = doc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      page.drawText(line, { x, y, size: sz, font: f, color: c });
      y -= sz + 4;
    }
  }

  // Header
  drawText('ContratoSeguro', { size: 20, font: fontBold, color: blue });
  drawText('Relatorio de Analise de Contrato', { size: 12, color: gray });
  y -= 10;

  // Linha separadora
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 20;

  // Info
  drawText(`Arquivo: ${data.filename}`, { size: 10, color: gray });
  drawText(`Tipo: ${data.contractType}`, { size: 10, color: gray });
  drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, { size: 10, color: gray });
  y -= 10;

  // Score
  drawText('SCORE DE RISCO', { size: 14, font: fontBold, color: blue });
  y -= 4;
  drawText(`${data.score} de 100 - ${data.interpretation}`, { size: 16, font: fontBold });
  y -= 10;

  // Resumo
  drawText('RESUMO', { size: 12, font: fontBold, color: blue });
  y -= 4;
  drawText(data.summary, { size: 10, color: gray });
  y -= 10;

  // Problemas
  drawText(`PROBLEMAS IDENTIFICADOS (${data.totalIssues} total)`, { size: 12, font: fontBold, color: blue });
  y -= 8;

  for (const issue of data.issues) {
    if (y < margin + 80) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }

    const label = RISK_LABELS[issue.risk_level] || issue.risk_level.toUpperCase();
    drawText(`[${label}] Clausula ${issue.clause_id}`, { size: 10, font: fontBold });
    drawText(issue.original_text_summary, { size: 9, color: darkGray });
    drawText(issue.explanation, { size: 9, color: gray });
    y -= 8;
  }

  // Disclaimer
  y -= 20;
  if (y < margin + 60) {
    page = doc.addPage([pageWidth, pageHeight]);
    y = pageHeight - margin;
  }
  page.drawLine({ start: { x: margin, y }, end: { x: pageWidth - margin, y }, thickness: 0.5, color: rgb(0.85, 0.85, 0.85) });
  y -= 12;
  drawText('AVISO LEGAL', { size: 8, font: fontBold, color: lightGray });
  drawText(DISCLAIMER_LEGAL, { size: 7, color: lightGray });

  return doc.save();
}
