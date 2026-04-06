import type { Metadata } from 'next';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export const metadata: Metadata = {
  title: {
    default: 'Blog | ContratoSeguro',
    template: '%s | ContratoSeguro',
  },
  description:
    'Artigos sobre direito contratual, cláusulas abusivas, direitos do consumidor e dicas para proteger seus contratos. Conteúdo educativo em português.',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: `${BASE_URL}/blog`,
    siteName: 'ContratoSeguro',
  },
  alternates: {
    canonical: `${BASE_URL}/blog`,
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
