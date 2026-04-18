/**
 * Geração de thumbnail 1080×1920 para o Reel.
 *
 * Estratégia atual: sharp gera thumbnail com fundo gradiente azul escuro
 * e overlay de texto em destaque — funciona imediatamente sem Replicate.
 *
 * Alternativa futura: quando Shotstack ou Replicate estiver configurado,
 * extrair frame real do vídeo no `thumbnail_moment` e compor em cima.
 * Trocar `createBackgroundBuffer()` pela extração de frame e o resto
 * do pipeline (overlay sharp) continua igual.
 *
 * Fluxo atual:
 *   1. Criar fundo 1080×1920 gradiente (azul profissional) via sharp.
 *   2. Overlay de logo/marca em SVG no topo.
 *   3. Overlay de texto (thumbnail_text) em SVG na zona inferior.
 *   4. Upload no Supabase Storage (bucket reels-ready/thumbs/).
 *   5. Retornar path + URL pública.
 */

import sharp from 'sharp';
import type { SupabaseClient } from '@supabase/supabase-js';

export type GenerateThumbnailParams = {
  readyVideoUrl: string;    // URL do vídeo processado (para futura extração de frame)
  momentSeconds: number;    // segundo para extrair frame (usado no futuro)
  text: string;             // overlay de até 4 palavras
  reelId: string;           // para nomear no Storage
  admin: SupabaseClient;
};

export type GenerateThumbnailResult = {
  storagePath: string;
  publicUrl: string;
};

/**
 * Gera SVG de overlay de texto (zona inferior, fundo semi-transparente).
 * Dimensões: 1080×420 — composto no bottom do 1080×1920.
 */
export function buildTextSvg(text: string): string {
  const safe = text.replace(/</g, '&lt;').replace(/>/g, '&gt;').slice(0, 40);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="420" viewBox="0 0 1080 420">
  <defs>
    <linearGradient id="textBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:rgba(0,0,0,0);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgba(0,0,0,0.85);stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="1080" height="420" fill="url(#textBg)" />
  <text
    x="540" y="260"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="108"
    font-weight="bold"
    fill="#FFFFFF"
    stroke="#000000"
    stroke-width="8"
    paint-order="stroke fill"
    letter-spacing="-2"
  >${safe}</text>
</svg>`;
}

/** SVG da marca "Contrato Seguro" no topo da thumbnail. */
function buildBrandSvg(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="180" viewBox="0 0 1080 180">
  <rect x="0" y="0" width="1080" height="180" fill="rgba(0,0,0,0.6)" rx="0" />
  <text
    x="540" y="120"
    text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="56"
    font-weight="bold"
    fill="#FFFFFF"
    letter-spacing="3"
  >CONTRATO SEGURO</text>
</svg>`;
}

/**
 * Cria um buffer de fundo 1080×1920 com gradiente azul profissional.
 * Simula o estilo de thumbnails jurídicos sérios.
 */
async function createBackgroundBuffer(): Promise<Buffer> {
  // Gradiente via SVG — sharp converte SVG → PNG
  const gradientSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="20%" y2="100%">
      <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#1e3a5f;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#0a2540;stop-opacity:1" />
    </linearGradient>
    <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
      <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)" />
  <rect width="1080" height="1920" fill="url(#grid)" />
  <!-- Detalhes decorativos -->
  <circle cx="200" cy="400" r="300" fill="rgba(59,130,246,0.06)" />
  <circle cx="900" cy="1600" r="400" fill="rgba(37,99,235,0.08)" />
  <!-- Linha de destaque lateral -->
  <rect x="0" y="0" width="8" height="1920" fill="#3b82f6" />
</svg>`;

  return await sharp(Buffer.from(gradientSvg))
    .resize(1080, 1920)
    .png()
    .toBuffer();
}

/**
 * Gera e salva a thumbnail do reel no Supabase Storage.
 */
export async function generateThumbnail(
  params: GenerateThumbnailParams
): Promise<GenerateThumbnailResult> {
  const background = await createBackgroundBuffer();

  const textSvg = buildTextSvg(params.text);
  const brandSvg = buildBrandSvg();

  const thumbnail = await sharp(background)
    .composite([
      // Marca no topo
      {
        input: Buffer.from(brandSvg),
        top: 0,
        left: 0,
      },
      // Texto principal no terço inferior (1920 - 420 = 1500px do topo)
      {
        input: Buffer.from(textSvg),
        top: 1500,
        left: 0,
      },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();

  const storagePath = `thumbs/${params.reelId}.jpg`;

  const { error: uploadError } = await params.admin.storage
    .from('reels-ready')
    .upload(storagePath, thumbnail, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Thumbnail upload falhou: ${uploadError.message}`);
  }

  const publicUrl = params.admin.storage
    .from('reels-ready')
    .getPublicUrl(storagePath).data.publicUrl;

  return { storagePath, publicUrl };
}
