/**
 * Gerador de identidade visual ContratoSeguro
 * Logo (800x800) + Banner Facebook (1640x624)
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS = 'C:\\Users\\crisa\\.claude\\skills\\canvas-design\\canvas-fonts';
const OUT   = join(__dirname, '..', 'public', 'brand');

mkdirSync(OUT, { recursive: true });

// Registrar fontes
GlobalFonts.registerFromPath(join(FONTS, 'BigShoulders-Bold.ttf'),        'BigShoulders');
GlobalFonts.registerFromPath(join(FONTS, 'InstrumentSans-Regular.ttf'),   'InstrumentSans');
GlobalFonts.registerFromPath(join(FONTS, 'InstrumentSans-Bold.ttf'),      'InstrumentSansBold');
GlobalFonts.registerFromPath(join(FONTS, 'Jura-Light.ttf'),               'Jura');
GlobalFonts.registerFromPath(join(FONTS, 'WorkSans-Bold.ttf'),            'WorkSansBold');
GlobalFonts.registerFromPath(join(FONTS, 'WorkSans-Regular.ttf'),         'WorkSans');

/* ─── HELPERS ──────────────────────────────────────────────────────────────── */

function drawShield(ctx, cx, cy, size, color = 'white', alpha = 1.0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.045;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = size;
  const h = size * 1.15;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = w * 0.18; // corner radius top

  ctx.beginPath();
  // Top-left rounded
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  // Right side down
  ctx.lineTo(x + w, y + h * 0.55);
  // Curve to bottom point
  ctx.quadraticCurveTo(x + w, y + h * 0.82, cx, y + h);
  // Left curve
  ctx.quadraticCurveTo(x, y + h * 0.82, x, y + h * 0.55);
  // Left side up
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();

  // Inner checkmark / tick — elegant "verified" symbol
  ctx.lineWidth = size * 0.055;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, cy + h * 0.02);
  ctx.lineTo(cx - w * 0.04, cy + h * 0.18);
  ctx.lineTo(cx + w * 0.26, cy - h * 0.12);
  ctx.stroke();

  ctx.restore();
}

function drawGeoGrid(ctx, w, h, color, alpha = 0.06) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = 1;
  const step = 40;
  for (let x = 0; x < w + step; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h + step; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  ctx.restore();
}

function drawDots(ctx, w, h, color, alpha = 0.12) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  const step = 32;
  for (let x = step; x < w; x += step) {
    for (let y = step; y < h; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/* ─── 1. LOGO 800×800 ───────────────────────────────────────────────────────── */
{
  const W = 800, H = 800;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Gradient background — deep navy to electric blue
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0.0, '#0a1628');
  bg.addColorStop(0.5, '#0f2057');
  bg.addColorStop(1.0, '#1a3a8f');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle dot pattern
  drawDots(ctx, W, H, '#ffffff', 0.10);

  // Large decorative circle (background ring)
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.06)';
  ctx.lineWidth = 60;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 340, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(W / 2, H / 2, 310, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Diagonal accent lines (top-right corner)
  ctx.save();
  ctx.strokeStyle = 'rgba(100,160,255,0.15)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(W - 40 - i * 22, 0);
    ctx.lineTo(W, 40 + i * 22);
    ctx.stroke();
  }
  ctx.restore();

  // Center glow
  const glow = ctx.createRadialGradient(W / 2, H / 2 - 40, 0, W / 2, H / 2 - 40, 240);
  glow.addColorStop(0.0, 'rgba(59,130,246,0.35)');
  glow.addColorStop(1.0, 'rgba(59,130,246,0.00)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Shield — main icon
  drawShield(ctx, W / 2, H / 2 - 55, 200, 'white', 1.0);

  // "CS" below shield — bold monogram
  ctx.save();
  ctx.font = 'bold 88px BigShoulders';
  ctx.fillStyle = 'rgba(255,255,255,0.95)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('CS', W / 2, H / 2 + 128);
  ctx.restore();

  // Thin separator line
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 80, H / 2 + 162);
  ctx.lineTo(W / 2 + 80, H / 2 + 162);
  ctx.stroke();
  ctx.restore();

  // "ContratoSeguro" label
  ctx.save();
  ctx.font = '22px WorkSans';
  ctx.fillStyle = 'rgba(180,210,255,0.85)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '4px';
  ctx.fillText('CONTRATO SEGURO', W / 2, H / 2 + 192);
  ctx.restore();

  // Bottom tagline
  ctx.save();
  ctx.font = '15px Jura';
  ctx.fillStyle = 'rgba(255,255,255,0.40)';
  ctx.textAlign = 'center';
  ctx.fillText('CONTRATOS COM INTELIGÊNCIA ARTIFICIAL', W / 2, H - 48);
  ctx.restore();

  const png = canvas.toBuffer('image/png');
  writeFileSync(join(OUT, 'logo-facebook.png'), png);
  console.log('✅ logo-facebook.png criado (800x800)');
}

