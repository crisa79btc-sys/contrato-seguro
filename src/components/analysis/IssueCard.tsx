'use client';

import { useState, useEffect } from 'react';

type IssueCardProps = {
  clauseId: string;
  summary: string;
  riskLevel: string;
  explanation: string;
  locked?: boolean;
  delay?: number;
};

const riskConfig: Record<string, { color: string; bg: string; label: string }> = {
  critical: { color: 'text-red-700', bg: 'bg-red-100', label: 'Crítico' },
  high: { color: 'text-orange-700', bg: 'bg-orange-100', label: 'Alto' },
  medium: { color: 'text-yellow-700', bg: 'bg-yellow-100', label: 'Médio' },
  low: { color: 'text-blue-700', bg: 'bg-blue-100', label: 'Baixo' },
  ok: { color: 'text-green-700', bg: 'bg-green-100', label: 'OK' },
};

export default function IssueCard({ clauseId, summary, riskLevel, explanation, locked = false, delay = 0 }: IssueCardProps) {
  const config = riskConfig[riskLevel] || riskConfig.medium;
  const [visible, setVisible] = useState(delay === 0);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-500 ${locked ? 'relative overflow-hidden' : ''} ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs text-gray-400">Cláusula {clauseId}</span>
          </div>
          <p className="mt-2 text-sm font-medium text-gray-900">{summary}</p>
          <p className="mt-1 text-sm text-gray-600">{explanation}</p>
        </div>
      </div>

      {locked && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px]">
          <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2">
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            <span className="text-xs font-medium text-gray-600">Corrija o contrato para ver todos os problemas</span>
          </div>
        </div>
      )}
    </div>
  );
}
