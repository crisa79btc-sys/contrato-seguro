/**
 * Gerador de imagens para posts de redes sociais.
 * Usa next/og (satori) com fonte Poppins carregada para visual profissional.
 *
 * Templates:
 *   type=cover  → slide de capa do carrossel
 *   type=item   → slide de conteúdo (cláusula/dica)
 *   type=cta    → slide de call-to-action final
 *   (omitido)   → template legado para posts únicos
 *
 * Parâmetros:
 *   type        → cover | item | cta
 *   title       → título principal
 *   subtitle    → subtítulo (cover) ou descrição breve (item)
 *   number      → número do slide item ("1"–"9")
 *   law         → base legal, ex: "CDC art. 51, II"
 *   current     → índice do slide atual (0-based, para dots)
 *   total       → total de slides (para dots)
 *   headline    → legado: headline do post único
 *   category    → legado: categoria do post único
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// ─── Paleta ───────────────────────────────────────────────────────────────────
const C = {
  navy:        '#0a1628',
  navyMid:     '#0f2040',
  navyLight:   '#1a3a6e',
  amber:       '#f59e0b',
  amberLight:  '#fbbf24',
  amberDark:   '#d97706',
  white:       '#ffffff',
  offWhite:    '#f1f5f9',
  gray200:     '#e2e8f0',
  gray400:     '#94a3b8',
  gray500:     '#64748b',
  gray700:     '#334155',
  gray900:     '#0f172a',
};

// ─── Categorias legado ────────────────────────────────────────────────────────
const CAT_EMOJI: Record<string, string> = {
  aluguel: '🏠', trabalho: '💼', servico: '🔧',
  compra_venda: '🚗', consumidor: '🛒', digital: '💻', geral: '📋',
};
const CAT_LABEL: Record<string, string> = {
  aluguel: 'Aluguel', trabalho: 'Trabalho', servico: 'Serviços',
  compra_venda: 'Compra e Venda', consumidor: 'Consumidor', digital: 'Digital', geral: 'Dica Jurídica',
};

// ─── Componentes base ─────────────────────────────────────────────────────────

function Logo({ light = true, size = 'md' }: { light?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? { emoji: 40, text: 30 } : size === 'sm' ? { emoji: 24, text: 18 } : { emoji: 32, text: 22 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: sz.emoji }}>🛡️</span>
      <span style={{
        fontFamily: 'Poppins',
        fontWeight: 700,
        fontSize: sz.text,
        color: light ? C.white : C.navy,
        letterSpacing: '-0.3px',
      }}>
        ContratoSeguro
      </span>
    </div>
  );
}

function Dot({ active, wide }: { active: boolean; wide?: boolean }) {
  return (
    <div style={{
      width: active || wide ? '24px' : '8px',
      height: '8px',
      borderRadius: '4px',
      background: active ? C.amber : 'rgba(255,255,255,0.25)',
    }} />
  );
}

function Dots({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {Array.from({ length: total }, (_, i) => (
        <Dot key={i} active={i === current} wide={i < current} />
      ))}
    </div>
  );
}

function DotsDark({ current, total }: { current: number; total: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i <= current ? '20px' : '8px',
          height: '8px',
          borderRadius: '4px',
          background: i <= current ? C.amber : C.gray200,
        }} />
      ))}
    </div>
  );
}

// ─── TEMPLATE: COVER ─────────────────────────────────────────────────────────
function CoverSlide({ title, subtitle, current, total }: {
  title: string; subtitle: string; current: number; total: number;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(160deg, ${C.navyMid} 0%, ${C.navy} 55%, #060e1f 100%)`,
      fontFamily: 'Poppins',
      position: 'relative',
    }}>
      {/* Accent circle blur (decorative) */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)',
      }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0',
      }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(245,158,11,0.15)',
          border: `1px solid rgba(245,158,11,0.35)`,
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '14px' }}>⚖️</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px',
            color: C.amberLight, letterSpacing: '0.3px',
          }}>
            DICA JURÍDICA
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px',
        gap: '20px',
      }}>
        {/* Amber bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '5px', borderRadius: '3px', background: C.amber }} />
          <div style={{ width: '20px', height: '5px', borderRadius: '3px', background: `rgba(245,158,11,0.3)` }} />
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 20 ? '72px' : '88px',
          color: C.white, lineHeight: 1.0,
          letterSpacing: '-2px',
        }}>
          {title}
        </div>

        {/* Subtitle */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '26px', color: 'rgba(255,255,255,0.6)',
          lineHeight: 1.45, maxWidth: '780px',
        }}>
          {subtitle}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 52px',
      }}>
        <Dots current={current} total={total} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'Poppins', fontSize: '15px',
          color: 'rgba(255,255,255,0.4)',
        }}>
          <span>Deslize para ver</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE: ITEM ───────────────────────────────────────────────────────────
