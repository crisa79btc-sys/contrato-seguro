import { getAnthropicClient } from '@/lib/ai/client';
import { AI_MODELS, OCR_TIMEOUT_MS } from '@/config/constants';

type ImageMediaType = 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';

/**
 * Extrai texto de uma imagem usando Claude Vision.
 * Funciona com fotos de contratos, scans, screenshots, etc.
 */
export async function extractTextFromImage(
  imageBuffer: Buffer,
  mediaType: ImageMediaType
): Promise<string> {
  const client = getAnthropicClient();
  const base64 = imageBuffer.toString('base64');

  const response = await client.messages.create(
    {
      model: AI_MODELS.analysis,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Extraia TODO o texto desta imagem de contrato. Retorne APENAS o texto extraído, sem comentários, sem formatação markdown. Preserve a estrutura original (cláusulas, parágrafos, numeração). Se houver partes ilegíveis, indique com [ILEGÍVEL].',
            },
          ],
        },
      ],
    },
    { signal: AbortSignal.timeout(OCR_TIMEOUT_MS) }
  );

  const textBlock = response.content.find((b) => b.type === 'text');
  const text = textBlock?.type === 'text' ? textBlock.text : '';

  if (!text || text.length < 20) {
    throw new Error(
      'Não foi possível extrair texto desta imagem. Verifique se a foto está nítida e legível.'
    );
  }

  return text;
}

/**
 * Extrai texto de páginas de PDF renderizadas como imagens via Claude Vision.
 * Usado quando pdf-parse não consegue extrair texto (PDFs escaneados).
 */
export async function extractTextFromPdfImages(
  pdfBuffer: Buffer
): Promise<string> {
  // Envia o PDF inteiro como base64 — Claude aceita PDFs diretamente
  const client = getAnthropicClient();
  const base64 = pdfBuffer.toString('base64');

  const response = await client.messages.create(
    {
      model: AI_MODELS.analysis,
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: 'application/pdf',
                data: base64,
              },
            },
            {
              type: 'text',
              text: 'Extraia TODO o texto deste documento PDF. Retorne APENAS o texto extraído, sem comentários, sem formatação markdown. Preserve a estrutura original (cláusulas, parágrafos, numeração). Se houver partes ilegíveis, indique com [ILEGÍVEL].',
            },
          ],
        },
      ],
    },
    { signal: AbortSignal.timeout(OCR_TIMEOUT_MS) }
  );

  const textBlock = response.content.find((b) => b.type === 'text');
  const text = textBlock?.type === 'text' ? textBlock.text : '';

  if (!text || text.length < 20) {
    throw new Error(
      'Não foi possível extrair texto deste PDF. Verifique se o documento está legível.'
    );
  }

  return text;
}
