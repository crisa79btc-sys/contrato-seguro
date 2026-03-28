'use client';

type RiskScoreProps = {
  score: number;
  interpretation: string;
};

function getScoreColor(score: number) {
  if (score >= 80) return { ring: 'text-green-500', bg: 'bg-green-50', text: 'text-green-700', label: 'Seguro' };
  if (score >= 60) return { ring: 'text-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', label: 'Razoável' };
  if (score >= 40) return { ring: 'text-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', label: 'Atenção' };
  if (score >= 20) return { ring: 'text-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', label: 'Perigoso' };
  return { ring: 'text-red-500', bg: 'bg-red-50', text: 'text-red-700', label: 'Crítico' };
}

export default function RiskScore({ score, interpretation }: RiskScoreProps) {
  const colors = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center rounded-2xl ${colors.bg} p-6`}>
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={`${colors.ring} transition-all duration-1000 ease-out`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-3xl font-bold ${colors.text}`}>{score}</span>
          <span className="text-xs text-gray-500">de 100</span>
        </div>
      </div>
      <span className={`mt-3 text-sm font-semibold ${colors.text}`}>{colors.label}</span>
      <p className="mt-1 text-center text-xs text-gray-600">{interpretation}</p>
    </div>
  );
}
