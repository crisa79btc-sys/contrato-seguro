import Link from 'next/link';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-5xl flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-50">
          <svg
            className="h-10 w-10 text-brand-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-gray-900">Pagina nao encontrada</h1>
        <p className="mb-8 max-w-md text-gray-500">
          A pagina que voce esta procurando nao existe ou foi movida. Verifique o endereco digitado
          ou volte para a pagina inicial.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/"
            className="rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
          >
            Voltar para o inicio
          </Link>
          <Link
            href="/blog"
            className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
          >
            Visitar o Blog
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
