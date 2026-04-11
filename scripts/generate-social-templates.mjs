/**
 * Gera 7 imagens de template para posts no Instagram (1080x1080).
 * Uma por categoria. Upload automático para o Supabase Storage.
 * Rodar: node scripts/generate-social-templates.mjs
 */
import { createCanvas, GlobalFonts } from '@napi-rs/canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS = 'C:\\Users\\crisa\\.claude\\skills\\canvas-design\\canvas-fonts';
const OUT   = join(__dirname, '..', 'public', 'brand', 'social-templates');

mkdirSync(OUT, { recursive: true });

GlobalFonts.registerFromPath(join(FONTS, 'BigShoulders-Bold.ttf'),       'BigShoulders');
GlobalFonts.registerFromPath(join(FONTS, 'WorkSans-Bold.ttf'),           'WorkSansBold');
GlobalFonts.registerFromPath(join(FONTS, 'WorkSans-Regular.ttf'),        'WorkSans');
GlobalFonts.registerFromPath(join(FONTS, 'InstrumentSans-Regular.ttf'), 'InstrumentSans');
GlobalFonts.registerFromPath(join(FONTS, 'Jura-Light.ttf'),              'Jura');

const CATEGORIES = [
  { key: 'aluguel',     label: 'Contrato de Aluguel',       emoji: '🏠', color1: '#0f172a', color2: '#1e3a8a', accent: '#3b82f6' },
  { key: 'trabalho',    label: 'Contrato de Trabalho',      emoji: '💼', color1: '#0f172a', color2: '#14532d', accent: '#22c55e' },
  { key: 'servico',     label: 'Prestação de Serviço',      emoji: '🔧', color1: '#0f172a', color2: '#7c2d12', accent: '#f97316' },
  { key: 'compra_venda',label: 'Compra e Venda',            emoji: '🤝', color1: '#0f172a', color2: '#4c1d95', accent: '#a78bfa' },
  { key: 'consumidor',  label: 'Direito do Consumidor',     emoji: '🛒', color1: '#0f172a', color2: '#831843', accent: '#f472b6' },
  { key: 'digital',     label: 'Contratos Digitais',        emoji: '💻', color1: '#0f172a', color2: '#134e4a', accent: '#2dd4bf' },
  { key: 'geral',       label: 'Dica Jurídica',             emoji: '📋', color1: '#0f172a', color2: '#1e1b4b', accent: '#818cf8' },
];

function drawShield(ctx, cx, cy, size, color, alpha = 1.0) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = color;
  ctx.fillStyle = 'transparent';
  ctx.lineWidth = size * 0.04;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const w = size;
  const h = size * 1.15;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const r = w * 0.18;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h * 0.55);
  ctx.quadraticCurveTo(x + w, y + h * 0.82, cx, y + h);
  ctx.quadraticCurveTo(x, y + h * 0.82, x, y + h * 0.55);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.stroke();

  ctx.lineWidth = size * 0.05;
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.22, cy + h * 0.02);
  ctx.lineTo(cx - w * 0.04, cy + h * 0.18);
  ctx.lineTo(cx + w * 0.26, cy - h * 0.12);
  ctx.stroke();
  ctx.restore();
}

function generateTemplate(cat) {
  const W = 1080, H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, cat.color1);
  bg.addColorStop(1, cat.color2);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Dot grid
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  const step = 40;
  for (let x = step; x < W; x += step) {
    for (let y = step; y < H; y += step) {
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Center glow
  const glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 400);
  glow.addColorStop(0, `${cat.accent}33`);
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Top bar — brand
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  ctx.fillRect(0, 0, W, 100);
  ctx.restore();

  // Brand name top
  ctx.save();
  ctx.font = 'bold 36px BigShoulders';
  ctx.fillStyle = 'rgba(255,255,255,0.90)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('ContratoSeguro', 48, 50);
  ctx.restore();

  // Shield top-right
  drawShield(ctx, W - 65, 50, 56, 'rgba(255,255,255,0.70)', 1.0);

  // Center shield (large)
  drawShield(ctx, W / 2, H / 2 - 80, 220, cat.accent, 1.0);

  // Category badge
  ctx.save();
  const badgeW = 340, badgeH = 52;
  const bx = W / 2 - badgeW / 2;
  const by = H / 2 + 100;
  ctx.beginPath();
  ctx.roundRect(bx, by, badgeW, badgeH, 26);
  ctx.fillStyle = `${cat.accent}22`;
  ctx.fill();
  ctx.strokeStyle = `${cat.accent}66`;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  ctx.save();
  ctx.font = '26px WorkSans';
  ctx.fillStyle = cat.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${cat.emoji}  ${cat.label}`, W / 2, by + badgeH / 2);
  ctx.restore();

  // Tagline
  ctx.save();
  ctx.font = '32px InstrumentSans';
  ctx.fillStyle = 'rgba(255,255,255,0.80)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Analise seu contrato com IA', W / 2, H / 2 + 200);
  ctx.restore();

  // Bottom bar
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.30)';
  ctx.fillRect(0, H - 80, W, 80);
  ctx.restore();

  ctx.save();
  ctx.font = '22px Jura';
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('contrato-seguro-inky.vercel.app  ·  Gratuito  ·  Legislação Brasileira', W / 2, H - 40);
  ctx.restore();

  // Accent line bottom
  ctx.save();
  ctx.strokeStyle = cat.accent;
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.moveTo(60, H - 80);
  ctx.lineTo(W - 60, H - 80);
  ctx.stroke();
  ctx.restore();

  return canvas.toBuffer('image/png');
}

// Gerar todas as categorias
for (const cat of CATEGORIES) {
  const png = generateTemplate(cat);
  const filename = `social-${cat.key}.png`;
  writeFileSync(join(OUT, filename), png);
  console.log(`✅ ${filename}`);
}

console.log('\n📁 Templates em: public/brand/social-templates/');
console.log('\nAgora rodando upload para Supabase Storage...');

// Upload para Supabase Storage
const SUPABASE_URL = 'https://wdsfemqjwgdfrqedvqyh.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indkc2ZlbXFqd2dkZnJxZWR2cXloIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgxNjkwNywiZXhwIjoyMDkwMzkyOTA3fQ.aXL4Du5U9NVI0tMici2_ZFCA41vet7ZHionbwyzcvm4';

import { readFileSync } from 'fs';

for (const cat of CATEGORIES) {
  const filename = `social-${cat.key}.png`;
  const filepath = join(OUT, filename);
  const data = readFileSync(filepath);

  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/social-images/templates/${filename}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'image/png',
      'x-upsert': 'true',
    },
    body: data,
  });

  const json = await res.json();
  if (json.Key || json.path) {
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/social-images/templates/${filename}`;
    console.log(`☁️  ${filename} → ${publicUrl}`);
  } else {
    console.error(`❌ ${filename}:`, json);
  }
}

console.log('\n✅ Todos os templates prontos para uso!');