function ItemSlide({ number, title, description, law, current, total }: {
  number: string; title: string; description: string;
  law: string; current: number; total: number;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex',
      background: C.offWhite,
      fontFamily: 'Poppins',
    }}>
      {/* Left amber stripe */}
      <div style={{
        width: '14px', flexShrink: 0,
        backgroundImage: `linear-gradient(to bottom, ${C.amber} 0%, ${C.amberDark} 100%)`,
      }} />

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: '50px 56px',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Logo light={false} size="sm" />
          <DotsDark current={current} total={total} />
        </div>

        {/* Number + Title row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', marginBottom: '22px' }}>
          {/* Big number circle */}
          <div style={{
            width: '92px', height: '92px', borderRadius: '50%', flexShrink: 0,
            backgroundImage: `linear-gradient(135deg, ${C.amberLight}, ${C.amberDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(245,158,11,0.35)',
          }}>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 800,
              fontSize: '46px', color: C.navy,
              lineHeight: 1,
            }}>
              {number}
            </span>
          </div>

          {/* Title */}
          <div style={{
            fontFamily: 'Poppins', fontWeight: 800,
            fontSize: title.length > 22 ? '40px' : '48px',
            color: C.gray900, lineHeight: 1.15,
            letterSpacing: '-0.8px', paddingTop: '6px',
          }}>
            {title}
          </div>
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '24px', color: C.gray500,
          lineHeight: 1.55, paddingLeft: '120px',
          marginBottom: '28px', flex: 1,
        }}>
          {description}
        </div>

        {/* Law badge */}
        <div style={{ display: 'flex', paddingLeft: '120px', marginBottom: '24px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: C.navy,
            borderRadius: '8px', padding: '10px 22px',
          }}>
            <span style={{ fontSize: '18px' }}>⚖️</span>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 600,
              fontSize: '18px', color: C.white,
              letterSpacing: '0.2px',
            }}>
              {law}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '15px', color: C.gray400,
        }}>
          https://contrato-seguro-inky.vercel.app
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE: CTA ───────────────────────────────────────────────────────────
function CtaSlide({ total }: { total: number }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(155deg, #0d1f40 0%, ${C.navy} 50%, #050d1a 100%)`,
      fontFamily: 'Poppins',
    }}>
      {/* Accent glow */}
      <div style={{
        position: 'absolute', bottom: '-80px', left: '50%',
        width: '600px', height: '400px',
        backgroundImage: 'radial-gradient(ellipse, rgba(245,158,11,0.1) 0%, transparent 70%)',
      }} />

      {/* Top */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0',
      }}>
        <Logo />
        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{
              width: '20px', height: '8px', borderRadius: '4px',
              background: C.amber,
              opacity: 0.5 + (i / total) * 0.5,
            }} />
          ))}
        </div>
      </div>

      {/* Center */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '28px', padding: '0 60px',
      }}>
        <span style={{ fontSize: '72px' }}>🛡️</span>

        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '4px',
        }}>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '54px',
            color: C.white, letterSpacing: '-1.5px', lineHeight: 1.1,
          }}>
            Analise seu contrato
          </span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '54px',
            color: C.amber, letterSpacing: '-1.5px', lineHeight: 1.1,
          }}>
            com IA agora
          </span>
        </div>

        {/* GRATUITO badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          backgroundImage: `linear-gradient(135deg, ${C.amber}, ${C.amberDark})`,
          borderRadius: '14px', padding: '16px 40px',
          boxShadow: '0 8px 30px rgba(245,158,11,0.4)',
        }}>
          <span style={{ fontSize: '22px' }}>✅</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800,
            fontSize: '28px', color: C.navy,
            letterSpacing: '1px',
          }}>
            GRATUITO
          </span>
        </div>

        {/* URL box */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px', padding: '18px 44px',
        }}>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 400,
            fontSize: '15px', color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            Acesse agora
          </span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700,
            fontSize: '26px', color: C.white,
            letterSpacing: '-0.3px',
          }}>
            https://contrato-seguro-inky.vercel.app
          </span>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'center',
        padding: '0 60px 44px',
      }}>
        <span style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '14px', color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
        }}>
          ⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.
        </span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: LEGADO ────────────────────────────────────────────────────────
