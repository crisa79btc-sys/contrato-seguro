'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getHistory, type HistoryEntry } from '@/lib/local-history';

function getScoreBadge(score: number) {
  if (score >= 80) return { color: 'bg-green-100 text-green-700', label: 'Seguro' };
  if (score >= 60) return { color: 'bg-blue-100 text-blue-700', label: 'Razoável' };
  if (score >= 40) return { color: 'bg-yellow-100 text-yellow-700', label: 'Atenção' };
  if (score >= 20) return { color: 'bg-orange-100 text-orange-700', label: 'Perigoso' };
  return { color: 'bg-red-100 text-red-700', label: 'Crítico' };
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

export default function RecentAnalyses() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  if (history.length === 0) return null;

  return (
    <section className="px-4 pb-8">
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-4 text-sm font-semibold text-gray-500">Análises recentes</h2>
        <div className="space-y-2">
          {history.map((entry) => {
            const badge = getScoreBadge(entry.score);
            return (
              <Link
                key={entry.contractId}
                href={`/analise/${entry.contractId}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100">
                    <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">{entry.filename}</p>
                    <p className="text-xs text-gray-500">
                      {entry.contractType} · {formatDate(entry.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${badge.color}`}>
                    {entry.score}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
