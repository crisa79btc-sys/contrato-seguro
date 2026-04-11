/**
 * Gera ícones PWA para o ContratoSeguro.
 * Necessário para: instalação via browser, Microsoft Store, Google Play (via PWABuilder).
 *
 * Rodar: node scripts/generate-pwa-icons.mjs
 *
 * Gera:
 *  - public/icon-192.png  (ícone padrão PWA)
 *  - public/icon-512.png  (ícone high-res PWA)
 *  - public/icon-maskable-192.png  (Android adaptive icon)
 *  - public/icon-maskable-512.png  (Android adaptive icon, store listing)
 *  - public/apple-touch-icon.png   (180x180 para iOS)
 *  - public/favicon-32.png         (favicon 32x32)
 */

import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS = 'C:\\Users\\crisa\\.claude\\skills\\canvas-design\\canvas-fonts';
const OUT   = join(__dirname, '..', 'public');

mkdirSync(OUT, { recursive: true });

// Tentar carregar fontes (não bloquear se ausentes)
try {
  GlobalFonts.registerFromPath(join(FONTS, 'WorkSans-Bold.ttf'), 'WorkSansBold');
} catch {
  // fallback para fonte padrão do sistema
}

/**
 * Desenha o ícone do ContratoSeguro em um canvas.
 * @param {number} size - Tamanho total do canvas
 * @param {boolean} maskable - Se true, adiciona padding de segurança para ícone maskable
 */
function drawIcon(size, maskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Padding de segurança para maskable (10% de cada lado = safe zone de 80%)
  const pad = maskable ? size * 0.1 : 0;
  const inner = size - pad * 2;

  // === Fundo ===
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0,   '#1a1035');
  grad.addColorStop(0.5, '#2d1b69');
  grad.addColorStop(1,   '#0f0e17');
  ctx.fillStyle = grad;

  if (maskable) {
    // Maskable: fundo cobre tudo (sem arredondamento)
    ctx.fillRect(0, 0, size, size);
  } else {
    // Ícone normal: fundo com bordas arredondadas
    const r = size * 0.22;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(size - r, 0);
    ctx.quadraticCurveTo(size, 0, size, r);
    ctx.lineTo(size, size - r);
    ctx.quadraticCurveTo(size, size, size - r, size);
    ctx.lineTo(r, size);
    ctx.quadraticCurveTo(0, size, 0, size - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();
  }

  // === Brilho sutil ===
  const glow = ctx.createRadialGradient(
    pad + inner * 0.5, pad + inner * 0.35, 0,
    pad + inner * 0.5, pad + inner * 0.35, inner * 0.6
  );
  glow.addColorStop(0, 'rgba(167, 139, 250, 0.18)');
  glow.addColorStop(1, 'rgba(167, 139, 250, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, size, size);

  // === Escudo ===
  const cx = pad + inner * 0.5;
  const cy = pad + inner * 0.44;
  const sw = inner * 0.52;
  const sh = sw * 1.15;

  // Sombra do escudo
  ctx.shadowColor = 'rgba(124, 58, 237, 0.6)';
  ctx.shadowBlur = inner * 0.12;

  // Preenchimento do escudo (gradiente violeta)
  const shieldGrad = ctx.createLinearGradient(cx - sw / 2, cy - sh / 2, cx + sw / 2, cy + sh / 2);
  shieldGrad.addColorStop(0, 'rgba(196, 181, 253, 0.15)');
  shieldGrad.addColorStop(1, 'rgba(124, 58, 237, 0.25)');

  function shieldPath(context, centerX, centerY, width, height) {
    const x = centerX - width / 2;
    const y = centerY - height / 2;
    const r = width * 0.2;
    const lw = width * 0.04;

    context.beginPath();
    context.moveTo(x + r, y);
    context.lineTo(x + width - r, y);
    context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height * 0.52);
    context.quadraticCurveTo(centerX, y + height * 1.12, x, y + height * 0.52);
    context.lineTo(x, y + r);
    context.quadraticCurveTo(x, y, x + r, y);
    context.closePath();
    return lw;
  }

  // Fill
  ctx.fillStyle = shieldGrad;
  shieldPath(ctx, cx, cy, sw, sh);
  ctx.fill();

  // Borda branca
  ctx.shadowBlur = 0;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = inner * 0.025;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  shieldPath(ctx, cx, cy, sw, sh);
  ctx.stroke();

  // Checkmark dentro do escudo
  const ck = inner * 0.09;
  ctx.shadowColor = 'rgba(196, 181, 253, 0.8)';
  ctx.shadowBlur = inner * 0.04;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = inner * 0.035;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(cx - ck, cy + ck * 0.1);
  ctx.lineTo(cx - ck * 0.1, cy + ck * 0.9);
  ctx.lineTo(cx + ck * 0.95, cy - ck * 0.6);
  ctx.stroke();

  ctx.shadowBlur = 0;

  // === Texto "CS" ===
  const fontSize = inner * 0.11;
  ctx.font = `bold ${fontSize}px WorkSansBold, Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(196, 181, 253, 0.85)';
  ctx.fillText('CS', cx, pad + inner * 0.84);

  return canvas;
}

const ICONS = [
  { name: 'icon-192.png',           size: 192,  maskable: false },
  { name: 'icon-512.png',           size: 512,  maskable: false },
  { name: 'icon-maskable-192.png',  size: 192,  maskable: true  },
  { name: 'icon-maskable-512.png',  size: 512,  maskable: true  },
  { name: 'apple-touch-icon.png',   size: 180,  maskable: false },
  { name: 'favicon-32.png',         size: 32,   maskable: false },
];

console.log('Gerando ícones PWA...\n');

for (const icon of ICONS) {
  const canvas = drawIcon(icon.size, icon.maskable);
  const outPath = join(OUT, icon.name);
  writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(`✅ ${icon.name} (${icon.size}x${icon.size})`);
}

console.log('\n✅ Todos os ícones gerados em public/');
