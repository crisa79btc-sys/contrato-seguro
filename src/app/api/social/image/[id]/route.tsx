/**
 * Gerador de imagens 1080×1080 para posts de redes sociais.
 * Design: v1 Dossier Editorial — mesmo visual da landing page.
 *
 * Parâmetros (query string):
 *   type        → cover | item | before | after | cta  (legado: omitir = single)
 *   category    → aluguel | trabalho | servico | compra_venda | consumidor | digital | condominio | geral
 *   badge       → dica | mito_verdade | checklist | estatistica | pergunta | caso_real | antes_depois
 *   title       → título principal
 *   subtitle    → subtítulo (cover) ou descrição breve (item)
 *   number      → número do item ("1"–"9")
 *   description → texto longo do item
 *   law         → base legal, ex: "CDC art. 51, II"
 *   current     → índice 0-based do slide atual (para dots)
 *   total       → total de slides (para dots)
 *   headline    → legado: headline para slide único
 */

import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const BG        = '#0b0613';
const BG_CARD   = '#17102a';
const BG_ELEV   = '#1f162f';
const TEXT      = '#f4f0ff';
const TEXT_MUT  = '#a49bbb';
const TEXT_DIM  = '#6b6181';
const VIOLET    = '#8b5cf6';
const VIO_BRT   = '#b39dff';
const SUCCESS   = '#52d39f';
const DANGER    = '#fb7185';
const WARN      = '#fbbf24';
const BORDER    = 'rgba(255,255,255,0.08)';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();
const APP_DISPLAY = APP_URL.replace(/^https?:\/\//, '');

// ─── Acento por categoria (mantém cor de destaque no feed) ─────────────────────
const CAT_ACCENT: Record<string, string> = {
  aluguel:     '#10b981',
  trabalho:    '#8b5cf6',
  servico:     '#f97316',
  compra_venda:'#a855f7',
  consumidor:  '#f43f5e',
  digital:     '#06b6d4',
  condominio:  '#3b82f6',
  geral:       '#f59e0b',
};
const CAT_LABEL: Record<string, string> = {
  aluguel:     'Aluguel',
  trabalho:    'Trabalho',
  servico:     'Serviços',
  compra_venda:'Compra e Venda',
  consumidor:  'Consumidor',
  digital:     'Digital',
  condominio:  'Condomínio',
  geral:       'Direito',
};
const CAT_EMOJI: Record<string, string> = {
  aluguel: '🏠', trabalho: '💼', servico: '🔧',
  compra_venda: '🤝', consumidor: '🛒', digital: '💻',
  condominio: '🏢', geral: '⚖️',
};

// ─── Badge labels ──────────────────────────────────────────────────────────────
const BADGE_LABEL: Record<string, string> = {
  dica:         'DICA JURÍDICA',
  mito_verdade: 'MITO ou VERDADE?',
  checklist:    'CHECKLIST',
  estatistica:  'VOCÊ SABIA?',
  pergunta:     'PARA REFLETIR',
  caso_real:    'CASO REAL',
  antes_depois: 'ANTES / DEPOIS',
};

// ─── Logo ──────────────────────────────────────────────────────────────────────
function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: Math.round(size * 0.29),
      background: 'linear-gradient(135deg, #b39dff, #5b2fc9)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="none"
        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    </div>
  );
}

function LogoFull({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'lg' ? { mark: 44, text: 26 } : size === 'sm' ? { mark: 28, text: 17 } : { mark: 36, text: 22 };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={sz.mark} />
      <div style={{
        fontFamily: 'Poppins', fontWeight: 600, fontSize: sz.text,
        color: TEXT, letterSpacing: '-0.5px',
        display: 'flex',
      }}>
        <span style={{ fontWeight: 700 }}>Contrato</span>
        <span style={{ color: TEXT_DIM, fontWeight: 400 }}>Seguro</span>
      </div>
    </div>
  );
}

// ─── Progress dots ─────────────────────────────────────────────────────────────
function Dots({ current, total, accent }: { current: number; total: number; accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === current ? 22 : 7,
          height: 7, borderRadius: 4,
          background: i === current ? accent : `${accent}33`,
          transition: 'width 0.2s',
        }} />
      ))}
    </div>
  );
}

