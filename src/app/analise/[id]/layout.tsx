import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const url = `${BASE_URL}/analise/${params.id}`;

  return {
    title: 'Resultado da Análise',
    description:
      'Veja o resultado da análise do seu contrato feita por IA. Riscos identificados com base na legislação brasileira.',
    openGraph: {
      title: 'Resultado da Análise - ContratoSeguro',
      description:
        'Este contrato foi analisado por IA. Veja os riscos identificados e baixe a versão corrigida gratuitamente.',
      url,
      siteName: 'ContratoSeguro',
      locale: 'pt_BR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Resultado da Análise - ContratoSeguro',
      description:
        'Este contrato foi analisado por IA. Veja os riscos identificados.',
    },
    robots: {
      index: false, // Análises individuais não devem ser indexadas
      follow: false,
    },
  };
}

export default function AnaliseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
