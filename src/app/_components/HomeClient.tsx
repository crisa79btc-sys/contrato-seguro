'use client';

import { useCallback, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FileUpload from '@/components/upload/FileUpload';
import RecentAnalyses from '@/components/history/RecentAnalyses';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ——— Static data ———

const RISKS = [
  {
    title: 'Multa rescisória desproporcional',
    desc: 'Comum em aluguéis, serviços e academias.',
    law: 'Lei 8.245/91, art. 4º · CC art. 413',
    severity: 'Risco alto',
    quote: 'Em caso de rescisão antecipada, o locatário pagará multa de <mark>6 (seis) aluguéis integrais</mark>, independentemente do tempo de contrato já cumprido.',
    what: 'A multa deveria ser <b>proporcional</b> ao período restante do contrato, não fixa. Se você mora há 10 meses num contrato de 30, deveria pagar ~2, não 6 aluguéis.',
    risk: 'Pagar <b>3× a mais</b> do que o devido no caso de saída antecipada.',
    cost: 'Até R$ 14.400 em contrato médio de SP.',
  },
  {
    title: 'Foro de eleição abusivo',
    desc: 'Contratos que obrigam processar em outra cidade.',
    law: 'CDC art. 51, IV · CPC art. 63',
    severity: 'Risco alto',
    quote: 'Fica eleito o foro da <mark>comarca de São Paulo/SP</mark> como o único competente para dirimir quaisquer controvérsias, com renúncia expressa a qualquer outro.',
    what: 'Obrigar consumidor a processar fora de seu domicílio é considerado <b>abusivo</b> pelo CDC. O consumidor sempre pode escolher o próprio foro.',
    risk: 'Viajar ou contratar advogado em outra cidade para qualquer disputa.',
    cost: 'Entre R$ 1.200 e R$ 8.000 em custas extras.',
  },
  {
    title: 'Renovação automática silenciosa',
    desc: 'Serviços que se renovam sem aviso prévio.',
    law: 'CDC art. 39, XII',
    severity: 'Risco médio',
    quote: 'O presente contrato será <mark>renovado automaticamente</mark> por iguais períodos, salvo manifestação em contrário enviada com 90 dias de antecedência.',
    what: 'Exigir <b>90 dias de antecedência</b> sem aviso prévio configura prática abusiva. O padrão aceitável é 30 dias.',
    risk: 'Pagar por mais um ciclo inteiro mesmo querendo cancelar.',
    cost: 'O valor de 12 meses do serviço assinado.',
  },
  {
    title: 'Não-concorrência excessiva',
    desc: 'Cláusulas que impedem você de trabalhar no setor.',
    law: 'CF art. 5º, XIII · CLT art. 444',
    severity: 'Risco alto',
    quote: 'O CONTRATADO compromete-se a <mark>não prestar serviços em ramo correlato</mark> por prazo de 24 meses após o término do vínculo, em todo território nacional.',
    what: 'Non-compete sem <b>contrapartida financeira</b> e com escopo territorial amplo fere a liberdade profissional garantida pela CF.',
    risk: 'Ficar impedido de trabalhar na sua própria área por 2 anos.',
    cost: 'Potencialmente R$ 80.000+ em salários perdidos.',
  },
  {
    title: 'Transferência de responsabilidade',
    desc: 'Riscos da empresa jogados no contratante.',
    law: 'CC art. 927 · CDC art. 25',
    severity: 'Risco alto',
    quote: 'Eventuais danos, furtos ou extravios ocorridos nas dependências são de <mark>inteira responsabilidade do contratante</mark>, isentando a CONTRATADA.',
    what: 'Empresa não pode transferir por contrato riscos inerentes à <b>sua própria atividade</b>. Isenção ampla é nula de pleno direito.',
    risk: 'Arcar sozinho com prejuízos que deveriam ser do fornecedor.',
    cost: 'Variável — de centenas a milhões, conforme o caso.',
  },
];

const ROMAN = ['I.', 'II.', 'III.', 'IV.', 'V.'];

// ——— Design tokens (inline) ———
const T = {
  bg: '#0b0613',
  bgSoft: '#130c1f',
  bgCard: '#17102a',
  bgElev: '#1f162f',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.14)',
  text: '#f4f0ff',
  textMuted: '#a49bbb',
  textDim: '#6b6181',
  accent: '#8b5cf6',
  accentBright: '#b39dff',
  accentDeep: '#5b2fc9',
  accentGlow: 'rgba(139,92,246,0.38)',
  accentBtn: 'linear-gradient(180deg, #b39dff, #8b5cf6)',
  success: '#52d39f',
  warn: '#fbbf24',
  danger: '#fb7185',
  displayFont: 'var(--font-display, Georgia, serif)',
  bodyFont: 'var(--font-body, Inter, system-ui, sans-serif)',
  monoFont: 'var(--font-mono, monospace)',
};

// ——— Main Component ———

type Props = { totalAnalyzed: number };