// ─── Category chip ─────────────────────────────────────────────────────────────
function CatChip({ category, accent }: { category: string; accent: string }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      background: `${accent}1a`,
      border: `1px solid ${accent}44`,
      borderRadius: 100, padding: '8px 18px',
    }}>
      <span style={{ fontSize: 16 }}>{CAT_EMOJI[category] ?? '⚖️'}</span>
      <span style={{
        fontFamily: 'Poppins', fontWeight: 600, fontSize: 15,
        color: accent, letterSpacing: '0.5px', textTransform: 'uppercase',
      }}>
        {CAT_LABEL[category] ?? 'Direito'}
      </span>
    </div>
  );
}

// ─── Glow overlay (simulated radial) ──────────────────────────────────────────
function GlowOverlay({ accent }: { accent: string }) {
  return (
    <div style={{
      position: 'absolute', top: -300, left: '50%',
      width: 900, height: 900,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${accent}18 0%, transparent 70%)`,
      transform: 'translateX(-50%)',
      pointerEvents: 'none',
    }} />
  );
}

// ─── Decorative rule line ──────────────────────────────────────────────────────
function RuleLine({ accent }: { accent: string }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <div style={{ width: 36, height: 3, borderRadius: 2, background: accent }} />
      <div style={{ width: 14, height: 3, borderRadius: 2, background: `${accent}44` }} />
    </div>
  );
}

// ─── TEMPLATE: COVER ──────────────────────────────────────────────────────────
function CoverSlide({
  title, subtitle, badge, current, total, category, accent,
}: {
  title: string; subtitle: string; badge: string;
  current: number; total: number; category: string; accent: string;
}) {
  const badgeLabel = BADGE_LABEL[badge] ?? 'DICA JURÍDICA';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <GlowOverlay accent={accent} />

      {/* Top accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accent}, ${VIOLET})`,
      }} />

      {/* Grid pattern */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '72px 72px',
        opacity: 0.5,
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: `${accent}1a`, border: `1px solid ${accent}44`,
          borderRadius: 100, padding: '8px 18px',
        }}>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 14,
            color: accent, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            {badgeLabel}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 24,
        position: 'relative', zIndex: 1,
      }}>
        <RuleLine accent={accent} />

        {/* Big decorative number */}
        <div style={{
          position: 'absolute', right: 40, top: '50%',
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: 280, color: `${accent}0d`,
          lineHeight: 1, letterSpacing: '-8px',
          transform: 'translateY(-50%)',
          userSelect: 'none',
        }}>
          §
        </div>

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 22 ? 68 : title.length > 14 ? 80 : 96,
          color: TEXT, lineHeight: 1.0,
          letterSpacing: title.length > 14 ? '-2px' : '-3px',
          maxWidth: 820,
        }}>
          {title}
        </div>

        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 27,
          color: TEXT_MUT, lineHeight: 1.5, maxWidth: 760,
        }}>
          {subtitle}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 52px', position: 'relative', zIndex: 1,
      }}>
        <Dots current={current} total={total} accent={accent} />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontFamily: 'Poppins', fontSize: 16, color: TEXT_DIM,
        }}>
          <CatChip category={category} accent={accent} />
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE: ITEM ───────────────────────────────────────────────────────────
function ItemSlide({
  number, title, description, law, current, total, accent,
}: {
  number: string; title: string; description: string;
  law: string; current: number; total: number; accent: string;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <GlowOverlay accent={VIOLET} />

      {/* Top strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accent}, ${VIOLET})`,
      }} />

      {/* Big number watermark */}
      <div style={{
        position: 'absolute', right: -20, bottom: 60,
        fontFamily: 'Poppins', fontWeight: 800,
        fontSize: 320, color: `${accent}0c`,
        lineHeight: 1, letterSpacing: '-10px',
        userSelect: 'none',
      }}>
        {number}
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '44px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull size="sm" />
        <div style={{
          fontFamily: 'Poppins', fontWeight: 700, fontSize: 15,
          color: TEXT_DIM, letterSpacing: '2px', textTransform: 'uppercase',
        }}>
          {String(parseInt(number)).padStart(2, '0')} / {String(total - 2).padStart(2, '0')}
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 28,
        position: 'relative', zIndex: 1,
      }}>
        {/* Step number */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: `${accent}1a`, border: `1px solid ${accent}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 800, fontSize: 26,
              color: accent,
            }}>
              {number}
            </span>
          </div>
          <div style={{ width: 1, height: 40, background: BORDER }} />
          <RuleLine accent={accent} />
        </div>

        {/* Title */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 30 ? 52 : 64,
          color: TEXT, lineHeight: 1.08,
          letterSpacing: '-1.5px', maxWidth: 860,
        }}>
          {title}
        </div>

        {/* Description */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 26,
          color: TEXT_MUT, lineHeight: 1.5, maxWidth: 820,
        }}>
          {description}
        </div>

        {/* Law badge */}
        {law && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: `${accent}12`, border: `1px solid ${accent}33`,
            borderRadius: 10, padding: '10px 18px', alignSelf: 'flex-start',
          }}>
            <span style={{ fontSize: 16 }}>⚖️</span>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: 17,
              color: accent, letterSpacing: '0.3px',
            }}>
              {law}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 44px', position: 'relative', zIndex: 1,
        borderTop: `1px solid ${BORDER}`,
      }}>
        <Dots current={current} total={total} accent={accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: 16, color: TEXT_DIM }}>
          Deslize →
        </span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: CTA ────────────────────────────────────────────────────────────
function CtaSlide({ category, accent }: { category: string; accent: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', gap: 0,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Glows */}
      <div style={{
        position: 'absolute', top: -200, left: '50%',
        width: 1000, height: 800,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${VIOLET}22 0%, transparent 65%)`,
        transform: 'translateX(-50%)',
      }} />
      <div style={{
        position: 'absolute', bottom: -100, right: -100,
        width: 600, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, ${accent}15 0%, transparent 65%)`,
      }} />

      {/* Top accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accent}, ${VIOLET})`,
      }} />

      {/* Content card */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 36, padding: '64px 80px',
        background: BG_CARD,
        border: `1px solid rgba(139,92,246,0.25)`,
        borderRadius: 28,
        width: 860,
        position: 'relative', zIndex: 1,
        boxShadow: `0 0 0 1px rgba(139,92,246,0.12), 0 32px 80px rgba(0,0,0,0.5)`,
      }}>
        <LogoFull size="lg" />

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: 52, color: TEXT,
          textAlign: 'center', lineHeight: 1.1,
          letterSpacing: '-1.5px',
        }}>
          Analise seu contrato<br />
          <span style={{ color: VIO_BRT }}>gratuitamente com IA</span>
        </div>

        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 22,
          color: TEXT_MUT, textAlign: 'center', lineHeight: 1.5, maxWidth: 620,
        }}>
          CC · CDC · CLT · Lei do Inquilinato · LGPD
        </div>

        {/* CTA button */}
        <div style={{
          background: 'linear-gradient(180deg, #b39dff, #8b5cf6)',
          borderRadius: 14, padding: '18px 48px',
          fontFamily: 'Poppins', fontWeight: 700, fontSize: 24,
          color: '#fff', letterSpacing: '-0.3px',
          boxShadow: '0 12px 40px rgba(139,92,246,0.4)',
        }}>
          {APP_DISPLAY} →
        </div>

        {/* Trust chips */}
        <div style={{ display: 'flex', gap: 28 }}>
          {[
            { dot: SUCCESS, text: 'Grátis' },
            { dot: SUCCESS, text: 'Sem cadastro' },
            { dot: SUCCESS, text: '2 minutos' },
          ].map(({ dot, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Poppins', fontSize: 17, color: TEXT_DIM,
            }}>
              <div style={{
                width: 8, height: 8, borderRadius: '50%',
                background: dot, flexShrink: 0,
              }} />
              {text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TEMPLATE: CASO REAL (cover especial) ─────────────────────────────────────
function CasoRealSlide({
  title, subtitle, current, total, category, accent,
}: {
  title: string; subtitle: string; current: number; total: number;
  category: string; accent: string;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Alert glow */}
      <div style={{
        position: 'absolute', top: -100, left: '50%',
        width: 800, height: 600,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(251,113,133,0.14) 0%, transparent 65%)`,
        transform: 'translateX(-50%)',
      }} />

      {/* Red alert strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
        background: 'linear-gradient(90deg, #dc2626, #fb7185, #dc2626)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '56px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(220,38,38,0.18)', border: '1px solid rgba(251,113,133,0.4)',
          borderRadius: 100, padding: '8px 20px',
        }}>
          <span style={{ fontSize: 16 }}>🚨</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 15,
            color: DANGER, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            CASO REAL
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 24,
        position: 'relative', zIndex: 1,
      }}>
        {/* Quote mark */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: 160, color: `${DANGER}1a`,
          lineHeight: 0.6, marginBottom: -20,
        }}>
          {'"'}
        </div>

        <RuleLine accent={DANGER} />

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 22 ? 66 : 80,
          color: TEXT, lineHeight: 1.05,
          letterSpacing: '-2px', maxWidth: 820,
        }}>
          {title}
        </div>

        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 26,
          color: TEXT_MUT, lineHeight: 1.5, maxWidth: 780,
        }}>
          {subtitle}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 52px', position: 'relative', zIndex: 1,
      }}>
        <Dots current={current} total={total} accent={DANGER} />
        <CatChip category={category} accent={accent} />
      </div>
    </div>
  );
}

// ─── TEMPLATE: MITO ou VERDADE ────────────────────────────────────────────────
function MitoVerdadeSlide({
  title, subtitle, current, total, category, accent,
}: {
  title: string; subtitle: string; current: number; total: number;
  category: string; accent: string;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <GlowOverlay accent={accent} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accent}, ${VIOLET})`,
      }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: `${accent}1a`, border: `1px solid ${accent}44`,
          borderRadius: 100, padding: '8px 18px',
        }}>
          <span style={{ fontSize: 16 }}>🔍</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 14,
            color: accent, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            MITO ou VERDADE?
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 32,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{
            padding: '10px 22px', borderRadius: 10,
            background: 'rgba(239,68,68,0.18)', border: '1px solid rgba(239,68,68,0.35)',
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 19, color: '#fca5a5',
          }}>
            ❌ MITO
          </div>
          <div style={{
            padding: '10px 22px', borderRadius: 10,
            background: `${accent}1a`, border: `1px solid ${accent}44`,
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 19, color: accent,
          }}>
            ✅ VERDADE?
          </div>
        </div>

        <RuleLine accent={accent} />

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 24 ? 60 : 74,
          color: TEXT, lineHeight: 1.05,
          letterSpacing: '-1.5px', maxWidth: 840,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 26,
          color: TEXT_MUT, lineHeight: 1.5, maxWidth: 760,
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 52px', position: 'relative', zIndex: 1,
      }}>
        <Dots current={current} total={total} accent={accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: 16, color: TEXT_DIM }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: ESTATÍSTICA ────────────────────────────────────────────────────
