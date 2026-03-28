'use client';

import { useEffect, useState, useCallback } from 'react';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import RiskScore from '@/components/analysis/RiskScore';
import IssueCard from '@/components/analysis/IssueCard';
import ProcessingStatus from '@/components/analysis/ProcessingStatus';
import ShareButtons from '@/components/analysis/ShareButtons';
import { DISCLAIMER_LEGAL } from '@/config/constants';
import { addToHistory } from '@/lib/local-history';

type AnalysisData = {
  status: string;
  contractType: string | null;
  filename: string | null;
  error?: string;
  result?: {
    global_score: { value: number; interpretation: string; formula_detail: string };
    total_issues: number;
    top_issues: {
      clause_id: string;
      original_text_summary: string;
      risk_level: string;
      explanation: string;
    }[];
    executive_summary: string;
  };
};

export default function AnalisePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/contract/${params.id}/status`);
      if (res.status === 404) {
        setNotFound(true);
        return true; // stop polling
      }
      const json = await res.json();
      setData(json);
      return json.status === 'analyzed' || json.status === 'error';
    } catch {
      return false;
    }
  }, [params.id]);

  useEffect(() => {
    let active = true;
    let timeout: NodeJS.Timeout;

    async function poll() {
      if (!active) return;
      const done = await fetchStatus();
      if (!done && active) {
        timeout = setTimeout(poll, 2000);
      }
    }

    poll();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [fetchStatus]);

  // Salvar no histórico local quando análise completar
  useEffect(() => {
    if (data?.status === 'analyzed' && data.result) {
      addToHistory({
        contractId: params.id,
        filename: data.filename || 'contrato.pdf',
        contractType: formatContractType(data.contractType || 'outro'),
        score: data.result.global_score.value,
        date: new Date().toISOString(),
      });
    }
  }, [data?.status, data?.result, data?.contractType, params.id]);

  const isProcessing =
    data &&
    !notFound &&
    ['uploaded', 'classifying', 'classified', 'analyzing'].includes(data.status);

  const isComplete = data?.status === 'analyzed' && data.result;
  const isError = data?.status === 'error' || notFound;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 px-4 py-8">
        <div className="mx-auto max-w-2xl">
          {/* Processando */}
          {isProcessing && <ProcessingStatus status={data.status} />}

          {/* Erro */}
          {isError && (
            <div className="flex flex-col items-center py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <svg className="h-7 w-7 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-gray-900">
                {notFound ? 'Contrato não encontrado' : 'Erro na análise'}
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {notFound
                  ? 'Este contrato não existe ou já expirou.'
                  : data?.error || 'Ocorreu um erro ao analisar seu contrato.'}
              </p>
              <a
                href="/"
                className="mt-6 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Tentar novamente
              </a>
            </div>
          )}

          {/* Resultado */}
          {isComplete && data.result && (
            <div className="space-y-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Resultado da Análise</h1>
                {data.contractType && (
                  <p className="mt-1 text-sm text-gray-500">
                    Tipo: {formatContractType(data.contractType)}
                  </p>
                )}
              </div>

              {/* Score */}
              <RiskScore
                score={data.result.global_score.value}
                interpretation={data.result.global_score.interpretation}
              />

              {/* Compartilhar */}
              <ShareButtons
                score={data.result.global_score.value}
                contractType={formatContractType(data.contractType || 'outro')}
              />

              {/* Resumo */}
              <div className="rounded-xl bg-gray-50 p-4">
                <h2 className="text-sm font-semibold text-gray-900">Resumo</h2>
                <p className="mt-2 text-sm leading-relaxed text-gray-700">
                  {data.result.executive_summary}
                </p>
              </div>

              {/* Total de problemas */}
              {data.result.total_issues > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-medium text-amber-800">
                    Foram encontrados{' '}
                    <span className="font-bold text-amber-900">{data.result.total_issues} problemas</span>
                    {' '}neste contrato
                  </p>
                  {data.result.total_issues > 3 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Mostrando os {Math.min(3, data.result.top_issues.length)} mais graves.
                      Os demais estarão disponíveis na análise completa.
                    </p>
                  )}
                </div>
              )}

              {/* Top Issues */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-gray-900">Principais problemas</h2>
                {data.result.top_issues.map((issue, i) => (
                  <IssueCard
                    key={i}
                    clauseId={issue.clause_id}
                    summary={issue.original_text_summary}
                    riskLevel={issue.risk_level}
                    explanation={issue.explanation}
                    delay={200 + i * 200}
                  />
                ))}

                {/* Locked issues placeholder */}
                {data.result.total_issues > 3 && (
                  <>
                    {Array.from({ length: Math.min(2, data.result.total_issues - 3) }).map(
                      (_, i) => (
                        <IssueCard
                          key={`locked-${i}`}
                          clauseId="?"
                          summary="Problema adicional identificado"
                          riskLevel="medium"
                          explanation="Detalhes disponíveis na análise completa."
                          locked
                        />
                      )
                    )}
                  </>
                )}
              </div>

              {/* Download do relatório */}
              <div className="flex justify-center">
                <a
                  href={`/api/contract/${params.id}/report`}
                  download
                  className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-brand-100 active:scale-95"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Baixar relatório em PDF
                </a>
              </div>

              {/* CTA futuro (desabilitado na beta) */}
              <div className="rounded-xl bg-brand-50 p-6 text-center">
                <h3 className="text-base font-semibold text-brand-900">
                  Quer o contrato corrigido?
                </h3>
                <p className="mt-2 text-sm text-brand-700">
                  Em breve você poderá baixar a versão corrigida do seu contrato,
                  com todas as cláusulas abusivas removidas e proteções adicionadas.
                </p>
                <button
                  disabled
                  className="mt-4 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white opacity-50 cursor-not-allowed"
                >
                  Em breve
                </button>
              </div>

              {/* Disclaimer */}
              <p className="text-xs leading-relaxed text-gray-400">{DISCLAIMER_LEGAL}</p>

              {/* Voltar */}
              <div className="text-center">
                <a
                  href="/"
                  className="text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  Analisar outro contrato
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

function formatContractType(type: string): string {
  const map: Record<string, string> = {
    aluguel: 'Contrato de Aluguel',
    trabalho: 'Contrato de Trabalho',
    servico: 'Prestação de Serviço',
    compra_venda: 'Compra e Venda',
    financiamento: 'Financiamento',
    digital: 'Termos Digitais',
    outro: 'Outro',
  };
  return map[type] || type;
}
