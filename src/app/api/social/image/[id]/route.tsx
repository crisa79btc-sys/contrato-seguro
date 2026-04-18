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
 *   category    → aluguel | trabalho | servico | compra_venda | consumidor | digital | geral
 *   badge       → dica | mito_verdade | checklist | estatistica | pergunta
 *   title       → título principal
 *   subtitle    → subtítulo (cover) ou descrição breve (item)
 *   number      → número do slide item ("1"–"9")
 *   law         → base legal, ex: "CDC art. 51, II"
 *   current     → índice do slide atual (0-based, para dots)
 *   total       → total de slides (para dots)
 *   headline    → legado: headline do post único
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

// ─── Temas por categoria ──────────────────────────────────────────────────────
type Theme = {
  bg1: string; bg2: string; bg3: string;
  accent: string; accentLight: string; accentDark: string;
  itemBg: string; itemStripe: string; emoji: string;
};

const THEMES: Record<string, Theme> = {
  aluguel: {
    bg1: '#0d3b2e', bg2: '#0f4f3d', bg3: '#073527',
    accent: '#10b981', accentLight: '#34d399', accentDark: '#059669',
    itemBg: '#f0fdf4', itemStripe: '#10b981',
    emoji: '🏠',
  },
  trabalho: {
    bg1: '#1e1b4b', bg2: '#2d1f6b', bg3: '#130f38',
    accent: '#8b5cf6', accentLight: '#a78bfa', accentDark: '#7c3aed',
    itemBg: '#f5f3ff', itemStripe: '#8b5cf6',
    emoji: '💼',
  },
  servico: {
    bg1: '#431407', bg2: '#7c2d12', bg3: '#2c0d04',
    accent: '#f97316', accentLight: '#fb923c', accentDark: '#ea580c',
    itemBg: '#fff7ed', itemStripe: '#f97316',
    emoji: '🔧',
  },
  compra_venda: {
    bg1: '#2e1065', bg2: '#3b0764', bg3: '#1a0840',
    accent: '#a855f7', accentLight: '#c084fc', accentDark: '#9333ea',
    itemBg: '#faf5ff', itemStripe: '#a855f7',
    emoji: '🤝',
  },
  consumidor: {
    bg1: '#4a0219', bg2: '#881337', bg3: '#2d0110',
    accent: '#f43f5e', accentLight: '#fb7185', accentDark: '#e11d48',
    itemBg: '#fff1f2', itemStripe: '#f43f5e',
    emoji: '🛒',
  },
  digital: {
    bg1: '#0c1a2e', bg2: '#0e3d5c', bg3: '#060f1c',
    accent: '#06b6d4', accentLight: '#22d3ee', accentDark: '#0891b2',
    itemBg: '#ecfeff', itemStripe: '#06b6d4',
    emoji: '💻',
  },
  geral: {
    bg1: '#0a1628', bg2: '#0f2040', bg3: '#060e1f',
    accent: '#f59e0b', accentLight: '#fbbf24', accentDark: '#d97706',
    itemBg: '#fffbeb', itemStripe: '#f59e0b',
    emoji: '⚖️',
  },
};

function getTheme(category: string): Theme {
  return THEMES[category] ?? THEMES.geral!;
}

// ─── Constantes ───────────────────────────────────────────────────────────────
const WHITE = '#ffffff';
const OFFWHITE = '#f8fafc';
const GRAY400 = '#94a3b8';
const GRAY500 = '#64748b';
const GRAY700 = '#334155';
const GRAY900 = '#0f172a';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();
const APP_URL_DISPLAY = APP_URL.replace(/^https?:\/\//, '');

// ─── Mapeamento de badge ──────────────────────────────────────────────────────
const BADGE_MAP: Record<string, string> = {
  dica:         'DICA JURÍDICA',
  mito_verdade: 'MITO ou VERDADE?',
  checklist:    'CHECKLIST',
  estatistica:  'VOCÊ SABIA?',
  pergunta:     'PARA REFLETIR',
  caso_real:    'CASO REAL 🚨',
};

const CAT_EMOJI: Record<string, string> = {
  aluguel: '🏠', trabalho: '💼', servico: '🔧',
  compra_venda: '🤝', consumidor: '🛒', digital: '💻', geral: '📋',
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
        fontFamily: 'Poppins', fontWeight: 700, fontSize: sz.text,
        color: light ? WHITE : GRAY900, letterSpacing: '-0.3px',
      }}>
        ContratoSeguro
      </span>
    </div>
  );
}