function EstatisticaSlide({
  title, subtitle, current, total, category, accent,
}: {
  title: string; subtitle: string; current: number; total: number;
  category: string; accent: string;
}) {
  const numMatch = title.match(/^(\d[\d,.%]+)/);
  const numPart = numMatch ? numMatch[1] : '';
  const textPart = numPart ? title.slice(numPart.length).trim() : title;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <GlowOverlay accent={accent} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accent}, ${VIOLET})`,
      }} />

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: `${accent}1a`, border: `1px solid ${accent}44`,
          borderRadius: 100, padding: '8px 18px',
        }}>
          <span style={{ fontSize: 16 }}>📊</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 14,
            color: accent, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            VOCÊ SABIA?
          </span>
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 18,
        position: 'relative', zIndex: 1,
      }}>
        <RuleLine accent={accent} />
        {numPart ? (
          <>
            <div style={{
              fontFamily: 'Poppins', fontWeight: 800,
              fontSize: 128, color: accent,
              lineHeight: 0.9, letterSpacing: '-4px',
            }}>
              {numPart}
            </div>
            <div style={{
              fontFamily: 'Poppins', fontWeight: 700,
              fontSize: 52, color: TEXT,
              lineHeight: 1.1, letterSpacing: '-1px', maxWidth: 800,
            }}>
              {textPart}
            </div>
          </>
        ) : (
          <div style={{
            fontFamily: 'Poppins', fontWeight: 800,
            fontSize: 76, color: TEXT,
            lineHeight: 1.05, letterSpacing: '-2px',
          }}>
            {title}
          </div>
        )}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 26,
          color: TEXT_MUT, lineHeight: 1.5, maxWidth: 760,
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 52px', position: 'relative', zIndex: 1,
      }}>
        <Dots current={current} total={total} accent={accent} />
        <CatChip category={category} accent={accent} />
      </div>
    </div>
  );
}

// ─── TEMPLATE: ANTES/DEPOIS — cover ──────────────────────────────────────────
function AntesDepoisCoverSlide({
  title, subtitle, current, total, category, accent,
}: {
  title: string; subtitle: string; current: number; total: number;
  category: string; accent: string;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Dual glow: red left + green right */}
      <div style={{
        position: 'absolute', top: 100, left: -200,
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(251,113,133,0.12) 0%, transparent 70%)',
      }} />
      <div style={{
        position: 'absolute', top: 100, right: -200,
        width: 700, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)',
      }} />

      {/* Split accent strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5, display: 'flex',
      }}>
        <div style={{ flex: 1, background: DANGER }} />
        <div style={{ flex: 1, background: SUCCESS }} />
      </div>

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '52px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(179,157,255,0.35)',
          borderRadius: 100, padding: '8px 20px',
        }}>
          <span style={{ fontSize: 16 }}>⚖️</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 14,
            color: VIO_BRT, letterSpacing: '1px', textTransform: 'uppercase',
          }}>
            ANTES / DEPOIS
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 28,
        position: 'relative', zIndex: 1,
      }}>
        {/* Before / After pills */}
        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{
            padding: '10px 24px', borderRadius: 10,
            background: 'rgba(251,113,133,0.18)', border: '1px solid rgba(251,113,133,0.4)',
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: DANGER,
          }}>❌ ANTES</div>
          <div style={{
            padding: '10px 24px', borderRadius: 10,
            background: 'rgba(52,211,153,0.18)', border: '1px solid rgba(52,211,153,0.4)',
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: SUCCESS,
          }}>✅ DEPOIS</div>
        </div>

        <RuleLine accent={VIOLET} />

        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 20 ? 68 : 84,
          color: TEXT, lineHeight: 1.0, letterSpacing: '-2px', maxWidth: 820,
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: 27,
          color: TEXT_MUT, lineHeight: 1.5, maxWidth: 760,
        }}>
          {subtitle}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 52px', position: 'relative', zIndex: 1,
      }}>
        <Dots current={current} total={total} accent={VIOLET} />
        <CatChip category={category} accent={accent} />
      </div>
    </div>
  );
}

// ─── TEMPLATE: BEFORE (cláusula abusiva) ──────────────────────────────────────
function BeforeSlide({
  title, description, law, current, total,
}: {
  title: string; description: string; law: string; current: number; total: number;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#0d0608',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Red glow */}
      <div style={{
        position: 'absolute', top: -150, left: '50%',
        width: 900, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 65%)',
        transform: 'translateX(-50%)',
      }} />

      {/* Red alert strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
        background: 'linear-gradient(90deg, #7f1d1d, #dc2626, #ef4444, #dc2626, #7f1d1d)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '44px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull size="sm" />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(239,68,68,0.45)',
          borderRadius: 100, padding: '8px 20px',
        }}>
          <span style={{ fontSize: 16 }}>❌</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: 16,
            color: '#fca5a5', letterSpacing: '1.5px',
          }}>
            COMO ESTÁ
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 28,
        position: 'relative', zIndex: 1,
      }}>
        {/* Quote decoration */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: 180, color: 'rgba(220,38,38,0.15)',
          lineHeight: 0.6, marginBottom: -16, userSelect: 'none',
        }}>
          {'"'}
        </div>

        {/* Clause card */}
        <div style={{
          background: 'rgba(220,38,38,0.08)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderLeft: '4px solid #dc2626',
          borderRadius: '0 12px 12px 0',
          padding: '28px 32px',
        }}>
          <div style={{
            fontFamily: 'Poppins', fontWeight: 500,
            fontSize: description.length > 180 ? 20 : description.length > 120 ? 23 : 26,
            color: '#fecaca', lineHeight: 1.55,
            fontStyle: 'italic',
          }}>
            {description}
          </div>
        </div>

        {/* Law badge */}
        {law && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 18px', alignSelf: 'flex-start',
          }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: 17,
              color: '#f87171', letterSpacing: '0.3px',
            }}>
              {law}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 44px', position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(220,38,38,0.2)',
      }}>
        <Dots current={current} total={total} accent={DANGER} />
        <span style={{ fontFamily: 'Poppins', fontSize: 16, color: '#6b6181' }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: AFTER (cláusula corrigida) ─────────────────────────────────────
function AfterSlide({
  title, description, law, current, total,
}: {
  title: string; description: string; law: string; current: number; total: number;
}) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: '#060d0a',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Green glow */}
      <div style={{
        position: 'absolute', top: -150, left: '50%',
        width: 900, height: 700, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 65%)',
        transform: 'translateX(-50%)',
      }} />

      {/* Green strip */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 5,
        background: 'linear-gradient(90deg, #064e3b, #10b981, #34d399, #10b981, #064e3b)',
      }} />

      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '44px 60px 0', position: 'relative', zIndex: 1,
      }}>
        <LogoFull size="sm" />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'rgba(16,185,129,0.18)', border: '1px solid rgba(52,211,153,0.4)',
          borderRadius: 100, padding: '8px 20px',
        }}>
          <span style={{ fontSize: 16 }}>✅</span>
          <span style={{
            fontFamily: 'Poppins', fontWeight: 800, fontSize: 16,
            color: '#6ee7b7', letterSpacing: '1.5px',
          }}>
            COMO DEVERIA SER
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '0 60px', gap: 28,
        position: 'relative', zIndex: 1,
      }}>
        {/* Quote decoration */}
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: 180, color: 'rgba(16,185,129,0.12)',
          lineHeight: 0.6, marginBottom: -16, userSelect: 'none',
        }}>
          {'"'}
        </div>

        {/* Corrected clause card */}
        <div style={{
          background: 'rgba(16,185,129,0.07)',
          border: '1px solid rgba(52,211,153,0.3)',
          borderLeft: '4px solid #10b981',
          borderRadius: '0 12px 12px 0',
          padding: '28px 32px',
        }}>
          <div style={{
            fontFamily: 'Poppins', fontWeight: 500,
            fontSize: description.length > 180 ? 20 : description.length > 120 ? 23 : 26,
            color: '#a7f3d0', lineHeight: 1.55,
            fontStyle: 'italic',
          }}>
            {description}
          </div>
        </div>

        {/* Law badge */}
        {law && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            borderRadius: 10, padding: '10px 18px', alignSelf: 'flex-start',
          }}>
            <span style={{ fontSize: 16 }}>⚖️</span>
            <span style={{
              fontFamily: 'Poppins', fontWeight: 600, fontSize: 17,
              color: '#34d399', letterSpacing: '0.3px',
            }}>
              {law}
            </span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '0 60px 44px', position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(16,185,129,0.18)',
      }}>
        <Dots current={current} total={total} accent={SUCCESS} />
        <span style={{ fontFamily: 'Poppins', fontSize: 16, color: '#6b6181' }}>Deslize →</span>
      </div>
    </div>
  );
}

// ─── TEMPLATE: LEGADO (post único) ────────────────────────────────────────────
function LegacySlide({ headline, category }: { headline: string; category: string }) {
  const accent = CAT_ACCENT[category] ?? CAT_ACCENT.geral!;
  return (
    <div style={{
      width: '100%', height: '100%',
      background: BG,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: 48, padding: '64px 80px',
      position: 'relative', overflow: 'hidden',
    }}>
      <GlowOverlay accent={accent} />

      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(90deg, ${accent}, ${VIOLET})`,
      }} />

      <LogoFull size="lg" />

      <div style={{
        background: BG_CARD,
        border: `1px solid rgba(139,92,246,0.25)`,
        borderRadius: 24, padding: '48px 56px',
        width: '100%',
        boxShadow: `0 0 0 1px rgba(139,92,246,0.1), 0 32px 80px rgba(0,0,0,0.4)`,
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 22 }}>
          <CatChip category={category} accent={accent} />
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: headline.length > 40 ? 40 : 52,
          color: TEXT, textAlign: 'center',
          lineHeight: 1.15, letterSpacing: '-1px',
        }}>
          {headline}
        </div>
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        position: 'relative', zIndex: 1,
      }}>
        <span style={{
          fontFamily: 'Poppins', fontWeight: 600, fontSize: 22,
          color: VIO_BRT,
        }}>
          Analise seu contrato gratuitamente
        </span>
        <span style={{ fontFamily: 'Poppins', fontSize: 17, color: TEXT_DIM }}>
          {APP_DISPLAY}
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

  let fontRegular: ArrayBuffer;
  let fontBold: ArrayBuffer;
  let fontExtraBold: ArrayBuffer;
  let fontSemiBold: ArrayBuffer;

  try {
    const fontsDir = path.join(process.cwd(), 'public', 'fonts');
    fontRegular   = fs.readFileSync(path.join(fontsDir, 'Poppins-Regular.ttf')) as unknown as ArrayBuffer;
    fontBold      = fs.readFileSync(path.join(fontsDir, 'Poppins-Bold.ttf')) as unknown as ArrayBuffer;
    fontExtraBold = fs.readFileSync(path.join(fontsDir, 'Poppins-ExtraBold.ttf')) as unknown as ArrayBuffer;
    fontSemiBold  = fs.readFileSync(path.join(fontsDir, 'Poppins-SemiBold.ttf')) as unknown as ArrayBuffer;
  } catch (err) {
    console.error('[Social Image] Falha ao carregar fontes:', err);
    return NextResponse.json({ error: 'Falha ao carregar fontes' }, { status: 500 });
  }

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
  const description = p.get('description') || subtitle;
  const law         = p.get('law') || '';
  const current     = parseInt(p.get('current') || '0', 10);
  const total       = parseInt(p.get('total') || '7', 10);
  const headline    = p.get('headline') || 'Proteja seus direitos';

  const accent = CAT_ACCENT[category] ?? CAT_ACCENT.geral!;

  let jsx: React.ReactElement;

  if (type === 'cover') {
    if (badge === 'caso_real') {
      jsx = <CasoRealSlide title={title} subtitle={subtitle} current={current} total={total} category={category} accent={accent} />;
    } else if (badge === 'mito_verdade') {
      jsx = <MitoVerdadeSlide title={title} subtitle={subtitle} current={current} total={total} category={category} accent={accent} />;
    } else if (badge === 'estatistica') {
      jsx = <EstatisticaSlide title={title} subtitle={subtitle} current={current} total={total} category={category} accent={accent} />;
    } else if (badge === 'antes_depois') {
      jsx = <AntesDepoisCoverSlide title={title} subtitle={subtitle} current={current} total={total} category={category} accent={accent} />;
    } else {
      jsx = <CoverSlide title={title} subtitle={subtitle} badge={badge} current={current} total={total} category={category} accent={accent} />;
    }
  } else if (type === 'before') {
    jsx = <BeforeSlide title={title} description={description} law={law} current={current} total={total} />;
  } else if (type === 'after') {
    jsx = <AfterSlide title={title} description={description} law={law} current={current} total={total} />;
  } else if (type === 'item') {
    jsx = <ItemSlide number={number} title={title} description={description} law={law} current={current} total={total} accent={accent} />;
  } else if (type === 'cta') {
    jsx = <CtaSlide category={category} accent={accent} />;
  } else {
    jsx = <LegacySlide headline={headline} category={category} />;
  }

  return new ImageResponse(jsx, { width: 1080, height: 1080, fonts });
}
