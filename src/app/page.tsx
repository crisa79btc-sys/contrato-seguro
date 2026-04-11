'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import FileUpload from '@/components/upload/FileUpload';
import RecentAnalyses from '@/components/history/RecentAnalyses';

export default function Home() {
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
        {/* Hero Section — dark gradient */}
        <section className="hero-gradient relative overflow-hidden px-4 pb-20 pt-16 sm:pt-24">
          {/* Glow overlay */}
          <div className="hero-glow pointer-events-none absolute inset-0" />

          {/* Decorative grid */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(167,139,250,1) 1px, transparent 1px), linear-gradient(90deg, rgba(167,139,250,1) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          <div className="relative mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-300">
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
              Análise com Inteligência Artificial · 100% gratuito
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl sm:leading-[1.15]">
              Seu contrato tem{' '}
              <span className="text-gradient">cláusulas abusivas</span>?
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base text-slate-400 sm:text-lg">
              Descubra em minutos. Faça upload do seu contrato e receba uma análise gratuita
              fundamentada na legislação brasileira.
            </p>

            <div className="mt-10">
              <FileUpload
                onFileSelected={handleFileSelected}
                isUploading={isUploading}
                error={uploadError}
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-slate-500">
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
                Análise gratuita
              </span>
            </div>
          </div>
        </section>

        {/* Histórico Recente */}
        <RecentAnalyses />

        {/* Social Proof / Trust badges */}
        <section className="border-y border-slate-100 bg-white px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <div className="mt-0 grid gap-4 sm:grid-cols-3">
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

        {/* Como Funciona */}
        <section className="bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Como funciona
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Step
                number={1}
                title="Envie seu contrato"
                description="Faça upload do PDF ou imagem. Simples e seguro."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                }
              />
              <Step
                number={2}
                title="Receba a análise"
                description="A IA identifica cláusulas abusivas e riscos com fundamentação legal."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                }
              />
              <Step
                number={3}
                title="Corrija o contrato"
                description="Com um clique, a IA gera uma versão corrigida e equilibrada."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                }
              />
              <Step
                number={4}
                title="Baixe em Word ou PDF"
                description="Pronto para assinar. Baixe no formato que preferir."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                }
              />
            </div>
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
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                }
              />
              <BenefitCard
                title="Análise em Minutos"
                description="Em vez de horas lendo cláusulas, receba um diagnóstico completo em menos de 2 minutos."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                }
              />
              <BenefitCard
                title="Correção Pronta para Assinar"
                description="Além de identificar problemas, geramos uma versão corrigida do seu contrato em Word ou PDF."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                }
              />
              <BenefitCard
                title="Privacidade Garantida"
                description="Seus documentos são criptografados e excluídos automaticamente em 7 dias. Zero acesso humano."
                icon={
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                }
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-slate-50 px-4 py-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
              Perguntas frequentes
            </h2>
            <div className="mt-10 space-y-6">
              <FAQ
                question="O ContratoSeguro substitui um advogado?"
                answer="Não. O ContratoSeguro é uma ferramenta de apoio que utiliza inteligência artificial para identificar possíveis riscos. Para decisões jurídicas importantes, recomendamos sempre consultar um advogado."
              />
              <FAQ
                question="Meu contrato é armazenado?"
                answer="Seus documentos são criptografados e excluídos automaticamente após 7 dias. Não utilizamos seus contratos para treinar modelos de IA nem compartilhamos com terceiros."
              />
              <FAQ
                question="A análise tem validade jurídica?"
                answer="A análise é um instrumento informativo e educacional, não um parecer jurídico. Ela identifica padrões e compara com a legislação brasileira para apontar possíveis riscos."
              />
              <FAQ
                question="Funciona para qualquer contrato?"
                answer="Sim, analisamos qualquer contrato em português brasileiro, com especialização em aluguel, trabalho, prestação de serviço, compra e venda e financiamento."
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

function Step({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100">
        <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          {icon}
        </svg>
        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
          {number}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
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


function TrustBadge({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
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

function BenefitCard({ title, description, icon }: { title: string; description: string; icon: React.ReactNode }) {
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
