'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import UserMenu from '@/components/auth/UserMenu';
import type { User } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Verificar sessão atual
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoaded(true);
    });

    // Escutar mudanças de auth (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoaded(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0f0e17]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 shadow-lg shadow-brand-900/30">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-white">
            Contrato<span className="text-brand-400">Seguro</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/blog"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            Blog
          </Link>

          {/* Só renderiza o botão auth depois que verificou a sessão (evita flash) */}
          {loaded && (
            user ? (
              <UserMenu
                email={user.email ?? ''}
                avatarUrl={user.user_metadata?.avatar_url ?? null}
              />
            ) : (
              <Link
                href="/entrar"
                className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-medium text-white transition hover:bg-brand-500"
              >
                Entrar
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