function Dots({ current, total, accent }: { current: number; total: number; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? '24px' : i < current ? '20px' : '8px',
          height: '8px', borderRadius: '4px',
          background: i <= current ? accent : 'rgba(255,255,255,0.2)',
        }} />
      ))}
    </div>
  );
}

function DotsDark({ current, total, accent }: { current: number; total: number; accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i <= current ? '20px' : '8px',
          height: '8px', borderRadius: '4px',
          background: i <= current ? accent : '#e2e8f0',
        }} />
      ))}
    </div>
  );
}

// ─── TEMPLATE: COVER padrão ───────────────────────────────────────────────────
function CoverSlide({ title, subtitle, current, total, badgeText, theme }: {
  title: string; subtitle: string; current: number; total: number;
  badgeText: string; theme: Theme;
}) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(160deg, ${theme.bg2} 0%, ${theme.bg1} 55%, ${theme.bg3} 100%)`,
      fontFamily: 'Poppins', position: 'relative',
    }}>
      {/* Accent glow */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-120px',
        width: '500px', height: '500px', borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent}1e 0%, transparent 70%)`,
      }} />
      {/* Accent glow bottom-left */}
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-80px',
        width: '400px', height: '400px', borderRadius: '50%',
        background: `radial-gradient(circle, ${theme.accent}12 0%, transparent 70%)`,
      }} />

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0',
      }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: `${theme.accent}26`,
          border: `1px solid ${theme.accent}59`,
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '14px' }}>{theme.emoji}</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px',
            color: theme.accentLight, letterSpacing: '0.3px',
          }}>
            {badgeText}
          </span>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '56px', height: '5px', borderRadius: '3px', background: theme.accent }} />
          <div style={{ width: '20px', height: '5px', borderRadius: '3px', background: `${theme.accent}4d` }} />
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 20 ? '72px' : '88px',
          color: WHITE, lineHeight: 1.0, letterSpacing: '-2px',
        }}>
          {title}
        </div>
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
        <Dots current={current} total={total} accent={theme.accent} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          fontFamily: 'Poppins', fontSize: '15px', color: 'rgba(255,255,255,0.4)',
        }}>
          <span>Deslize para ver</span>
          <span>→</span>
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE: COVER pergunta ─────────────────────────────────────────────────
function CoverPergunta({ title, subtitle, current, total, theme }: {
  title: string; subtitle: string; current: number; total: number; theme: Theme;
}) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(135deg, ${theme.bg1} 0%, ${theme.bg3} 100%)`,
      fontFamily: 'Poppins', position: 'relative',
    }}>
      {/* Giant ? watermark */}
      <div style={{
        position: 'absolute', right: '40px', top: '50%',
        fontSize: '400px', color: `${theme.accent}10`,
        fontFamily: 'Poppins', fontWeight: 800, lineHeight: 1,
        transform: 'translateY(-50%)',
      }}>?</div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '52px 60px 0' }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: `${theme.accent}26`, border: `1px solid ${theme.accent}59`,
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '18px' }}>🤔</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px', color: theme.accentLight }}>
            PARA REFLETIR
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: '28px',
      }}>
        {/* Accent circle with ? */}
        <div style={{
          width: '90px', height: '90px', borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 30px ${theme.accent}4d`,
        }}>
          <span style={{ fontSize: '52px', color: WHITE, fontFamily: 'Poppins', fontWeight: 800 }}>?</span>
        </div>

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 22 ? '64px' : '76px',
          color: WHITE, lineHeight: 1.05, letterSpacing: '-1.5px', maxWidth: '820px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '26px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, maxWidth: '740px',
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px 52px' }}>
        <Dots current={current} total={total} accent={theme.accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: '15px', color: 'rgba(255,255,255,0.35)' }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: COVER mito_verdade ─────────────────────────────────────────────
