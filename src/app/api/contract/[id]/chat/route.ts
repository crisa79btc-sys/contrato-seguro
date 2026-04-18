/**
 * GET  /api/contract/[id]/chat   — retorna histórico de mensagens do chat
 * POST /api/contract/[id]/chat   — envia nova pergunta, retorna resposta da IA
 *
 * Limites:
 *   - Anônimo:   20 perguntas por contrato
 *   - Logado:   100 perguntas por contrato
 *   - Rate limit global: 10 perguntas/min por IP (anti-abuso)
 *
 * Economias:
 *   - Usa service_role para ler/escrever (permite contratos anônimos)
 *   - Texto do contrato cacheado via prompt caching da Anthropic (~90% off no input)
 */
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAdminClient } from '@/lib/db/supabase';
import { store } from '@/lib/store';
import { getCurrentUser } from '@/lib/auth/current-user';
import { canAccessContract } from '@/lib/auth/contract-access';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { askContract } from '@/lib/ai/chat';

const LIMIT_ANONYMOUS = 20;
const LIMIT_AUTHENTICATED = 100;

const postSchema = z.object({
  question: z.string().min(1).max(500),
});

// ---------------------------------------------------------------------------
// GET — histórico do chat
// ---------------------------------------------------------------------------
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: contractId } = params;

  // Verificar acesso ao contrato
  const [contract, user] = await Promise.all([
    store.getContract(contractId),
    getCurrentUser(),
  ]);

  if (!contract) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
  }

  if (!canAccessContract(contract.user_id, user?.id)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const admin = getAdminClient();

  const { data: messages, error } = await admin
    .from('chat_messages')
    .select('id, role, content, created_at')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) {
    console.error('[Chat GET] Erro ao buscar histórico:', error.message);
    return NextResponse.json({ error: 'Erro ao carregar histórico' }, { status: 500 });
  }

  // Contar perguntas para saber quantas restam
  const userMessages = (messages ?? []).filter((m) => m.role === 'user');
  const limit = user ? LIMIT_AUTHENTICATED : LIMIT_ANONYMOUS;

  return NextResponse.json({
    messages: messages ?? [],
    messagesUsed: userMessages.length,
    messagesLimit: limit,
  });
}

// ---------------------------------------------------------------------------
// POST — nova pergunta
// ---------------------------------------------------------------------------
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: contractId } = params;

  // 1. Validar body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Pergunta inválida (máximo 500 caracteres)', details: parsed.error.issues },
      { status: 400 }
    );
  }
  const { question } = parsed.data;

  // 2. Rate limit por IP — 10 perguntas/minuto (anti-abuso)
  const ip = getClientIp(request);
  const rl = await checkRateLimit({ name: 'chat', key: ip, maxRequests: 10, windowSeconds: 60 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Muitas perguntas em pouco tempo. Aguarde um momento.' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    );
  }

  // 3. Buscar contrato e usuário em paralelo
  const [contract, user] = await Promise.all([
    store.getContract(contractId),
    getCurrentUser(),
  ]);

  if (!contract) {
    return NextResponse.json({ error: 'Contrato não encontrado' }, { status: 404 });
  }

  if (!canAccessContract(contract.user_id, user?.id)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  // 4. Contrato precisa estar analisado para o chat funcionar
  if (!['analyzed', 'corrected'].includes(contract.status)) {
    return NextResponse.json(
      { error: 'A análise do contrato ainda não foi concluída. Aguarde.' },
      { status: 409 }
    );
  }

  const admin = getAdminClient();

  // 5. Verificar limite de perguntas
  const limit = user ? LIMIT_AUTHENTICATED : LIMIT_ANONYMOUS;

  const { count, error: countError } = await admin
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('contract_id', contractId)
    .eq('role', 'user');

  if (countError) {
    console.error('[Chat POST] Erro ao contar mensagens:', countError.message);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }

  const used = count ?? 0;
  if (used >= limit) {
    const loginMessage = user ? '' : ' Faça login para ter mais 80 perguntas.';
    return NextResponse.json(
      { error: `Você atingiu o limite de ${limit} perguntas neste contrato.${loginMessage}` },
      { status: 429 }
    );
  }

  // 6. Buscar histórico para contexto multi-turn (últimas 20 mensagens)
  const { data: history } = await admin
    .from('chat_messages')
    .select('role, content')
    .eq('contract_id', contractId)
    .order('created_at', { ascending: true })
    .limit(20);

  // 7. Chamar IA com prompt caching
  let result;
  try {
    result = await askContract({
      contractText: contract.original_text,
      contractType: contract.contract_type,
      history: (history ?? []).map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      question,
    });
  } catch (err) {
    console.error('[Chat POST] Erro na IA:', err);
    return NextResponse.json(
      { error: 'Erro ao processar sua pergunta. Tente novamente.' },
      { status: 500 }
    );
  }

  // 8. Persistir as duas mensagens (user + assistant) em batch
  const { error: insertError } = await admin.from('chat_messages').insert([
    {
      contract_id: contractId,
      role: 'user',
      content: question,
    },
    {
      contract_id: contractId,
      role: 'assistant',
      content: result.answer,
      tokens_input: result.tokensInput,
      tokens_output: result.tokensOutput,
      cached_tokens: result.cachedTokens,
    },
  ]);

  if (insertError) {
    console.error('[Chat POST] Erro ao salvar mensagens:', insertError.message);
    // Retornar a resposta mesmo assim — não bloquear o usuário
  }

  return NextResponse.json({
    answer: result.answer,
    messagesUsed: used + 1,
    messagesLimit: limit,
  });
}
