import Link from 'next/link';
import { DISCLAIMER_LEGAL } from '@/config/constants';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-900">ContratoSeguro</span>
        </div>
        <p className="text-xs leading-relaxed text-gray-400">{DISCLAIMER_LEGAL}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
          <span>&copy; {new Date().getFullYear()} ContratoSeguro</span>
          <div className="flex gap-4">
            <Link href="/privacidade" className="transition-colors hover:text-gray-600">
              Privacidade
            </Link>
            <Link href="/termos" className="transition-colors hover:text-gray-600">
              Termos de Uso
            </Link>
            <Link href="/blog" className="transition-colors hover:text-gray-600">
              Blog
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
