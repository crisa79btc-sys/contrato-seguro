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

type CorrectionChange = {
  clause_id: string;
  action: string;
  original_summary: string;
  new_summary: string;
  legal_basis: string;
};

type LegalNote = {
  topic: string;
  issue: string;
  legal_basis: string;
  explanation: string;
};

type CorrectionData = {
  corrected_text: string;
  changes_summary: string;
  changes: CorrectionChange[];
  stats: { total_changes: number; removed: number; modified: number; added: number };
  legal_notes: LegalNote[];
  disclaimer: string;
};

type MissingClause = {
  description: string;
  importance: 'critical' | 'recommended' | 'optional';
  legal_basis: string;
};

type AnalysisData = {
  status: string;
  contractType: string | null;
  filename: string | null;
  billingEnabled?: boolean;
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
    missing_clauses?: MissingClause[];
    executive_summary: string;
  };
  correction?: CorrectionData;
};

export default function AnalisePage({ params }: { params: { id: string } }) {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [correcting, setCorrecting] = useState(false);
  const [correctionError, setCorrectionError] = useState<string | null>(null);
  const [polling, setPolling] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [selectedMissingClauses, setSelectedMissingClauses] = useState<string[]>([]);
  const [clausesInitialized, setClausesInitialized] = useState(false);

  // Download seguro via fetch (evita baixar JSON de erro como arquivo)
  const handleDownload = useCallback(async (url: string, fallbackFilename: string) => {
    setDownloadError(null);
    setDownloading(fallbackFilename);
    try {
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        setDownloadError(errorData?.error || `Erro ao baixar o arquivo (${res.status}). Tente novamente.`);
        return;
      }
      const blob = await res.blob();
      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = fallbackFilename;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    } catch {
      setDownloadError('Erro de conexão ao baixar o arquivo. Verifique sua internet e tente novamente.');
    } finally {
      setDownloading(null);
    }
  }, []);

  // Detectar retorno do Mercado Pago (?payment=success|failure|pending)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const payment = urlParams.get('payment');
    if (payment) {
      setPaymentStatus(payment);
      // Limpar query param da URL sem recarregar
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Polling único para todos os estados
  useEffect(() => {
    if (!polling) return;

    let active = true;
    let timeout: NodeJS.Timeout;

    async function poll() {
      if (!active) return;
      try {
        const res = await fetch(`/api/contract/${params.id}/status`);
        if (res.status === 404) {
          setNotFound(true);
          setPolling(false);
          return;
        }
        const json = await res.json();
        setData(json);

        // Pagamento confirmado
        if (json.status === 'paid' && json.correction) {
          setCorrecting(false);
          setPolling(false);
          return;
        }

        // Correção concluída
        if (json.status === 'corrected' && json.correction) {
          setCorrecting(false);
          setPolling(false);
          return;
        }

        // Correção falhou (status voltou para analyzed com erro)
        if (correcting && json.status === 'analyzed' && json.error_message) {
          setCorrecting(false);
          setCorrectionError(json.error_message);
          setPolling(false);
          return;
        }

        // Análise completa (sem correção em andamento)
        if (json.status === 'analyzed' && !correcting) {
          setPolling(false);
          return;
        }

        // Erro geral
        if (json.status === 'error') {
          setPolling(false);
          return;
        }
      } catch {
        // continua polling
      }
      if (active) {
        timeout = setTimeout(poll, 2000);
      }
    }

    poll();
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [polling, correcting, params.id]);

  // Iniciar pagamento via Mercado Pago
  const handlePayment = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractId: params.id }),
      });
      const json = await res.json();

      if (json.free) {
        // Beta: download grátis, não precisa pagar
        return;
      }

      if (json.paymentUrl) {
        window.location.href = json.paymentUrl;
        return;
      }

      throw new Error(json.error || 'Erro ao iniciar pagamento.');
    } catch (err) {
      setPaying(false);
      alert(err instanceof Error ? err.message : 'Erro ao processar pagamento.');
    }
  };

  const handleCorrect = async () => {
    setCorrecting(true);
    setCorrectionError(null);
    try {
      const requestedClauses =
        selectedMissingClauses.length > 0
          ? (data?.result?.missing_clauses ?? []).filter((c) =>
              selectedMissingClauses.includes(c.description)
            )
          : [];

      const res = await fetch(`/api/contract/${params.id}/correct`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requested_clauses: requestedClauses }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error || 'Erro ao iniciar correção.');
      }
      // Reativar polling para acompanhar a correção
      setPolling(true);
    } catch (err) {
      setCorrecting(false);
      setCorrectionError(err instanceof Error ? err.message : 'Erro inesperado.');
    }
  };

  // Auto-selecionar cláusulas ausentes críticas quando análise completar
  useEffect(() => {
    if (!clausesInitialized && data?.result?.missing_clauses?.length) {
      const criticalDescriptions = data.result.missing_clauses
        .filter((c) => c.importance === 'critical')
        .map((c) => c.description);
      setSelectedMissingClauses(criticalDescriptions);
      setClausesInitialized(true);
    }
  }, [data?.result?.missing_clauses, clausesInitialized]);

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
  }, [data?.status, data?.result, data?.contractType, data?.filename, params.id]);

  const isProcessing =
    data &&
    !notFound &&
    ['uploaded', 'classifying', 'classified', 'analyzing'].includes(data.status);

  const isComplete = ['analyzed', 'correcting', 'corrected', 'paid'].includes(data?.status || '') && data?.result;
  const isError = data?.status === 'error' || notFound;
  const hasCorrectionResult = ['corrected', 'paid'].includes(data?.status || '') && data?.correction;
  const isPaid = data?.status === 'paid';
  const billingEnabled = data?.billingEnabled ?? false;
  const canDownloadFree = !billingEnabled || isPaid;

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
                {data.filename && (
                  <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                    {data.filename}
                  </p>
                )}
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
              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={() => handleDownload(`/api/contract/${params.id}/report`, `analise-contrato-${params.id.slice(0, 8)}.pdf`)}
                  disabled={downloading !== null}
                  className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition-all hover:bg-brand-100 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
                >
                  {downloading === `analise-contrato-${params.id.slice(0, 8)}.pdf` ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-300 border-t-brand-700" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                  )}
                  Baixar relatório em PDF
                </button>
                {downloadError && !downloading && (
                  <p className="text-xs text-red-600 text-center max-w-sm">{downloadError}</p>
                )}
              </div>

              {/* Cláusulas ausentes */}
              {!hasCorrectionResult && data.result.missing_clauses && data.result.missing_clauses.length > 0 && (
                <MissingClausesSection
                  clauses={data.result.missing_clauses}
                  selected={selectedMissingClauses}
                  onToggle={(desc) =>
                    setSelectedMissingClauses((prev) =>
                      prev.includes(desc) ? prev.filter((d) => d !== desc) : [...prev, desc]
                    )
                  }
                />
              )}

              {/* Correção do contrato */}
              {!hasCorrectionResult && (
                <div id="correction-section" className="rounded-xl bg-brand-50 p-6 text-center">
                  <h3 className="text-base font-semibold text-brand-900">
                    Quer o contrato corrigido?
                  </h3>
                  <p className="mt-2 text-sm text-brand-700">
                    Gere a versão corrigida do seu contrato, com todas as cláusulas
                    abusivas removidas e proteções adicionadas.
                  </p>

                  {correctionError && (
                    <p className="mt-2 text-sm text-red-600">{correctionError}</p>
                  )}

                  <button
                    onClick={handleCorrect}
                    disabled={correcting}
                    className={`mt-4 rounded-xl px-6 py-2.5 text-sm font-semibold text-white transition-all ${
                      correcting
                        ? 'bg-brand-400 cursor-wait'
                        : 'bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-lg shadow-brand-600/25'
                    }`}
                  >
                    {correcting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Corrigindo contrato...
                      </span>
                    ) : selectedMissingClauses.length > 0 ? (
                      `Corrigir + incluir ${selectedMissingClauses.length} cláusula${selectedMissingClauses.length > 1 ? 's' : ''}`
                    ) : (
                      'Corrigir contrato gratuitamente'
                    )}
                  </button>
                </div>
              )}

              {/* Aviso de retorno de pagamento */}
              {paymentStatus === 'success' && !isPaid && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                  <p className="text-sm font-medium text-amber-800">
                    Pagamento em processamento. O download será liberado em instantes...
                  </p>
                </div>
              )}
              {paymentStatus === 'failure' && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                  <p className="text-sm font-medium text-red-800">
                    Pagamento não concluído. Tente novamente.
                  </p>
                </div>
              )}

              {/* Resultado da correção */}
              {hasCorrectionResult && data.correction && (
                <CorrectionResult
                  correction={data.correction}
                  contractId={params.id}
                  canDownloadFree={canDownloadFree}
                  billingEnabled={billingEnabled}
                  onPayment={handlePayment}
                  paying={paying}
                  onDownload={handleDownload}
                  downloading={downloading}
                  downloadError={downloadError}
                />
              )}

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

