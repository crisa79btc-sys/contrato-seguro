import Link from 'next/link';
import { DISCLAIMER_LEGAL } from '@/config/constants';

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-xs leading-relaxed text-gray-500">{DISCLAIMER_LEGAL}</p>
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
