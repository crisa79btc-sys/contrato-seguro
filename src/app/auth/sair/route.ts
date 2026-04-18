/**
 * Rota de logout. Limpa a sessão do Supabase e redireciona para a home.
 * Aceita POST para segurança (evitar logout via GET por links externos).
 */
import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = createSupabaseServerClient();
  await supabase.auth.signOut();

  return NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000')
  );
}
