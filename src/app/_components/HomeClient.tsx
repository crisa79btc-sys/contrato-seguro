'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import FileUpload from '@/components/upload/FileUpload';
import RecentAnalyses from '@/components/history/RecentAnalyses';

type Props = { totalAnalyzed: number };

export default function HomeClient({ totalAnalyzed }: Props) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileSelected = useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

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
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="hero-gradient relative overflow-hidden px-4 pb-20 pt-16 sm:pt-24">
          <div className="hero-glow pointer-events-none absolute inset-0" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Análise gratuita · Sem cadastro · 2 minutos
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
              Descubra as{' '}
              <span className="text-gradient">cláusulas que podem te custar milhares</span>{' '}
              — antes de assinar
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
              Nossa IA analisa seu contrato em 2 minutos usando a legislação brasileira real
              (CC, CDC, CLT) — e mostra o que um advogado cobraria R$ 500+ para apontar.
            </p>

            {totalAnalyzed > 0 && (
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                <span>
                  <strong className="text-slate-300">{totalAnalyzed.toLocaleString('pt-BR')}</strong>{' '}
                  {totalAnalyzed === 1 ? 'contrato analisado' : 'contratos analisados'} até agora
                </span>
              </div>
            )}

            <div className="mt-10">
              <FileUpload
                onFileSelected={handleFileSelected}
                isUploading={isUploading}
                error={uploadError}
              />
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                Dados criptografados
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Excluído em 7 dias
              </span>
              <span className="text-slate-700">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Correção por R$ 9,90
              </span>
            </div>
          </div>
        </section>

        {/* Histórico Recente */}
        <RecentAnalyses />

        {/* Trust Badges */}
        <section className="border-y border-slate-100 bg-white px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="grid gap-4 sm:grid-cols-3">
              <TrustBadge
                title="Powered by Claude AI"
                description="IA da Anthropic, líder mundial em segurança e confiabilidade"
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />}
              />
              <TrustBadge
                title="Legislação Brasileira"
                description="Análise baseada no CC, CDC, CLT e jurisprudência do STF e STJ"
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />}
              />
              <TrustBadge
                title="Conformidade LGPD"
                description="Seus dados nunca são usados para treinar IA nem compartilhados"
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />}
              />
            </div>
          </div>
        </section>

        {/* Como Funciona — com exemplos reais */}
        <section className="bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Como funciona</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                Do upload ao contrato corrigido em 3 passos
              </h2>
            </div>

            <div className="mt-12 space-y-12">
              <DemoStep
                number={1}
                title="Envie seu contrato"
                description="PDF, foto do celular ou digitalizado. Até 10MB. Sem cadastro."
                example={
                  <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">contrato-aluguel.pdf</p>
                        <p className="text-xs text-gray-500">1.2 MB · pronto para enviar</p>
                      </div>
                    </div>
                  </div>
                }
              />

              <DemoStep
                number={2}
                title="IA identifica os problemas"
                description="Cada cláusula é comparada com CC, CDC, CLT e jurisprudência. Você recebe score e lista priorizada por gravidade."
                example={
                  <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                    <div className="flex items-start gap-3">
                      <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">CRÍTICO</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Multa rescisória de 50% abusiva</p>
                        <p className="mt-1 text-xs text-gray-600">
                          Viola CC arts. 412-413 — multa não pode superar o valor da obrigação principal.
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />

              <DemoStep
                number={3}
                title="Receba o contrato corrigido"
                description="Word ou PDF pronto. Cláusulas problemáticas reescritas com base legal, cláusulas faltantes adicionadas. Pronto para o advogado revisar."
                example={
                  <div className="rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Antes</p>
                    <p className="mt-1 text-sm text-gray-700 line-through decoration-red-400">
                      &quot;Em caso de rescisão antecipada, multa de 50% sobre o valor total.&quot;
                    </p>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-600">Depois</p>
                    <p className="mt-1 text-sm text-gray-900">
                      &quot;Em caso de rescisão antecipada, multa proporcional ao período remanescente, limitada a 3 meses de aluguel (CC art. 413).&quot;
                    </p>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="border-y border-slate-100 bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-600">Depoimentos da beta</p>
              <h2 className="mt-2 text-2xl font-bold text-gray-900 sm:text-3xl">
                Quem já usou aprovou
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              <TestimonialCard
                quote="Ia assinar um contrato de prestação de serviço com multa abusiva. A análise pegou em 2 minutos — economizei uma consulta de R$ 400."
                author="Marcos R."
                role="Autônomo, São Paulo"
              />
              <TestimonialCard
                quote="Uso antes de qualquer contrato de aluguel para não cair em pegadinha. Simples, direto e em português que entendo."
                author="Juliana P."
                role="Inquilina, Belo Horizonte"
              />
              <TestimonialCard
                quote="A versão corrigida já veio pronta em Word. Meu advogado só ajustou um detalhe e aprovou. Ganhei tempo e dinheiro."
                author="Rodrigo S."
                role="Empresário, Curitiba"
              />
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
              Depoimentos coletados durante a beta fechada. Identidades preservadas.
            </p>
          </div>
        </section>

        {/* Tipos de Contrato */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Tipos de contrato suportados
            </h2>
            <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <ContractType label="Aluguel" emoji="🏠" />
              <ContractType label="Trabalho" emoji="💼" />
              <ContractType label="Prestação de Serviço" emoji="🔧" />
              <ContractType label="Compra e Venda" emoji="🤝" />
              <ContractType label="Financiamento" emoji="🏦" />
              <ContractType label="Termos Digitais" emoji="💻" />
            </div>
          </div>
        </section>

        {/* Por que usar */}
        <section className="border-t border-gray-100 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Por que usar o ContratoSeguro?
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2">
              <BenefitCard
                title="Fundamentação Legal Real"
                description="Nossa IA cita artigos específicos do Código Civil, CDC, CLT e legislação aplicável, não suposições genéricas."
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />}
              />
              <BenefitCard
                title="Análise em Minutos"
                description="Em vez de horas lendo cláusulas, receba um diagnóstico completo em menos de 2 minutos."
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />}
              />
              <BenefitCard
                title="Correção Pronta para Assinar"
                description="Além de identificar problemas, geramos uma versão corrigida do seu contrato em Word ou PDF."
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />}
              />
              <BenefitCard
                title="Privacidade Garantida"
                description="Seus documentos são criptografados e excluídos automaticamente em 7 dias. Zero acesso humano."
                icon={<path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />}
              />
            </div>
          </div>
        </section>

        {/* FAQ — foco em ROI e objeções de pagamento */}
        <section className="bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="mt-10 space-y-6">
              <FAQ
                question="Vale a pena pagar R$ 9,90 pela correção?"
                answer="Sim. Um advogado cobra de R$ 300 a R$ 1.000 para revisar um contrato. Uma única cláusula abusiva escondida pode custar milhares em processos ou multas indevidas. R$ 9,90 se paga na primeira cláusula corrigida."
              />
              <FAQ
                question="Como posso confiar que a análise é correta?"
                answer="A IA cita artigo específico da lei em cada problema apontado (CC, CDC, CLT, etc.) — você pode verificar cada citação. Também integra jurisprudência pacificada do STF, STJ e TST. Mesmo assim, para decisões críticas, sempre recomendamos revisão por um advogado."
              />
              <FAQ
                question="Meus dados ficam seguros?"
                answer="Sim. Documentos são criptografados (AES-256), excluídos automaticamente em 7 dias e nunca usados para treinar modelos. Somos conformes com a LGPD. Nenhum humano tem acesso ao seu contrato — apenas a IA, pelo tempo estritamente necessário para a análise."
              />
              <FAQ
                question="Substitui um advogado?"
                answer="Não — e nem queremos substituir. Somos uma ferramenta de apoio que faz em 2 minutos o que levaria horas de leitura. Para litígios, contratos de alto valor ou situações complexas, sempre consulte um advogado. O ContratoSeguro é perfeito para: triagem prévia, entender o que está assinando, ou ter uma segunda opinião rápida."
              />
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="relative overflow-hidden px-4 py-20">
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(ellipse 70% 80% at 50% 50%, rgba(124,58,237,0.08), transparent)',
            }}
          />
          <div className="relative mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Analise seu contrato agora
            </h2>
            <p className="mt-3 text-gray-500">
              É gratuito, rápido e pode evitar prejuízos de milhares de reais.
            </p>
            <div className="mt-8">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-all hover:shadow-xl hover:shadow-brand-600/40 active:scale-95"
              >
                Fazer upload do contrato
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function DemoStep({
  number,
  title,
  description,
  example,
}: {
  number: number;
  title: string;
  description: string;
  example: React.ReactNode;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:items-center">
      <div>
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {number}
          </span>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
      <div>{example}</div>
    </div>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
}: {
  quote: string;
  author: string;
  role: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-5 ring-1 ring-slate-200">
      <div className="flex gap-0.5 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-gray-700">&ldquo;{quote}&rdquo;</p>
      <div className="mt-4 border-t border-slate-200 pt-3">
        <p className="text-sm font-semibold text-gray-900">{author}</p>
        <p className="text-xs text-gray-500">{role}</p>
      </div>
    </div>
  );
}

function TrustBadge({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100">
        <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {icon}
        </svg>
      </div>
      <p className="mt-3 text-sm font-semibold text-gray-900">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function ContractType({ label, emoji }: { label: string; emoji: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <span className="text-2xl" role="img" aria-label={label}>{emoji}</span>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
  );
}

function BenefitCard({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100">
        <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {icon}
        </svg>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function FAQ({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-xl border border-gray-200 bg-white">
      <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
        {question}
        <svg className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </summary>
      <p className="px-4 pb-4 text-sm leading-relaxed text-gray-600">{answer}</p>
    </details>
  );
}