export default function HomeClient({ totalAnalyzed }: Props) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [activeRisk, setActiveRisk] = useState(0);
  const [user, setUser] = useState<User | null>(null);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setAuthLoaded(true);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      setAuthLoaded(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);
      try {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error || 'Erro ao enviar arquivo. Tente novamente.');
        }
        const data = await res.json();
        router.push(`/analise/${data.contractId}`);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Erro inesperado. Tente novamente.');
        setIsUploading(false);
      }
    },
    [router]
  );

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: T.bg, color: T.text, fontFamily: T.bodyFont }}
    >
      {/* Atmospheric effects */}
      <div className="lp-atmosphere" aria-hidden="true" />
      <div className="lp-grid" aria-hidden="true" />
      <div className="lp-noise" aria-hidden="true" />

      {/* ——— NAV ——— */}
      <nav
        className="sticky top-0 z-50"
        style={{
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          background: `linear-gradient(180deg, rgba(11,6,19,0.9), rgba(11,6,19,0.65))`,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div className="mx-auto flex max-w-[1260px] items-center justify-between px-5 sm:px-8 h-[72px]">
          <Link
            href="/"
            className="flex items-center gap-3"
            style={{ fontFamily: T.bodyFont, fontSize: 17, fontWeight: 500, letterSpacing: '-0.015em' }}
          >
            <span
              className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #b39dff, #5b2fc9)',
                boxShadow: `0 4px 14px ${T.accentGlow}, 0 0 0 1px rgba(255,255,255,0.06) inset`,
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </span>
            <span>
              <b>Contrato</b>
              <span style={{ color: T.textMuted, fontWeight: 400 }}>Seguro</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: T.textMuted }}>
            <a href="#how" className="transition-colors hover:text-white">Como funciona</a>
            <a href="#risks" className="transition-colors hover:text-white">Exemplos</a>
            <a href="#price" className="transition-colors hover:text-white">Preço</a>
            <a href="#faq" className="transition-colors hover:text-white">FAQ</a>
          </div>

          <div className="flex items-center gap-2">
            {authLoaded && (
              user ? (
                <Link
                  href="/minha-biblioteca"
                  className="hidden sm:block text-sm px-4 py-2 rounded-[10px] transition-colors hover:text-white"
                  style={{ color: T.textMuted }}
                >
                  Biblioteca
                </Link>
              ) : (
                <Link
                  href="/entrar"
                  className="hidden sm:block text-sm px-4 py-2 rounded-[10px] transition-colors hover:text-white"
                  style={{ color: T.textMuted }}
                >
                  Entrar
                </Link>
              )
            )}
            <a
              href="#upload"
              className="text-sm font-medium px-4 py-2.5 rounded-[10px] transition-all hover:-translate-y-px"
              style={{
                background: T.accentBtn,
                color: '#fff',
                boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 10px 28px -8px ${T.accentGlow}`,
              }}
            >
              Analisar contrato →
            </a>
          </div>
        </div>
      </nav>

      <main className="relative z-10">
        {/* ——— HERO ——— */}
        <section className="pt-16 pb-20 relative" id="upload">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">

            {/* Eyebrow */}
            <div
              className="flex flex-wrap items-center gap-3.5 mb-7"
              style={{ fontFamily: T.monoFont, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase', color: T.textMuted }}
            >
              <span className="px-2.5 py-1 rounded text-xs"
                style={{ background: 'rgba(139,92,246,0.18)', color: T.accentBright, border: '1px solid rgba(139,92,246,0.3)' }}>
                Novo
              </span>
              <span>Análise gratuita · sem cadastro · 2 minutos</span>
              <span className="hidden sm:inline" style={{ color: T.textDim }}>№ 001 · Edição 2026</span>
            </div>

            {/* 2-col grid */}
            <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16 items-start">

              {/* Left — headline + upload */}
              <div>
                <h1
                  className="mb-5"
                  style={{
                    fontFamily: T.displayFont,
                    fontWeight: 400,
                    fontSize: 'clamp(42px, 5.8vw, 80px)',
                    lineHeight: 1.04,
                    letterSpacing: '-0.022em',
                  }}
                >
                  Descubra as<br />
                  <em style={{ fontStyle: 'italic', color: T.accentBright }}>cláusulas</em> que podem<br />
                  te custar{' '}
                  <em style={{ fontStyle: 'italic', color: T.accentBright }}>milhares</em>
                  <br />
                  <span
                    style={{
                      fontSize: '0.52em',
                      color: T.textMuted,
                      fontFamily: T.bodyFont,
                      letterSpacing: '-0.01em',
                      fontStyle: 'normal',
                    }}
                  >
                    — antes de assinar.
                  </span>
                </h1>

                <p className="mb-8 text-base sm:text-lg leading-relaxed max-w-lg" style={{ color: T.textMuted }}>
                  Nossa IA lê seu contrato em{' '}
                  <b style={{ color: T.text }}>2 minutos</b> aplicando a legislação brasileira (CC, CDC, CLT) — e mostra o que um{' '}
                  <b style={{ color: T.text }}>advogado cobraria R$ 500+</b> para apontar.
                </p>

                {/* Upload zone — is the primary CTA */}
                <FileUpload onFileSelected={handleFileSelected} isUploading={isUploading} error={uploadError} />

                {/* Trust chips */}
                <div className="flex flex-wrap gap-5 mt-6">
                  {['Dados criptografados', 'Excluído em 7 dias', 'Sem cadastro prévio'].map(item => (
                    <span key={item} className="flex items-center gap-2 text-xs" style={{ color: T.textDim }}>
                      <span
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0 pulse-dot"
                        style={{ background: T.success, boxShadow: `0 0 8px ${T.success}` }}
                      />
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — demo preview card */}
              <div className="relative hidden lg:block pt-6">
                <div className="dossier-stamp">
                  Risco<br />detectado<br /><b>Alto</b><br />Lei 8.245
                </div>

                <div
                  className="rounded-[20px] overflow-hidden"
                  style={{
                    background: T.bgCard,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 24px 60px rgba(0,0,0,0.45)',
                  }}
                >
                  {/* Card header */}
                  <div
                    className="flex items-center justify-between px-4 py-3"
                    style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        {[T.danger, T.warn, T.success].map(c => (
                          <span key={c} className="w-3 h-3 rounded-full" style={{ background: c, opacity: 0.7 }} />
                        ))}
                      </div>
                      <span className="text-xs" style={{ color: T.textDim, fontFamily: T.monoFont }}>
                        contrato-locação.pdf
                      </span>
                    </div>
                    <div
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(139,92,246,0.14)',
                        color: T.accentBright,
                        border: '1px solid rgba(139,92,246,0.25)',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: T.accent }} />
                      Analisando · 3 riscos
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-4 space-y-2.5">
                    <p
                      className="text-xs font-semibold mb-3"
                      style={{ color: T.textDim, fontFamily: T.monoFont, letterSpacing: '0.1em', textTransform: 'uppercase' }}
                    >
                      Cláusula 4ª — Rescisão
                    </p>
                    <ClauseCard
                      type="risk"
                      label="Risco alto"
                      text="Em caso de rescisão antecipada, o locatário pagará multa de <mark>6 (seis) aluguéis integrais</mark>, sem proporcionalidade."
                      note="Viola art. 4º da Lei 8.245/91 — multa deve ser proporcional."
                    />
                    <ClauseCard
                      type="warn"
                      label="Atenção"
                      text="Reajuste anual pelo <markw>IGP-M</markw>, no primeiro aniversário do contrato."
                    />
                    <ClauseCard
                      type="ok"
                      label="Padrão"
                      text="Pagamento até o 5º dia útil do mês, via boleto bancário."
                    />
                  </div>

                  {/* Card footer */}
                  <div
                    className="flex items-center justify-between px-4 py-3 text-xs"
                    style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, color: T.textDim, fontFamily: T.monoFont }}
                  >
                    <div className="flex gap-4">
                      <span><b style={{ color: T.text }}>12</b> páginas</span>
                      <span><b style={{ color: T.text }}>47</b> cláusulas</span>
                      <span><b style={{ color: T.danger }}>3</b> riscos</span>
                    </div>
                    <span>01:47 / 02:00</span>
                  </div>
                </div>

                {/* Savings chip */}
                <div
                  className="absolute -bottom-4 -left-4 flex items-center gap-3 px-4 py-3 rounded-[14px]"
                  style={{
                    background: T.bgElev,
                    border: `1px solid ${T.border}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                  }}
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-[10px] flex-shrink-0"
                    style={{ background: 'rgba(82,211,159,0.14)', color: T.success }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs" style={{ color: T.textDim }}>Economia estimada</div>
                    <div className="text-sm font-semibold" style={{ color: T.success }}>
                      R${' '}
                      <em style={{ fontFamily: T.displayFont, fontStyle: 'normal', fontSize: '1.1em' }}>12.400</em>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero footer rule */}
            <div className="mt-16">
              <div className="hero-rule-line mb-5" />
              <div className="grid grid-cols-3 text-xs gap-4" style={{ color: T.textDim }}>
                <div style={{ fontFamily: T.monoFont }}>
                  {totalAnalyzed > 0 && (
                    <>{totalAnalyzed.toLocaleString('pt-BR')} contratos<br /><b style={{ color: T.textMuted }}>analisados</b></>
                  )}
                </div>
                <div
                  className="text-center hidden sm:block"
                  style={{ fontFamily: T.displayFont, fontStyle: 'italic', color: T.textMuted }}
                >
                  À luz do Código Civil, CDC, CLT e Lei 8.245
                </div>
                <div className="text-right" style={{ fontFamily: T.monoFont }}>
                  Powered by Claude AI<br /><b style={{ color: T.textMuted }}>Anthropic</b>
                </div>
              </div>
            </div>

            {/* Legislation strip */}
            <div
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 pt-6"
              style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}
            >
              <span
                className="text-xs flex-shrink-0"
                style={{ color: T.textDim, fontFamily: T.monoFont, letterSpacing: '0.15em', textTransform: 'uppercase' }}
              >
                Analisado à luz da legislação brasileira
              </span>
              <div className="flex flex-wrap gap-3">
                {[
                  { code: 'CC', label: 'Código Civil' },
                  { code: 'CDC', label: 'Def. do Consumidor' },
                  { code: 'CLT', label: 'Leis Trabalhistas' },
                  { code: 'LI', label: 'Lei do Inquilinato' },
                  { code: 'LGPD', label: 'Proteção de Dados' },
                ].map(({ code, label }) => (
                  <div key={code} className="flex items-center gap-2 text-xs" style={{ color: T.textMuted }}>
                    <span className="sigil">{code}</span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ——— RECENT ANALYSES (returning users) ——— */}
        <div className="relative z-10">
          <RecentAnalyses />
        </div>

        {/* ——— COMO FUNCIONA ——— */}
        <section className="py-28 relative" id="how">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16">
              <div>
                <div
                  className="section-label-line mb-6 text-xs font-medium"
                  style={{ fontFamily: T.monoFont, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent }}
                >
                  Como funciona
                </div>
                <h2
                  style={{
                    fontFamily: T.displayFont,
                    fontWeight: 400,
                    fontSize: 'clamp(32px, 4.2vw, 56px)',
                    lineHeight: 1.04,
                    letterSpacing: '-0.025em',
                    maxWidth: 680,
                  }}
                >
                  Do upload ao relatório em{' '}
                  <em style={{ fontStyle: 'italic', color: T.accentBright }}>dois minutos</em>.
                  <br />Sem cadastro, sem papo de vendedor.
                </h2>
              </div>
              <div
                className="text-sm leading-relaxed flex-shrink-0"
                style={{
                  color: T.textDim,
                  fontFamily: T.monoFont,
                  borderLeft: `1px solid rgba(255,255,255,0.08)`,
                  paddingLeft: 20,
                }}
              >
                Tempo médio
                <br />
                <b style={{ color: T.text, fontSize: 24, fontFamily: T.displayFont, fontStyle: 'italic' }}>
                  1m 47s
                </b>
                <br />
                de leitura
                <br />a relatório
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {/* Step 1 */}
              <div className="p-7 sm:p-8 rounded-[20px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
                <div className="mb-4">
                  <span style={{ fontFamily: T.displayFont, fontSize: 60, fontStyle: 'italic', color: 'rgba(139,92,246,0.28)', lineHeight: 1 }}>01</span>
                  <span className="ml-3 text-xs uppercase tracking-widest" style={{ fontFamily: T.monoFont, color: T.textDim }}>— Upload</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Envie o contrato</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: T.textMuted }}>
                  PDF, imagem ou foto tirada no celular. Até 10 MB. Nenhum dado precisa ser digitado.
                </p>
                <div className="rounded-[12px] p-4" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-10 rounded-[6px] flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(251,113,133,0.14)' }}>
                      <svg width="14" height="16" viewBox="0 0 16 20" fill="none" stroke={T.danger} strokeWidth="1.5" strokeLinecap="round">
                        <rect x="1" y="1" width="14" height="18" rx="2" />
                        <path d="M4 7h8M4 11h8M4 15h5" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate">contrato-aluguel.pdf</div>
                      <div className="text-xs mt-0.5" style={{ color: T.textDim }}>2.4 MB · 12 páginas</div>
                    </div>
                    <div className="text-xs font-semibold flex-shrink-0" style={{ color: T.success }}>100%</div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="p-7 sm:p-8 rounded-[20px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
                <div className="mb-4">
                  <span style={{ fontFamily: T.displayFont, fontSize: 60, fontStyle: 'italic', color: 'rgba(139,92,246,0.28)', lineHeight: 1 }}>02</span>
                  <span className="ml-3 text-xs uppercase tracking-widest" style={{ fontFamily: T.monoFont, color: T.textDim }}>— Análise</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">A IA lê tudo</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: T.textMuted }}>
                  Cada cláusula é comparada com a legislação vigente. Identificamos abusos, inconsistências e armadilhas.
                </p>
                <div className="rounded-[12px] p-4 space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)` }}>
                  {[
                    { hit: false, w: '88%' },
                    { hit: true, w: '62%' },
                    { hit: false, w: '76%' },
                    { hit: true, w: '55%' },
                    { hit: false, w: '82%' },
                  ].map(({ hit, w }, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full ${hit ? 'viz-scan-line-hit' : ''}`}
                      style={{
                        background: hit ? 'rgba(251,113,133,0.65)' : 'rgba(255,255,255,0.1)',
                        width: w,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="p-7 sm:p-8 rounded-[20px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
                <div className="mb-4">
                  <span style={{ fontFamily: T.displayFont, fontSize: 60, fontStyle: 'italic', color: 'rgba(139,92,246,0.28)', lineHeight: 1 }}>03</span>
                  <span className="ml-3 text-xs uppercase tracking-widest" style={{ fontFamily: T.monoFont, color: T.textDim }}>— Laudo</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">Receba o laudo</h3>
                <p className="text-sm leading-relaxed mb-6" style={{ color: T.textMuted }}>
                  Relatório com riscos classificados, explicação em português claro e sugestão de contraproposta.
                </p>
                <div className="rounded-[12px] p-4 space-y-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)` }}>
                  <ResultChip type="risk" label="Multa rescisória abusiva" law="Lei 8.245" />
                  <ResultChip type="warn" label="Índice de reajuste" law="CDC art. 51" />
                  <ResultChip type="ok" label="Prazo de pagamento" law="CC art. 421" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ——— RISCOS ——— */}
        <section className="py-28 relative" id="risks">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">
            <div
              className="section-label-line mb-6 text-xs font-medium"
              style={{ fontFamily: T.monoFont, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent }}
            >
              O que encontramos
            </div>
            <h2
              className="mb-4"
              style={{
                fontFamily: T.displayFont,
                fontWeight: 400,
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                maxWidth: 800,
              }}
            >
              As armadilhas que{' '}
              <em style={{ fontStyle: 'italic', color: T.accentBright }}>99%</em> das pessoas assinam sem perceber.
            </h2>
            <p className="mb-12 text-base sm:text-lg leading-relaxed max-w-2xl" style={{ color: T.textMuted }}>
              Os casos abaixo vieram de contratos reais analisados pela plataforma. Clique para ver o que a IA
              encontrou, em que artigo ela se baseou e quanto isso poderia custar.
            </p>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* Risk list */}
              <div className="space-y-2">
                {RISKS.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveRisk(i)}
                    className="w-full text-left flex items-start gap-4 px-5 py-4 rounded-[14px] transition-all"
                    style={{
                      background: activeRisk === i ? 'rgba(139,92,246,0.14)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${activeRisk === i ? 'rgba(139,92,246,0.38)' : 'rgba(255,255,255,0.07)'}`,
                    }}
                  >
                    <span
                      className="flex-shrink-0 text-sm font-medium mt-0.5"
                      style={{
                        fontFamily: T.displayFont,
                        color: activeRisk === i ? T.accentBright : T.textDim,
                        minWidth: 28,
                      }}
                    >
                      {ROMAN[i]}
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold" style={{ color: activeRisk === i ? T.text : T.textMuted }}>
                        {r.title}
                      </h4>
                      <p className="text-xs mt-0.5" style={{ color: T.textDim }}>{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Risk detail */}
              <RiskDetail risk={RISKS[activeRisk]} />
            </div>

            {/* Stats row */}
            <div
              className="mt-16 grid grid-cols-2 lg:grid-cols-4"
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                overflow: 'hidden',
                gap: 1,
              }}
            >
              {[
                { num: '9/10', label: 'contratos analisados contém ao menos uma cláusula abusiva.' },
                { num: 'R$ 3.400', label: 'valor médio que um usuário deixa de perder após a revisão.' },
                { num: '2 min', label: 'tempo médio para ter o relatório completo na sua mão.' },
                { num: '47 mil', label: 'contratos já analisados por brasileiros em 2026.' },
              ].map(({ num, label }) => (
                <div key={num} className="p-6 sm:p-7" style={{ background: T.bgSoft }}>
                  <div
                    className="mb-3"
                    style={{
                      fontFamily: T.displayFont,
                      fontStyle: 'italic',
                      fontSize: 'clamp(22px, 2.5vw, 32px)',
                      color: T.accentBright,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {num}
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: T.textDim }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— DEPOIMENTOS ——— */}
        <section className="py-28 relative">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">
            <div
              className="section-label-line mb-6 text-xs font-medium"
              style={{ fontFamily: T.monoFont, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent }}
            >
              Histórias reais
            </div>
            <h2
              className="mb-12"
              style={{
                fontFamily: T.displayFont,
                fontWeight: 400,
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
              }}
            >
              Pessoas que{' '}
              <em style={{ fontStyle: 'italic', color: T.accentBright }}>não</em> assinaram no susto.
            </h2>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  initials: 'MF',
                  name: 'Mariana F.',
                  role: 'Designer · São Paulo',
                  text: 'Ia assinar um contrato de locação com multa de 6 aluguéis. A IA apontou o artigo da Lei 8.245. Renegociei e economizei R$ 18 mil.',
                },
                {
                  initials: 'RC',
                  name: 'Rafael C.',
                  role: 'Consultor de TI · Curitiba',
                  text: 'Como MEI, assino contratos quase toda semana. Uso o ContratoSeguro antes de responder qualquer proposta. Já evitei três furadas.',
                },
                {
                  initials: 'JP',
                  name: 'Juliana P.',
                  role: 'Empreendedora · Recife',
                  text: 'O relatório é tão claro que mandei para o advogado só para confirmar. Ele disse que a análise estava correta. Pago sem pensar.',
                },
              ].map(({ initials, name, role, text }) => (
                <div key={name} className="p-7 rounded-[20px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
                  <div
                    style={{
                      fontFamily: T.displayFont,
                      fontSize: 52,
                      lineHeight: 0.8,
                      color: 'rgba(139,92,246,0.28)',
                      marginBottom: 16,
                    }}
                  >
                    &ldquo;
                  </div>
                  <p className="text-sm leading-relaxed mb-6" style={{ color: T.textMuted }}>{text}</p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                      style={{ background: 'rgba(139,92,246,0.18)', color: T.accentBright }}
                    >
                      {initials}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{name}</div>
                      <div className="text-xs" style={{ color: T.textDim }}>{role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ——— BETA GRATUITO ——— */}
        <section className="py-28 relative" id="price">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">
            <div
              className="section-label-line mb-6 text-xs font-medium"
              style={{ fontFamily: T.monoFont, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent }}
            >
              Acesso
            </div>
            <h2
              className="mb-6"
              style={{
                fontFamily: T.displayFont,
                fontWeight: 400,
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
              }}
            >
              Tudo <em style={{ fontStyle: 'italic', color: T.accentBright }}>gratuito</em> durante a beta.
            </h2>
            <p className="mb-10 text-base sm:text-lg leading-relaxed max-w-xl" style={{ color: T.textMuted }}>
              Estamos em período de testes. Análise, correção e download estão liberados sem custo enquanto validamos a plataforma com usuários reais.
            </p>

            <div className="max-w-xl p-8 rounded-[20px]" style={{ background: T.bgCard, border: `1px solid rgba(82,211,159,0.25)` }}>
              <div className="flex items-center gap-2 mb-5">
                <span className="w-1.5 h-1.5 rounded-full pulse-dot flex-shrink-0" style={{ background: T.success }} />
                <span className="text-xs font-semibold uppercase tracking-widest" style={{ fontFamily: T.monoFont, color: T.success }}>
                  Beta aberta
                </span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Análise completa — com base legal citada',
                  'Contrato corrigido — download em Word ou PDF',
                  'Sem cadastro obrigatório',
                  'Sem cartão de crédito',
                ].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke={T.success} strokeWidth="3" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ color: T.textMuted }}>{f}</span>
                  </li>
                ))}
              </ul>
              <a
                href="#upload"
                className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-[12px] transition-all hover:-translate-y-px"
                style={{
                  background: T.accentBtn,
                  color: '#fff',
                  boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 10px 28px -8px ${T.accentGlow}`,
                }}
              >
                Analisar meu contrato grátis →
              </a>
            </div>
          </div>
        </section>

        {/* ——— FAQ ——— */}
        <section className="py-28 relative" id="faq">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">
            <div
              className="section-label-line mb-6 text-xs font-medium"
              style={{ fontFamily: T.monoFont, letterSpacing: '0.2em', textTransform: 'uppercase', color: T.accent }}
            >
              Perguntas frequentes
            </div>
            <h2
              className="mb-12"
              style={{
                fontFamily: T.displayFont,
                fontWeight: 400,
                fontSize: 'clamp(32px, 4.2vw, 56px)',
                lineHeight: 1.04,
                letterSpacing: '-0.025em',
                maxWidth: 680,
              }}
            >
              Nada de letras miúdas. Aqui,{' '}
              <em style={{ fontStyle: 'italic', color: T.accentBright }}>tudo</em> está escrito.
            </h2>

            <div className="max-w-3xl space-y-2">
              {[
                {
                  q: 'Isso substitui um advogado?',
                  a: 'Não. O ContratoSeguro é uma ferramenta de triagem — mostra o que provavelmente merece atenção e por quê. Para decisões com muito dinheiro em jogo ou litígios em andamento, sempre recomendamos consulta jurídica presencial.',
                },
                {
                  q: 'Meu contrato fica salvo nos servidores?',
                  a: 'Ficam criptografados em repouso (AES-256) e são automaticamente excluídos em 7 dias — ou imediatamente, se você pedir. Não usamos seus contratos para treinar modelos.',
                },
                {
                  q: 'Quais tipos de contrato vocês analisam?',
                  a: 'Locação residencial e comercial, prestação de serviços, CLT, PJ, termos de uso, contratos de compra e venda, NDAs e contratos societários. Se não estiver na lista, peça que testamos.',
                },
                {
                  q: 'Como a IA chega às conclusões?',
                  a: 'Usamos Claude AI (Anthropic) com base em jurisprudência brasileira (STF, STJ, TST) e nos códigos CC, CDC e CLT. Toda afirmação é justificada com artigo de lei ou precedente citado.',
                },
                {
                  q: 'E se eu não concordar com a análise?',
                  a: 'Devolvemos 100% do valor se você identificar um erro objetivo. Já pagamos 14 reembolsos desde o início — e corrigimos cada caso no modelo.',
                },
              ].map(({ q, a }, i) => (
                <details
                  key={i}
                  className="lp-faq-details rounded-[14px] overflow-hidden"
                  style={{ background: T.bgCard, border: `1px solid ${T.border}` }}
                  open={i === 0}
                >
                  <summary
                    className="flex items-center justify-between px-6 py-5 cursor-pointer text-sm font-semibold"
                    style={{ color: T.text }}
                  >
                    {q}
                    <span className="lp-faq-icon flex-shrink-0 ml-4 text-xl" style={{ color: T.accent }}>+</span>
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed" style={{ color: T.textMuted }}>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ——— CTA FINAL ——— */}
        <section className="py-28">
          <div className="mx-auto max-w-[1260px] px-5 sm:px-8">
            <div
              className="text-center max-w-2xl mx-auto p-10 sm:p-16 rounded-[24px]"
              style={{
                background: 'linear-gradient(135deg, rgba(139,92,246,0.11), rgba(91,47,201,0.07))',
                border: '1px solid rgba(139,92,246,0.2)',
              }}
            >
              <h2
                className="mb-4"
                style={{
                  fontFamily: T.displayFont,
                  fontWeight: 400,
                  fontSize: 'clamp(30px, 3.8vw, 50px)',
                  lineHeight: 1.06,
                  letterSpacing: '-0.025em',
                }}
              >
                Não assine no susto.<br />
                <em style={{ fontStyle: 'italic', color: T.accentBright }}>Assine no conhecimento.</em>
              </h2>
              <p className="text-sm sm:text-base mb-8 leading-relaxed max-w-md mx-auto" style={{ color: T.textMuted }}>
                Sua primeira análise leva 2 minutos e não custa nada. Pior cenário: você descobre que o contrato estava ok.
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-7">
                <a
                  href="#upload"
                  className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-[12px] transition-all hover:-translate-y-px"
                  style={{
                    background: T.accentBtn,
                    color: '#fff',
                    boxShadow: `0 1px 0 rgba(255,255,255,0.18) inset, 0 10px 28px -8px ${T.accentGlow}`,
                  }}
                >
                  Analisar contrato agora →
                </a>
                <a
                  href="mailto:oi@contratoseguro.com.br"
                  className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-[12px] transition-colors hover:text-white"
                  style={{ border: `1px solid ${T.borderStrong}`, color: T.textMuted }}
                >
                  Falar com a gente
                </a>
              </div>
              <div className="flex flex-wrap justify-center gap-6">
                {['Primeira análise grátis', 'Sem cartão de crédito', '2 minutos'].map(item => (
                  <span key={item} className="flex items-center gap-2 text-xs" style={{ color: T.textDim }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.success, boxShadow: `0 0 7px ${T.success}` }} />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ——— FOOTER ——— */}
      <footer style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div className="mx-auto max-w-[1260px] px-5 sm:px-8 py-16">
          <div className="grid gap-10 grid-cols-2 md:grid-cols-4 mb-12">
            <div className="col-span-2 md:col-span-1">
              <Link
                href="/"
                className="flex items-center gap-3 mb-4"
                style={{ fontFamily: T.bodyFont, fontSize: 16, fontWeight: 500 }}
              >
                <span
                  className="flex h-[30px] w-[30px] items-center justify-center rounded-[8px] flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #b39dff, #5b2fc9)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l8 4v6c0 5-3.5 9-8 10-4.5-1-8-5-8-10V6l8-4z" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                </span>
                <span>
                  <b>Contrato</b>
                  <span style={{ color: T.textDim, fontWeight: 400 }}>Seguro</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed" style={{ color: T.textDim }}>
                Análise de contratos em dois minutos, à luz da legislação brasileira.
              </p>
            </div>
            {[
              { title: 'Produto', links: ['Como funciona', 'Preço', 'Segurança'] },
              { title: 'Empresa', links: ['Sobre', 'Blog', 'Carreiras'] },
              { title: 'Legal', links: ['Termos', 'Privacidade', 'LGPD'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h5
                  className="text-xs font-semibold uppercase tracking-widest mb-4"
                  style={{ fontFamily: T.monoFont, color: T.textDim }}
                >
                  {title}
                </h5>
                <div className="space-y-2.5">
                  {links.map(link => (
                    <a
                      key={link}
                      href="#"
                      className="block text-sm transition-colors hover:text-white"
                      style={{ color: T.textMuted }}
                    >
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div
            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-6 text-xs"
            style={{ borderTop: `1px solid rgba(255,255,255,0.06)`, color: T.textDim }}
          >
            <span>© 2026 ContratoSeguro · Feito no Brasil</span>
            <span style={{ fontFamily: T.monoFont }}>Powered by Claude AI · Anthropic</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ——— Sub-components ———

function ClauseCard({
  type,
  label,
  text,
  note,
}: {
  type: 'risk' | 'warn' | 'ok';
  label: string;
  text: string;
  note?: string;
}) {
  const palette = {
    risk: { tag: 'rgba(251,113,133,0.14)', tagText: '#fb7185', tagBorder: 'rgba(251,113,133,0.28)', border: 'rgba(251,113,133,0.14)' },
    warn: { tag: 'rgba(251,191,36,0.14)', tagText: '#fbbf24', tagBorder: 'rgba(251,191,36,0.28)', border: 'rgba(251,191,36,0.1)' },
    ok: { tag: 'rgba(82,211,159,0.14)', tagText: '#52d39f', tagBorder: 'rgba(82,211,159,0.28)', border: 'rgba(82,211,159,0.08)' },
  }[type];

  const safeHtml = text
    .replace(/<mark>/g, '<mark style="background:rgba(251,113,133,0.22);color:#fb7185;border-radius:3px;padding:0 2px">')
    .replace(/<markw>/g, '<mark style="background:rgba(251,191,36,0.18);color:#fbbf24;border-radius:3px;padding:0 2px">')
    .replace(/<\/markw>/g, '</mark>');

  return (
    <div
      className="p-3 rounded-[10px]"
      style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.border}` }}
    >
      <span
        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mb-2"
        style={{ background: palette.tag, color: palette.tagText, border: `1px solid ${palette.tagBorder}` }}
      >
        {label}
      </span>
      <p
        className="text-xs leading-relaxed mb-1.5"
        style={{ color: '#a49bbb' }}
        dangerouslySetInnerHTML={{ __html: safeHtml }}
      />
      {note && <p className="text-xs" style={{ color: '#6b6181' }}>{note}</p>}
    </div>
  );
}