const IMPORTANCE_STYLES: Record<string, { badge: string; label: string }> = {
  critical: { badge: 'bg-red-100 text-red-700', label: 'Crítico' },
  recommended: { badge: 'bg-amber-100 text-amber-700', label: 'Recomendado' },
  optional: { badge: 'bg-gray-100 text-gray-600', label: 'Opcional' },
};

function MissingClausesSection({
  clauses,
  selected,
  onToggle,
}: {
  clauses: MissingClause[];
  selected: string[];
  onToggle: (desc: string) => void;
}) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <svg className="h-4 w-4 shrink-0 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <h3 className="text-sm font-semibold text-blue-900">
          Cláusulas ausentes ({clauses.length} identificada{clauses.length > 1 ? 's' : ''})
        </h3>
      </div>
      <p className="mb-3 text-xs text-blue-700">
        Seu contrato não possui estas proteções. Selecione as que deseja incluir na correção:
      </p>
      <div className="space-y-2">
        {clauses.map((clause) => {
          const isSelected = selected.includes(clause.description);
          const style = IMPORTANCE_STYLES[clause.importance] ?? IMPORTANCE_STYLES.optional;
          return (
            <label
              key={clause.description}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                isSelected
                  ? 'border-blue-300 bg-white'
                  : 'border-transparent bg-blue-50 hover:bg-white/60'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggle(clause.description)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-blue-600"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                    {style.label}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{clause.description}</span>
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{clause.legal_basis}</p>
              </div>
            </label>
          );
        })}
      </div>
      {selected.length === 0 && (
        <p className="mt-2 text-xs text-blue-600">
          Nenhuma cláusula selecionada — o contrato será corrigido sem adições.
        </p>
      )}
    </div>
  );
}

