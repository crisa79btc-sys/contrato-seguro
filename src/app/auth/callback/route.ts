/**
 * Handler do callback OAuth do Google via Supabase.
 * O Supabase redireciona para este endpoint após o login bem-sucedido.
 * Troca o `code` por uma sessão e redireciona o usuário.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // `next` permite redirecionar para a página onde o usuário estava antes do login
  const next = searchParams.get('next') ?? '/minha-biblioteca';

  if (!code) {
    // Sem code = erro no fluxo OAuth
    return NextResponse.redirect(`${origin}/entrar?erro=oauth`);
  }

  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('[Auth Callback] Erro ao trocar code por sessão:', error.message);
    return NextResponse.redirect(`${origin}/entrar?erro=sessao`);
  }

  // Login bem-sucedido — redirecionar para biblioteca (ou página original)
  const redirectUrl = next.startsWith('/') ? `${origin}${next}` : origin;
  return NextResponse.redirect(redirectUrl);
}
