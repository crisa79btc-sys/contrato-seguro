/**
 * Painel admin — aprovar/rejeitar padrões aprendidos pela IA.
 *
 * Auth: ADMIN_SECRET (reutiliza o padrão do /admin principal via sessionStorage).
 * Lista learnings pendentes agrupados por contract_type, com botões de ação.
 *
 * Depois de aprovado, o padrão é injetado dinamicamente no system prompt do
 * analyzer (src/lib/ai/analyzer.ts) quando um contrato do mesmo tipo for analisado.
 */

'use client';

import { useCallback, useEffect, useState } from 'react';

type Learning = {
  id: string;
  contract_type: string;
  pattern: string;
  source_sample: { questions?: string[] } | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  reviewed_at: string | null;
};

type Filter = 'pending' | 'approved' | 'rejected' | 'all';

const FILTER_LABELS: Record<Filter, string> = {
  pending: 'Pendentes',
  approved: 'Aprovados',
  rejected: 'Rejeitados',
  all: 'Todos',
};

export default function LearningsAdminPage() {
  const [secret, setSecret] = useState('');
  const [inputSecret, setInputSecret] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [learnings, setLearnings] = useState<Learning[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (s: string, f: Filter) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/admin/learnings?secret=${encodeURIComponent(s)}&status=${f}`
        );
        if (res.status === 401) {
          setAuthenticated(false);
          sessionStorage.removeItem('admin_secret');
          throw new Error('Senha incorreta');
        }
        if (!res.ok) throw new Error(`Erro ${res.status}`);
        const data = (await res.json()) as { learnings: Learning[] };
        setLearnings(data.learnings);
        setAuthenticated(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) {
      setSecret(saved);
      void load(saved, filter);
    }
  }, [filter, load]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setSecret(inputSecret);
    sessionStorage.setItem('admin_secret', inputSecret);
    void load(inputSecret, filter);
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(
        `/api/admin/learnings/${id}?secret=${encodeURIComponent(secret)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        }
      );
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      await load(secret, filter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar');
    }
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <form
          onSubmit={handleLogin}
          className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold text-gray-900">Admin — Learnings</h1>
          <p className="text-sm text-gray-600">
            Painel para aprovar padrões aprendidos pela IA com base nas perguntas dos usuários.
          </p>
          <input
            type="password"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            placeholder="Senha de administrador"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
          >
            Entrar
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    );
  }

  // Agrupar por contract_type
  const grouped = learnings.reduce<Record<string, Learning[]>>((acc, l) => {
    if (!acc[l.contract_type]) acc[l.contract_type] = [];
    acc[l.contract_type].push(l);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Padrões Aprendidos</h1>
          <div className="flex gap-2">
            {(Object.keys(FILTER_LABELS) as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>
        </header>

        {loading && <p className="text-gray-600">Carregando...</p>}
        {error && <p className="text-red-600">{error}</p>}
        {!loading && learnings.length === 0 && (
          <p className="text-gray-600">Nenhum learning nesta categoria.</p>
        )}

        {Object.entries(grouped).map(([type, items]) => (
          <section key={type} className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 uppercase">
              {type} ({items.length})
            </h2>
            <div className="space-y-3">
              {items.map((l) => (
                <div
                  key={l.id}
                  className="border border-gray-200 rounded-md p-4 space-y-2"
                >
                  <p className="text-gray-900 font-medium">{l.pattern}</p>
                  {l.source_sample?.questions && l.source_sample.questions.length > 0 && (
                    <details className="text-sm text-gray-600">
                      <summary className="cursor-pointer">
                        Ver {l.source_sample.questions.length} pergunta(s) de origem
                      </summary>
                      <ul className="mt-2 list-disc list-inside space-y-1">
                        {l.source_sample.questions.map((q, i) => (
                          <li key={i}>{q}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                  <div className="flex items-center justify-between pt-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        l.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : l.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {l.status.toUpperCase()}
                    </span>
                    {l.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus(l.id, 'approved')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Aprovar
                        </button>
                        <button
                          onClick={() => updateStatus(l.id, 'rejected')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