/* ─── 2. BANNER 1640×624 ───────────────────────────────────────────────────── */
{
  const W = 1640, H = 624;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Gradient — left navy to right blue
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0.0, '#08122a');
  bg.addColorStop(0.45, '#0d1f52');
  bg.addColorStop(1.0, '#1a4080');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Dot grid (right half, lighter)
  drawDots(ctx, W, H, '#ffffff', 0.08);

  // Diagonal divider — elegant slanted line from center
  ctx.save();
  const grad = ctx.createLinearGradient(W * 0.55, 0, W * 0.62, H);
  grad.addColorStop(0, 'rgba(255,255,255,0.00)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.10)');
  grad.addColorStop(1, 'rgba(255,255,255,0.00)');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W * 0.57, 0);
  ctx.lineTo(W * 0.52, H);
  ctx.stroke();
  ctx.restore();

  // LEFT SIDE glow
  const glowL = ctx.createRadialGradient(300, H / 2, 0, 300, H / 2, 380);
  glowL.addColorStop(0, 'rgba(37,99,235,0.30)');
  glowL.addColorStop(1, 'rgba(37,99,235,0.00)');
  ctx.fillStyle = glowL;
  ctx.fillRect(0, 0, W, H);

  // Shield — left panel
  drawShield(ctx, 160, H / 2 - 10, 140, 'white', 1.0);

  // "ContratoSeguro" — large headline
  ctx.save();
  ctx.font = 'bold 78px BigShoulders';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ContratoSeguro', 310, H / 2 - 28);
  ctx.restore();

  // Tagline
  ctx.save();
  ctx.font = '26px WorkSans';
  ctx.fillStyle = 'rgba(160,200,255,0.85)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Analise contratos com Inteligência Artificial', 312, H / 2 + 40);
  ctx.restore();

  // Thin rule
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.20)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(312, H / 2 + 68);
  ctx.lineTo(760, H / 2 + 68);
  ctx.stroke();
  ctx.restore();

  // RIGHT SIDE — feature bullets
  const features = [
    { icon: '⚡', text: 'Análise com IA em segundos' },
    { icon: '🔍', text: 'Detecta cláusulas abusivas' },
    { icon: '✓',  text: 'Gratuito para analisar' },
  ];

  const rx = W * 0.62;
  const rowH = 86;
  const startY = H / 2 - rowH;

  features.forEach((f, i) => {
    const ry = startY + i * rowH;

    // Icon circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(rx + 36, ry, 28, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.20)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Icon text
    ctx.save();
    ctx.font = '22px WorkSans';
    ctx.fillStyle = 'rgba(255,255,255,0.90)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(f.icon, rx + 36, ry);
    ctx.restore();

    // Feature text
    ctx.save();
    ctx.font = '28px InstrumentSans';
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(f.text, rx + 78, ry);
    ctx.restore();
  });

  // Bottom bar — URL
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, H - 48, W, 48);
  ctx.restore();

  ctx.save();
  ctx.font = '16px Jura';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('contrato-seguro-inky.vercel.app  ·  Análise jurídica com IA  ·  Gratuito', W / 2, H - 24);
  ctx.restore();

  // Decorative corner dots — bottom right
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      ctx.arc(W - 60 + i * 14, H - 80 + j * 14, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  const png = canvas.toBuffer('image/png');
  writeFileSync(join(OUT, 'banner-facebook.png'), png);
  console.log('✅ banner-facebook.png criado (1640x624)');
}

console.log('\n📁 Arquivos em: public/brand/');
