import { redirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';
import { getCurrentUser } from '@/lib/auth/current-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import ClaimAnonymousPrompt from '@/components/auth/ClaimAnonymousPrompt';

const RISK_COLORS: Record<string, string> = {
  Baixo:       'text-emerald-400',
  Moderado:    'text-yellow-400',
  Alto:        'text-orange-400',
  'Muito Alto': 'text-red-400',
};

function riskLabel(score: number | null): string {
  if (score === null) return 'Analisando…';
  if (score <= 30) return 'Baixo';
  if (score <= 55) return 'Moderado';
  if (score <= 75) return 'Alto';
  return 'Muito Alto';
}

function contractTypeLabel(type: string | null): string {
  const map: Record<string, string> = {
    aluguel:      'Aluguel',
    trabalho:     'Trabalho / Emprego',
    servico:      'Prestação de Serviços',
    compra_venda: 'Compra e Venda',
    financiamento:'Financiamento',
    digital:      'Digital / E-commerce',
    outro:        'Outro',
  };
  return type ? (map[type] ?? type) : 'Tipo não identificado';
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type Contract = {
  id: string;
  original_filename: string | null;
  contract_type: string | null;
  status: string;
  created_at: string;
  risk_score: number | null;
};

export default async function MinhabibliotecaPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/entrar');
  }

  const supabase = createSupabaseServerClient();

  // Buscar contratos do usuário — join com analyses para pegar o score
  const { data: contracts, error } = await supabase
    .from('contracts')
    .select(`
      id,
      original_filename,
      contract_type,
      status,
      created_at,
      analyses ( risk_score )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[Biblioteca] Erro ao buscar contratos:', error.message);
  }

  // Normalizar: extrair risk_score do join
  const items: Contract[] = (contracts ?? []).map((c) => ({
    id: c.id,
    original_filename: c.original_filename,
    contract_type: c.contract_type,
    status: c.status,
    created_at: c.created_at,
    risk_score: Array.isArray(c.analyses)
      ? (c.analyses[0]?.risk_score ?? null)
      : ((c.analyses as { risk_score: number | null } | null)?.risk_score ?? null),
  }));

  const hasContracts = items.length > 0;

  return (
    <div className="flex min-h-screen flex-col bg-[#0f0e17]">
      <Header />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        {/* Cabeçalho da página */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Minha Biblioteca</h1>
            <p className="mt-1 text-sm text-slate-400">
              {hasContracts
                ? `${items.length} contrato${items.length !== 1 ? 's' : ''} salvo${items.length !== 1 ? 's' : ''}`
                : 'Nenhum contrato salvo ainda'}
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Analisar novo contrato
          </Link>
        </div>

        {/* Banner de reivindicação de contratos anônimos */}
        <ClaimAnonymousPrompt userId={user.id} />

        {/* Lista de contratos */}
        {hasContracts ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map((contract) => {
              const label = riskLabel(contract.risk_score);
              const colorClass = RISK_COLORS[label] ?? 'text-slate-400';
              const isProcessing = !['analyzed', 'corrected'].includes(contract.status);

              return (
                <Link
                  key={contract.id}
                  href={`/analise/${contract.id}`}
                  className="group flex flex-col gap-2 rounded-2xl border border-white/5 bg-white/5 p-5 transition hover:border-brand-500/30 hover:bg-white/8"
                >
                  {/* Nome do arquivo */}
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-900/40">
                      <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">
                        {contract.original_filename ?? 'Contrato sem nome'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {contractTypeLabel(contract.contract_type)}
                      </p>
                    </div>
                  </div>

                  {/* Score e data */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${colorClass}`}>
                      {isProcessing ? (
                        <span className="text-slate-400">Processando…</span>
                      ) : (
                        <>
                          Risco {label}
                          {contract.risk_score !== null && (
                            <span className="ml-1 text-slate-500">({contract.risk_score})</span>
                          )}
                        </>
                      )}
                    </span>
                    <span className="text-slate-500">{formatDate(contract.created_at)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          /* Estado vazio */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5">
              <svg className="h-8 w-8 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-white">Sua biblioteca está vazia</h2>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              Faça upload de um contrato e ele será salvo aqui automaticamente.
            </p>
            <Link
              href="/"
              className="mt-6 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-500"
            >
              Analisar meu primeiro contrato
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
