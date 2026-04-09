'use client';

import { useState, useEffect, useCallback } from 'react';

type AnalyticsData = {
  totalContracts: number;
  totalAnalyses: number;
  totalCorrections: number;
  last7Days: number;
  last30Days: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  totalCostUsd: number;
  avgRiskScore: number;
  avgProcessingTimeMs: number;
  byDay: Record<string, number>;
  byType: Record<string, number>;
  recent: {
    id: string;
    original_filename: string;
    contract_type: string | null;
    status: string;
    created_at: string;
  }[];
};

const TYPE_LABELS: Record<string, string> = {
  aluguel: 'Aluguel',
  trabalho: 'Trabalho',
  servico: 'Serviço',
  compra_venda: 'Compra e Venda',
  financiamento: 'Financiamento',
  digital: 'Digital',
  outro: 'Outro',
  nao_classificado: 'Não classificado',
};

const STATUS_LABELS: Record<string, string> = {
  uploaded: 'Enviado',
  classifying: 'Classificando',
  classified: 'Classificado',
  analyzing: 'Analisando',
  analyzed: 'Analisado',
  correcting: 'Corrigindo',
  corrected: 'Corrigido',
  error: 'Erro',
  paid: 'Pago',
};

export default function AdminDashboard() {
  const [secret, setSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Recuperar sessão
  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) {
      setSecret(saved);
      setAuthenticated(true);
    }
  }, []);

  const fetchData = useCallback(async (s: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/analytics?secret=${encodeURIComponent(s)}`);
      if (res.status === 401) {
        setError('Senha incorreta.');
        setAuthenticated(false);
        sessionStorage.removeItem('admin_secret');
        return;
      }
      if (!res.ok) {
        setError('Erro ao buscar dados.');
        return;
      }
      const json = await res.json();
      setData(json);
      setAuthenticated(true);
      sessionStorage.setItem('admin_secret', s);
    } catch {
      setError('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch quando autenticado
  useEffect(() => {
    if (authenticated && secret) {
      fetchData(secret);
    }
  }, [authenticated, secret, fetchData]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (secret.trim()) fetchData(secret.trim());
  };

  // Tela de login
  if (!authenticated || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">ContratoSeguro Admin</h1>
            <p className="text-sm text-gray-500 mt-1">Painel de monitoramento</p>
          </div>
          <input
            type="password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="Senha de administrador"
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={loading || !secret.trim()}
            className="w-full rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
          {error && <p className="text-center text-sm text-red-600">{error}</p>}
        </form>
      </div>
    );
  }

  // Calcular max para barras de uso por dia
  const dayEntries = Object.entries(data.byDay).sort(([a], [b]) => a.localeCompare(b));
  const maxDay = Math.max(...dayEntries.map(([, v]) => v), 1);

  const typeEntries = Object.entries(data.byType).sort(([, a], [, b]) => b - a);
  const maxType = Math.max(...typeEntries.map(([, v]) => v), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">ContratoSeguro Admin</h1>
          <button
            onClick={() => fetchData(secret)}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
        {/* Cards principais */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card label="Total Contratos" value={data.totalContracts} />
          <Card label="Análises" value={data.totalAnalyses} />
          <Card label="Correções" value={data.totalCorrections} />
          <Card label="Custo Total" value={`US$ ${data.totalCostUsd.toFixed(4)}`} />
        </div>

        {/* Cards secundários */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card label="Últimos 7 dias" value={data.last7Days} />
          <Card label="Últimos 30 dias" value={data.last30Days} />
          <Card label="Score Médio" value={data.avgRiskScore} subtitle="/100" />
          <Card label="Tempo Médio" value={`${(data.avgProcessingTimeMs / 1000).toFixed(1)}s`} />
        </div>

        {/* Tokens */}
        <div className="grid grid-cols-2 gap-3">
          <Card label="Tokens Input" value={data.totalTokensInput.toLocaleString('pt-BR')} />
          <Card label="Tokens Output" value={data.totalTokensOutput.toLocaleString('pt-BR')} />
        </div>

        {/* Uso por dia */}
        {dayEntries.length > 0 && (
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Contratos por dia (30 dias)</h2>
            <div className="space-y-1.5">
              {dayEntries.map(([day, count]) => (
                <div key={day} className="flex items-center gap-2 text-xs">
                  <span className="w-20 shrink-0 text-gray-500">
                    {new Date(day + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                  </span>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded bg-blue-500 transition-all"
                      style={{ width: `${Math.max((count / maxDay) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Distribuição por tipo */}
        {typeEntries.length > 0 && (
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Por tipo de contrato</h2>
            <div className="space-y-2">
              {typeEntries.map(([type, count]) => (
                <div key={type} className="flex items-center gap-2 text-xs">
                  <span className="w-32 shrink-0 text-gray-600">{TYPE_LABELS[type] || type}</span>
                  <div className="flex-1">
                    <div
                      className="h-5 rounded bg-emerald-500 transition-all"
                      style={{ width: `${Math.max((count / maxType) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="w-6 text-right font-medium text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contratos recentes */}
        {data.recent.length > 0 && (
          <section className="rounded-xl border bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Contratos recentes</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-2 pr-3 font-medium">Arquivo</th>
                    <th className="pb-2 pr-3 font-medium">Tipo</th>
                    <th className="pb-2 pr-3 font-medium">Status</th>
                    <th className="pb-2 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent.map((c) => (
                    <tr key={c.id} className="border-b border-gray-50">
                      <td className="py-2 pr-3 text-gray-900 max-w-[180px] truncate" title={c.original_filename}>
                        {c.original_filename}
                      </td>
                      <td className="py-2 pr-3 text-gray-600">
                        {TYPE_LABELS[c.contract_type || ''] || c.contract_type || '-'}
                      </td>
                      <td className="py-2 pr-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-2 text-gray-500">
                        {new Date(c.created_at).toLocaleString('pt-BR', {
                          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ label, value, subtitle }: { label: string; value: string | number; subtitle?: string }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">
        {value}
        {subtitle && <span className="text-sm font-normal text-gray-400">{subtitle}</span>}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    analyzed: 'bg-green-100 text-green-700',
    corrected: 'bg-blue-100 text-blue-700',
    error: 'bg-red-100 text-red-700',
    paid: 'bg-purple-100 text-purple-700',
  };
  const cls = colors[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${cls}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}