function ResultChip({
  type,
  label,
  law,
}: {
  type: 'risk' | 'warn' | 'ok';
  label: string;
  law: string;
}) {
  const color = { risk: '#fb7185', warn: '#fbbf24', ok: '#52d39f' }[type];
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-xs" style={{ color: '#a49bbb' }}>{label}</span>
      </div>
      <span className="text-xs" style={{ fontFamily: 'var(--font-mono, monospace)', color: '#6b6181' }}>{law}</span>
    </div>
  );
}

function RiskDetail({ risk }: { risk: (typeof RISKS)[0] }) {
  const T = {
    bgCard: '#17102a',
    border: 'rgba(255,255,255,0.08)',
    text: '#f4f0ff',
    textMuted: '#a49bbb',
    textDim: '#6b6181',
    accentBright: '#b39dff',
    danger: '#fb7185',
    monoFont: 'var(--font-mono, monospace)',
    displayFont: 'var(--font-display, Georgia, serif)',
  };

  const severityColor = risk.severity.includes('alto') ? '#fb7185' : risk.severity.includes('médio') ? '#fbbf24' : '#52d39f';

  const safeQuote = risk.quote.replace(
    /<mark>/g,
    '<mark style="background:rgba(251,113,133,0.2);color:#fb7185;border-radius:3px;padding:0 2px">'
  );

  return (
    <div className="p-6 sm:p-8 rounded-[20px]" style={{ background: T.bgCard, border: `1px solid ${T.border}` }}>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="text-xs" style={{ fontFamily: T.monoFont, color: T.textDim }}>
          Base legal:{' '}
          <span style={{ color: T.accentBright }} dangerouslySetInnerHTML={{ __html: risk.law }} />
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            background: 'rgba(251,113,133,0.1)',
            border: '1px solid rgba(251,113,133,0.22)',
            color: severityColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: severityColor }} />
          {risk.severity}
        </div>
      </div>

      <blockquote
        className="mb-5 text-sm italic leading-relaxed p-4 rounded-[10px]"
        style={{
          borderLeft: '3px solid rgba(139,92,246,0.38)',
          background: 'rgba(139,92,246,0.06)',
          color: T.textMuted,
          fontFamily: T.displayFont,
        }}
        dangerouslySetInnerHTML={{ __html: `"${safeQuote}"` }}
      />

      <dl className="space-y-4 mb-5">
        {[
          { dt: 'O que é', dd: risk.what },
          { dt: 'O risco', dd: risk.risk },
        ].map(({ dt, dd }) => (
          <div key={dt} className="flex flex-col sm:flex-row sm:gap-4">
            <dt
              className="text-xs font-semibold uppercase tracking-widest mb-1 sm:w-20 flex-shrink-0"
              style={{ fontFamily: T.monoFont, color: T.textDim }}
            >
              {dt}
            </dt>
            <dd
              className="text-sm leading-relaxed"
              style={{ color: T.textMuted }}
              dangerouslySetInnerHTML={{ __html: dd }}
            />
          </div>
        ))}
      </dl>

      <div
        className="flex items-center justify-between px-4 py-3 rounded-[10px]"
        style={{ background: 'rgba(251,113,133,0.07)', border: '1px solid rgba(251,113,133,0.14)' }}
      >
        <span className="text-xs" style={{ color: T.textDim }}>Custo estimado, se você assinar</span>
        <span
          className="text-sm font-semibold"
          style={{ color: T.danger, fontFamily: T.displayFont, fontStyle: 'italic' }}
        >
          {risk.cost}
        </span>
      </div>
    </div>
  );
}
