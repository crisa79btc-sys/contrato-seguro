'use client';

import { useState, useEffect } from 'react';
import { getHistory } from '@/lib/local-history';

type Props = {
  userId: string;
};

/**
 * Banner que aparece na Minha Biblioteca quando:
 * 1. O usuário acabou de logar
 * 2. Tem contratos no localStorage (histórico anônimo)
 *
 * Oferece vincular esses contratos à conta para ficarem na biblioteca.
 */
export default function ClaimAnonymousPrompt({ userId }: Props) {
  const [contractIds, setContractIds] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Verificar localStorage apenas no client
    const history = getHistory();
    if (history.length > 0) {
      setContractIds(history.map((h) => h.contractId));
      setVisible(true);
    }
  }, [userId]);

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch('/api/claim-contracts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractIds }),
      });

      if (res.ok) {
        setDone(true);
        // Recarregar a página para mostrar contratos na biblioteca
        setTimeout(() => window.location.reload(), 1200);
      } else {
        const data = await res.json().catch(() => ({}));
        console.error('[Claim] Erro:', data);
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }

  function handleDismiss() {
    setVisible(false);
  }

  if (!visible || done) {
    if (done) {
      return (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
          <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
          Contratos salvos na sua biblioteca!
        </div>
      );
    }
    return null;
  }

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 flex-shrink-0 text-brand-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p className="text-sm text-slate-300">
          Você tem{' '}
          <strong className="text-white">
            {contractIds.length} contrato{contractIds.length !== 1 ? 's' : ''}
          </strong>{' '}
          analisado{contractIds.length !== 1 ? 's' : ''} neste dispositivo. Deseja salvar na
          sua conta?
        </p>
      </div>

      <div className="flex gap-2 sm:flex-shrink-0">
        <button
          onClick={handleDismiss}
          className="rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:text-slate-300"
        >
          Ignorar
        </button>
        <button
          onClick={handleClaim}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-500 disabled:opacity-60"
        >
          {loading ? (
            <>
              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Salvando…
            </>
          ) : (
            'Salvar na conta'
          )}
        </button>
      </div>
    </div>
  );
}