function CoverMitoVerdade({ title, subtitle, current, total, theme }: {
  title: string; subtitle: string; current: number; total: number; theme: Theme;
}) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(160deg, ${theme.bg2} 0%, ${theme.bg1} 100%)`,
      fontFamily: 'Poppins',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '52px 60px 0' }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: `${theme.accent}26`, border: `1px solid ${theme.accent}59`,
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '14px' }}>🔍</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px', color: theme.accentLight }}>
            MITO ou VERDADE?
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: '32px',
      }}>
        {/* MITO / VERDADE tags */}
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{
            padding: '10px 24px', borderRadius: '8px',
            background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)',
            fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: '#fca5a5',
          }}>❌ MITO</div>
          <div style={{
            padding: '10px 24px', borderRadius: '8px',
            background: `${theme.accent}26`, border: `1px solid ${theme.accent}59`,
            fontFamily: 'Poppins', fontWeight: 700, fontSize: '20px', color: theme.accentLight,
          }}>✅ VERDADE?</div>
        </div>

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 22 ? '62px' : '74px',
          color: WHITE, lineHeight: 1.05, letterSpacing: '-1.5px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '25px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45,
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px 52px' }}>
        <Dots current={current} total={total} accent={theme.accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: '15px', color: 'rgba(255,255,255,0.35)' }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: COVER estatistica ─────────────────────────────────────────────
function CoverEstatistica({ title, subtitle, current, total, theme }: {
  title: string; subtitle: string; current: number; total: number; theme: Theme;
}) {
  // Extrai o número se o título começar com um (ex: "78% dos contratos...")
  const numMatch = title.match(/^(\d[\d,.%]+)/);
  const numPart = numMatch ? numMatch[1] : '';
  const textPart = numPart ? title.slice(numPart.length).trim() : title;

  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(150deg, ${theme.bg2} 0%, ${theme.bg1} 60%, ${theme.bg3} 100%)`,
      fontFamily: 'Poppins',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '52px 60px 0' }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: `${theme.accent}26`, border: `1px solid ${theme.accent}59`,
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '14px' }}>📊</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '15px', color: theme.accentLight }}>
            VOCÊ SABIA?
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: '16px',
      }}>
        {numPart ? (
          <>
            <div style={{
              fontFamily: 'Poppins', fontWeight: 800, fontSize: '120px',
              color: theme.accentLight, lineHeight: 0.95, letterSpacing: '-3px',
            }}>
              {numPart}
            </div>
            <div style={{
              fontFamily: 'Poppins', fontWeight: 700, fontSize: '48px',
              color: WHITE, lineHeight: 1.1, letterSpacing: '-1px', maxWidth: '780px',
            }}>
              {textPart}
            </div>
          </>
        ) : (
          <div style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '72px',
            color: WHITE, lineHeight: 1.05, letterSpacing: '-2px',
          }}>
            {title}
          </div>
        )}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '24px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.45, maxWidth: '760px',
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px 52px' }}>
        <Dots current={current} total={total} accent={theme.accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: '15px', color: 'rgba(255,255,255,0.35)' }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: COVER caso_real ───────────────────────────────────────────────
