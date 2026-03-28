'use client';

import { useState, useEffect } from 'react';

const MESSAGES = [
  { text: 'Lendo seu contrato...', delay: 0 },
  { text: 'Identificando cláusulas...', delay: 5000 },
  { text: 'Classificando tipo de contrato...', delay: 10000 },
  { text: 'Analisando riscos jurídicos...', delay: 15000 },
  { text: 'Comparando com legislação brasileira...', delay: 25000 },
  { text: 'Calculando score de risco...', delay: 35000 },
  { text: 'Gerando relatório...', delay: 45000 },
  { text: 'Finalizando análise...', delay: 55000 },
];

const TIPS = [
  'Você sabia? A maioria dos contratos de aluguel tem pelo menos 1 cláusula que pode ser contestada.',
  'Multas de rescisão acima de 10% do valor total são consideradas abusivas pelo CDC.',
  'Todo contrato de aluguel deve prever condições de rescisão para ambas as partes.',
  'Cláusulas que renunciam a direitos irrenunciáveis são nulas, mesmo se assinadas.',
];

type ProcessingStatusProps = {
  status: string;
};

export default function ProcessingStatus({ status }: ProcessingStatusProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [tipIndex, setTipIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const nextIndex = MESSAGES.findLastIndex((m) => m.delay <= elapsed);
    if (nextIndex >= 0) setMessageIndex(nextIndex);
  }, [elapsed]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="h-6 w-6 text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-900">{MESSAGES[messageIndex].text}</p>
        <p className="mt-1 text-xs text-gray-400">
          {status === 'classifying' && 'Etapa 1 de 2'}
          {status === 'classified' && 'Etapa 1 de 2 concluída'}
          {status === 'analyzing' && 'Etapa 2 de 2'}
        </p>
      </div>

      <div className="w-full max-w-sm">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-brand-600 transition-all duration-1000 ease-out"
            style={{ width: `${Math.min((elapsed / 60000) * 100, 95)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 max-w-sm rounded-lg bg-brand-50 p-4">
        <p className="text-center text-xs leading-relaxed text-brand-700">
          {TIPS[tipIndex]}
        </p>
      </div>
    </div>
  );
}
