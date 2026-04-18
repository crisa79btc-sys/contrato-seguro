/**
 * POST /api/claim-contracts
 *
 * Vincula contratos anônimos (user_id IS NULL) à conta do usuário logado.
 * Chamado pelo ClaimAnonymousPrompt após o usuário confirmar que quer salvar
 * seus contratos do localStorage na conta.
 *
 * Body: { contractIds: string[] }
 * Response: { claimed: number }
 */
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/current-user';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const bodySchema = z.object({
  contractIds: z.array(z.string().uuid()).min(1).max(50),
});

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: 'Autenticação necessária' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Lista de contratos inválida', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { contractIds } = parsed.data;

  const supabase = createSupabaseServerClient();

  // Chamar a função SQL que só vincula contratos com user_id IS NULL
  const { data, error } = await supabase.rpc('claim_anonymous_contracts', {
    p_contract_ids: contractIds,
  });

  if (error) {
    console.error('[ClaimContracts] Erro ao reivindicar:', error.message);
    return NextResponse.json(
      { error: 'Erro ao vincular contratos. Tente novamente.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ claimed: data ?? 0 });
}