function LegacySlide({ headline, category }: { headline: string; category: string }) {
  const emoji = CAT_EMOJI[category] || '📋';
  const label = CAT_LABEL[category] || 'Dica Jurídica';
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', alignItems: 'center',
      backgroundImage: `linear-gradient(155deg, ${C.navyMid} 0%, ${C.navy} 100%)`,
      fontFamily: 'Poppins', padding: '64px 60px',
    }}>
      <Logo size="lg" />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: C.white, borderRadius: '20px',
        padding: '48px 56px', width: '100%',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: C.offWhite, borderRadius: '100px',
          padding: '8px 20px', marginBottom: '22px',
        }}>
          <span style={{ fontSize: '22px' }}>{emoji}</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 600,
            fontSize: '17px', color: C.navyLight,
          }}>
            {label}
          </span>
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: headline.length > 40 ? '38px' : '48px',
          color: C.gray900, textAlign: 'center',
          lineHeight: 1.2, letterSpacing: '-0.8px',
        }}>
          {headline}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <span style={{
          fontFamily: 'Poppins', fontWeight: 600,
          fontSize: '20px', color: 'rgba(255,255,255,0.9)',
        }}>
          Analise seu contrato gratuitamente com IA
        </span>
        <span style={{
          fontFamily: 'Poppins', fontSize: '16px',
          color: 'rgba(255,255,255,0.45)',
        }}>
          https://contrato-seguro-inky.vercel.app
        </span>
      </div>
    </div>
  );
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  void params;

  // Carregar fontes Poppins do servidor local
  const base = request.nextUrl.origin;
  const [fontRegular, fontBold, fontExtraBold, fontSemiBold] = await Promise.all([
    fetch(`${base}/fonts/Poppins-Regular.ttf`).then(r => r.arrayBuffer()),
    fetch(`${base}/fonts/Poppins-Bold.ttf`).then(r => r.arrayBuffer()),
    fetch(`${base}/fonts/Poppins-ExtraBold.ttf`).then(r => r.arrayBuffer()),
    fetch(`${base}/fonts/Poppins-SemiBold.ttf`).then(r => r.arrayBuffer()),
  ]);

  const fonts = [
    { name: 'Poppins', data: fontRegular,   weight: 400 as const, style: 'normal' as const },
    { name: 'Poppins', data: fontSemiBold,  weight: 600 as const, style: 'normal' as const },
    { name: 'Poppins', data: fontBold,      weight: 700 as const, style: 'normal' as const },
    { name: 'Poppins', data: fontExtraBold, weight: 800 as const, style: 'normal' as const },
  ];

  const p           = request.nextUrl.searchParams;
  const type        = p.get('type') || '';
  const title       = p.get('title') || '';
  const subtitle    = p.get('subtitle') || '';
  const number      = p.get('number') || '1';
  const description = p.get('description') || '';
  const law         = p.get('law') || '';
  const current     = parseInt(p.get('current') || '0', 10);
  const total       = parseInt(p.get('total') || '7', 10);
  const headline    = p.get('headline') || 'Proteja seus direitos';
  const category    = p.get('category') || 'geral';

  let jsx: React.ReactElement;

  if (type === 'cover') {
    jsx = <CoverSlide title={title} subtitle={subtitle} current={current} total={total} />;
  } else if (type === 'item') {
    jsx = <ItemSlide number={number} title={title} description={description} law={law} current={current} total={total} />;
  } else if (type === 'cta') {
    jsx = <CtaSlide total={total} />;
  } else {
    jsx = <LegacySlide headline={headline} category={category} />;
  }

  return new ImageResponse(jsx, { width: 1080, height: 1080, fonts });
}
