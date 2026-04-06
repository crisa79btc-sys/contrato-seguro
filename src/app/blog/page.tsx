import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog - Artigos sobre Contratos e Direitos',
  description:
    'Artigos educativos sobre direito contratual brasileiro: cláusulas abusivas, contratos de aluguel, trabalho, prestação de serviço e direitos do consumidor.',
  keywords: [
    'blog direito contratual',
    'artigos sobre contratos',
    'cláusulas abusivas',
    'direitos do consumidor contratos',
    'contrato de aluguel',
    'contrato de trabalho',
  ],
};

interface BlogPost {
  slug: string;
  title: string;
  description: string;
  readingTime: string;
  date: string;
  category: string;
}

const posts: BlogPost[] = [
  {
    slug: 'clausulas-abusivas-contrato-aluguel',
    title: 'Cláusulas Abusivas em Contrato de Aluguel: Como Identificar e Se Proteger',
    description:
      'Saiba quais cláusulas são consideradas abusivas pela Lei do Inquilinato e pelo Código de Defesa do Consumidor. Guia completo para locatários e locadores.',
    readingTime: '8 min de leitura',
    date: '2026-04-06',
    category: 'Aluguel',
  },
  {
    slug: 'como-analisar-contrato-trabalho',
    title: 'Como Analisar um Contrato de Trabalho: Guia Completo para o Trabalhador',
    description:
      'Aprenda a identificar cláusulas irregulares em contratos de trabalho. Conheça seus direitos garantidos pela CLT e pela Constituição Federal.',
    readingTime: '9 min de leitura',
    date: '2026-04-06',
    category: 'Trabalho',
  },
  {
    slug: 'direitos-consumidor-contratos',
    title: 'Direitos do Consumidor em Contratos: O Que Você Precisa Saber',
    description:
      'Entenda como o Código de Defesa do Consumidor protege você em contratos de adesão, compras online, financiamentos e serviços. Guia prático com exemplos.',
    readingTime: '9 min de leitura',
    date: '2026-04-06',
    category: 'Consumidor',
  },
  {
    slug: 'contrato-prestacao-servico-riscos',
    title: 'Contrato de Prestação de Serviço: Riscos e Como Se Proteger',
    description:
      'Conheça os principais riscos em contratos de prestação de serviço e saiba como redigir ou revisar um contrato seguro, com base no Código Civil brasileiro.',
    readingTime: '8 min de leitura',
    date: '2026-04-06',
    category: 'Serviços',
  },
];

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('pt-BR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function BlogIndexPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Blog <span className="text-brand-600">ContratoSeguro</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Artigos educativos sobre direito contratual, cláusulas abusivas e como proteger seus
          interesses em qualquer contrato.
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl border border-gray-200 p-6 transition-all hover:border-brand-300 hover:shadow-lg"
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
                {post.category}
              </span>
              <span className="text-xs text-gray-400">{post.readingTime}</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-900 group-hover:text-brand-600">
              {post.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-600">{post.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <time className="text-xs text-gray-400" dateTime={post.date}>
                {formatDate(post.date)}
              </time>
              <span className="text-sm font-medium text-brand-600 group-hover:underline">
                Ler artigo
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-xl bg-brand-50 p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900">
          Tem um contrato para analisar?
        </h2>
        <p className="mt-2 text-gray-600">
          Faça upload do seu contrato e receba uma análise gratuita com inteligência artificial em
          minutos.
        </p>
        <Link
          href="/"
          className="mt-4 inline-block rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          Analisar meu contrato grátis
        </Link>
      </div>
    </div>
  );
}