function CoverCasoReal({ title, subtitle, current, total, theme }: {
  title: string; subtitle: string; current: number; total: number; theme: Theme;
}) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(155deg, ${theme.bg2} 0%, ${theme.bg1} 100%)`,
      fontFamily: 'Poppins', position: 'relative',
    }}>
      {/* Faixa superior vermelha estilo "alerta" */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '12px',
        background: 'linear-gradient(90deg, #dc2626, #f43f5e, #dc2626)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '60px 60px 0' }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.45)',
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '14px' }}>🚨</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '15px', color: '#fca5a5', letterSpacing: '0.5px' }}>
            CASO REAL
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', gap: '24px' }}>
        {/* Aspas decorativas */}
        <span style={{ fontSize: '140px', lineHeight: 0.6, color: `${theme.accent}55`, fontFamily: 'Poppins', fontWeight: 800 }}>
          {'"'}
        </span>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 20 ? '68px' : '84px',
          color: WHITE, lineHeight: 1.05, letterSpacing: '-1.5px', marginTop: '-40px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: '25px',
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, maxWidth: '780px',
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px 52px' }}>
        <Dots current={current} total={total} accent={theme.accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: ITEM ───────────────────────────────────────────────────────────
function ItemSlide({ number, title, description, law, current, total, theme }: {
  number: string; title: string; description: string;
  law: string; current: number; total: number; theme: Theme;
}) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex',
      background: theme.itemBg, fontFamily: 'Poppins',
    }}>
      {/* Left accent stripe */}
      <div style={{
        width: '14px', flexShrink: 0,
        backgroundImage: `linear-gradient(to bottom, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
      }} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '50px 56px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <Logo light={false} size="sm" />
          <DotsDark current={current} total={total} accent={theme.accent} />
        </div>

        {/* Number + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '28px', marginBottom: '22px' }}>
          <div style={{
            width: '92px', height: '92px', borderRadius: '50%', flexShrink: 0,
            backgroundImage: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accentDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 24px ${theme.accent}59`,
          }}>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 800, fontSize: '46px',
              color: WHITE, lineHeight: 1,
            }}>
              {number}
            </span>
          </div>
          <div style={{
            fontFamily: 'Poppins', fontWeight: 800,
            fontSize: title.length > 22 ? '40px' : '48px',
            color: GRAY900, lineHeight: 1.15, letterSpacing: '-0.8px', paddingTop: '6px',
          }}>
            {title}
          </div>
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400,
          fontSize: '24px', color: GRAY500, lineHeight: 1.55,
          paddingLeft: '120px', marginBottom: '28px', flex: 1,
        }}>
          {description}
        </div>

        {/* Law badge */}
        {law && (
          <div style={{ display: 'flex', paddingLeft: '120px', marginBottom: '24px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: theme.bg1,
              borderRadius: '8px', padding: '10px 22px',
            }}>
              <span style={{ fontSize: '18px' }}>⚖️</span>
              <span style={{
                fontFamily: 'Poppins', fontWeight: 600, fontSize: '18px', color: WHITE, letterSpacing: '0.2px',
              }}>
                {law}
              </span>
            </div>
          </div>
        )}

        <div style={{ fontFamily: 'Poppins', fontWeight: 400, fontSize: '15px', color: GRAY400 }}>
          {APP_URL_DISPLAY}
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE: CTA ───────────────────────────────────────────────────────────
function CtaSlide({ total, theme }: { total: number; theme: Theme }) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(155deg, ${theme.bg2} 0%, ${theme.bg1} 50%, ${theme.bg3} 100%)`,
      fontFamily: 'Poppins', position: 'relative',
    }}>
      <div style={{
        position: 'absolute', bottom: '-80px', left: '50%',
        width: '600px', height: '400px',
        backgroundImage: `radial-gradient(ellipse, ${theme.accent}1a 0%, transparent 70%)`,
      }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0',
      }}>
        <Logo />
        <div style={{ display: 'flex', gap: '5px' }}>
          {Array.from({ length: total }, (_, i) => (
            <div key={i} style={{
              width: '20px', height: '8px', borderRadius: '4px',
              background: theme.accent, opacity: 0.5 + (i / total) * 0.5,
            }} />
          ))}
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '28px', padding: '0 60px',
      }}>
        <span style={{ fontSize: '72px' }}>🛡️</span>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '54px',
            color: WHITE, letterSpacing: '-1.5px', lineHeight: 1.1,
          }}>
            Analise seu contrato
          </span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '54px',
            color: theme.accentLight, letterSpacing: '-1.5px', lineHeight: 1.1,
          }}>
            com IA agora
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          backgroundImage: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
          borderRadius: '14px', padding: '16px 40px',
          boxShadow: `0 8px 30px ${theme.accent}66`,
        }}>
          <span style={{ fontSize: '22px' }}>✅</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: '28px',
            color: WHITE, letterSpacing: '1px',
          }}>
            GRATUITO
          </span>
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '14px', padding: '18px 44px',
        }}>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 400, fontSize: '15px',
            color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', textTransform: 'uppercase',
          }}>
            Acesse agora
          </span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: '26px',
            color: WHITE, letterSpacing: '-0.3px',
          }}>
            {APP_URL}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', padding: '0 60px 44px' }}>
        <span style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: '14px',
          color: 'rgba(255,255,255,0.3)', textAlign: 'center',
        }}>
          ⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.
        </span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: LEGADO ────────────────────────────────────────────────────────
function LegacySlide({ headline, category }: { headline: string; category: string }) {
  const theme = getTheme(category);
  const emoji = CAT_EMOJI[category] || '📋';
  const label = CAT_LABEL[category] || 'Dica Jurídica';
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', alignItems: 'center',
      backgroundImage: `linear-gradient(155deg, ${theme.bg2} 0%, ${theme.bg1} 100%)`,
      fontFamily: 'Poppins', padding: '64px 60px',
    }}>
      <Logo size="lg" />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: WHITE, borderRadius: '20px',
        padding: '48px 56px', width: '100%',
        boxShadow: '0 32px 64px rgba(0,0,0,0.4)',
        borderTop: `6px solid ${theme.accent}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: OFFWHITE, borderRadius: '100px',
          padding: '8px 20px', marginBottom: '22px',
        }}>
          <span style={{ fontSize: '22px' }}>{emoji}</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '17px', color: GRAY700 }}>
            {label}
          </span>
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: headline.length > 40 ? '38px' : '48px',
          color: GRAY900, textAlign: 'center',
          lineHeight: 1.2, letterSpacing: '-0.8px',
        }}>
          {headline}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: '20px', color: 'rgba(255,255,255,0.9)' }}>
          Analise seu contrato gratuitamente com IA
        </span>
        <span style={{ fontFamily: 'Poppins', fontSize: '16px', color: 'rgba(255,255,255,0.45)' }}>
          {APP_URL_DISPLAY}
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
  const category    = p.get('category') || 'geral';
  const badge       = p.get('badge') || 'dica';
  const title       = p.get('title') || '';
  const subtitle    = p.get('subtitle') || '';
  const number      = p.get('number') || '1';
  const description = p.get('description') || '';
  const law         = p.get('law') || '';
  const current     = parseInt(p.get('current') || '0', 10);
  const total       = parseInt(p.get('total') || '7', 10);
  const headline    = p.get('headline') || 'Proteja seus direitos';
  const badgeText   = BADGE_MAP[badge] || 'DICA JURÍDICA';

  const theme = getTheme(category);

  let jsx: React.ReactElement;

  if (type === 'cover') {
    if (badge === 'pergunta') {
      jsx = <CoverPergunta title={title} subtitle={subtitle} current={current} total={total} theme={theme} />;
    } else if (badge === 'mito_verdade') {
      jsx = <CoverMitoVerdade title={title} subtitle={subtitle} current={current} total={total} theme={theme} />;
    } else if (badge === 'estatistica') {
      jsx = <CoverEstatistica title={title} subtitle={subtitle} current={current} total={total} theme={theme} />;
    } else if (badge === 'caso_real') {
      jsx = <CoverCasoReal title={title} subtitle={subtitle} current={current} total={total} theme={theme} />;
    } else {
      jsx = <CoverSlide title={title} subtitle={subtitle} current={current} total={total} badgeText={badgeText} theme={theme} />;
    }
  } else if (type === 'item') {
    jsx = <ItemSlide number={number} title={title} description={description} law={law} current={current} total={total} theme={theme} />;
  } else if (type === 'cta') {
    jsx = <CtaSlide total={total} theme={theme} />;
  } else {
    jsx = <LegacySlide headline={headline} category={category} />;
  }

  return new ImageResponse(jsx, { width: 1080, height: 1080, fonts });
}