const ACTION_COLORS: Record<string, string> = {
  removed: 'bg-red-100 text-red-800',
  modified: 'bg-blue-100 text-blue-800',
  clarified: 'bg-purple-100 text-purple-800',
  added: 'bg-green-100 text-green-800',
  updated: 'bg-amber-100 text-amber-800',
  simplified: 'bg-teal-100 text-teal-800',
};

const ACTION_LABELS: Record<string, string> = {
  removed: 'Removida',
  modified: 'Modificada',
  clarified: 'Clarificada',
  added: 'Adicionada',
  updated: 'Atualizada',
  simplified: 'Simplificada',
};

function CorrectionResult({ correction, contractId, canDownloadFree, billingEnabled, onPayment, paying, onDownload, downloading, downloadError }: {
  correction: CorrectionData;
  contractId: string;
  canDownloadFree: boolean;
  billingEnabled: boolean;
  onPayment: () => void;
  paying: boolean;
  onDownload: (url: string, filename: string) => void;
  downloading: string | null;
  downloadError: string | null;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-green-50 border border-green-200 p-6 text-center">
        <div className="flex justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>
        <h3 className="mt-3 text-base font-semibold text-green-900">Contrato corrigido!</h3>
        <p className="mt-1 text-sm text-green-700">{correction.changes_summary}</p>

        {/* Estatísticas */}
        {correction.stats && (
        <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
          <span className="rounded-full bg-white px-3 py-1 font-medium text-green-700 shadow-sm">
            {correction.stats.total_changes} alterações
          </span>
          {correction.stats.removed > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700">
              {correction.stats.removed} removidas
            </span>
          )}
          {correction.stats.modified > 0 && (
            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
              {correction.stats.modified} modificadas
            </span>
          )}
          {correction.stats.added > 0 && (
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-700">
              {correction.stats.added} adicionadas
            </span>
          )}
        </div>
        )}
      </div>

      {/* Lista de alterações */}
      {Array.isArray(correction.changes) && correction.changes.length > 0 && (
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900">Alterações realizadas</h3>
        {correction.changes.map((change, i) => (
          <div key={i} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ACTION_COLORS[change.action] || 'bg-gray-100 text-gray-700'}`}>
                {ACTION_LABELS[change.action] || change.action}
              </span>
              <span className="text-xs font-medium text-gray-500">Cláusula {change.clause_id}</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-400">Antes</p>
                <p className="text-sm text-gray-600 line-through">{change.original_summary}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400">Depois</p>
                <p className="text-sm text-gray-700">{change.new_summary}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-gray-400">{change.legal_basis}</p>
          </div>
        ))}
      </div>
      )}

      {/* Notas jurídicas */}
      {Array.isArray(correction.legal_notes) && correction.legal_notes.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">Fundamentação jurídica</h3>
          {correction.legal_notes.map((note, i) => (
            <details key={i} className="group rounded-xl border border-gray-200 bg-white">
              <summary className="flex cursor-pointer items-center justify-between p-4 text-sm font-semibold text-gray-900 [&::-webkit-details-marker]:hidden">
                {note.topic}
                <svg className="h-5 w-5 shrink-0 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </summary>
              <div className="px-4 pb-4 space-y-2">
                <p className="text-sm text-gray-600"><span className="font-medium">Problema:</span> {note.issue}</p>
                <p className="text-sm text-gray-600"><span className="font-medium">Base legal:</span> <span className="italic">{note.legal_basis}</span></p>
                <p className="text-sm leading-relaxed text-gray-500">{note.explanation}</p>
              </div>
            </details>
          ))}
        </div>
      )}

      {/* Botões de download ou pagamento */}
      <div className="space-y-3">
        <h3 className="text-center text-sm font-semibold text-gray-900">
          {canDownloadFree ? 'Baixar contrato corrigido' : 'Baixar contrato corrigido'}
        </h3>

        {canDownloadFree ? (
          /* Download liberado (beta grátis ou já pagou) */
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => onDownload(`/api/contract/${contractId}/download?format=docx`, `contrato_corrigido.docx`)}
                disabled={downloading !== null}
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 transition-all hover:bg-brand-700 hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-wait"
              >
                {downloading === 'contrato_corrigido.docx' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                )}
                Word (.docx)
              </button>
              <button
                onClick={() => onDownload(`/api/contract/${contractId}/download?format=pdf`, `contrato_corrigido.pdf`)}
                disabled={downloading !== null}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-brand-600 px-6 py-3 text-sm font-semibold text-brand-600 transition-all hover:bg-brand-50 active:scale-95 disabled:opacity-50 disabled:cursor-wait"
              >
                {downloading === 'contrato_corrigido.pdf' ? (
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-brand-300 border-t-brand-600" />
                ) : (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </svg>
                )}
                PDF (.pdf)
              </button>
            </div>
            {downloadError && !downloading && (
              <p className="text-xs text-red-600 text-center max-w-sm">{downloadError}</p>
            )}
          </div>
        ) : (
          /* Pagamento necessário */
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600 text-center">
              Para baixar o contrato corrigido em Word ou PDF, efetue o pagamento abaixo.
            </p>
            <button
              onClick={onPayment}
              disabled={paying}
              className={`flex items-center justify-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold text-white transition-all ${
                paying
                  ? 'bg-brand-400 cursor-wait'
                  : 'bg-brand-600 hover:bg-brand-700 active:scale-95 shadow-lg shadow-brand-600/25 hover:shadow-xl'
              }`}
            >
              {paying ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Redirecionando...
                </span>
              ) : (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                  </svg>
                  Baixar contrato corrigido — R$ 9,90
                </>
              )}
            </button>
            <p className="text-xs text-gray-400">
              Pagamento seguro via Mercado Pago. A análise continua gratuita.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
