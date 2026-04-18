'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

type UserMenuProps = {
  email: string;
  avatarUrl?: string | null;
};

export default function UserMenu({ email, avatarUrl }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const initials = email.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full ring-2 ring-brand-500/50 transition hover:ring-brand-400"
        aria-label="Menu do usuário"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={email} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full w-full items-center justify-center bg-brand-600 text-xs font-semibold text-white">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 min-w-[180px] rounded-xl border border-white/10 bg-[#1a1929] py-1 shadow-xl">
          {/* Email do usuário */}
          <div className="border-b border-white/10 px-4 py-2.5">
            <p className="truncate text-xs text-slate-400">{email}</p>
          </div>

          <Link
            href="/minha-biblioteca"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z"
              />
            </svg>
            Minha Biblioteca
          </Link>

          <form action="/auth/sair" method="POST">
            <button
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              <svg
                className="h-4 w-4 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Sair
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
