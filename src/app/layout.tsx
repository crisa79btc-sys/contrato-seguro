import type { Metadata, Viewport } from 'next';
import './globals.css';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e40af',
};

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'ContratoSeguro - Análise de Contratos com IA | Grátis',
    template: '%s | ContratoSeguro',
  },
  description:
    'Analise seu contrato em minutos com inteligência artificial. Identifique cláusulas abusivas, riscos e receba uma versão corrigida. Gratuito.',
  keywords: [
    'análise de contrato',
    'cláusula abusiva',
    'contrato de aluguel',
    'revisão de contrato',
    'contrato de trabalho',
    'contrato de prestação de serviço',
    'contrato de compra e venda',
    'inteligência artificial',
    'verificar contrato',
    'contrato abusivo',
    'analisar contrato grátis',
    'correção de contrato',
    'contrato de locação',
    'direito do consumidor',
  ],
  authors: [{ name: 'ContratoSeguro' }],
  creator: 'ContratoSeguro',
  publisher: 'ContratoSeguro',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: BASE_URL,
    siteName: 'ContratoSeguro',
    title: 'ContratoSeguro - Análise de Contratos com IA | Grátis',
    description:
      'Seu contrato tem cláusulas abusivas? Descubra em minutos. Faça upload e receba análise gratuita com IA.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ContratoSeguro - Análise de Contratos com IA',
    description:
      'Seu contrato tem cláusulas abusivas? Descubra em minutos. Análise gratuita com IA.',
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: 'technology',
};

// Structured Data (JSON-LD) para Google Rich Results
function JsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'ContratoSeguro',
    url: BASE_URL,
    description:
      'Plataforma de análise e correção de contratos com inteligência artificial. Identifica cláusulas abusivas e gera versões corrigidas.',
    applicationCategory: 'LegalService',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BRL',
      description: 'Análise gratuita de contratos',
    },
    featureList: [
      'Análise de cláusulas abusivas',
      'Identificação de riscos contratuais',
      'Correção automática de contratos',
      'Download em PDF e Word',
      'Fundamentação na legislação brasileira',
    ],
    inLanguage: 'pt-BR',
    audience: {
      '@type': 'Audience',
      audienceType: 'Consumidores brasileiros',
      geographicArea: { '@type': 'Country', name: 'Brasil' },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// FAQ Structured Data para aparecer no Google
function FaqJsonLd() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'O ContratoSeguro substitui um advogado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não. O ContratoSeguro é uma ferramenta de apoio que utiliza inteligência artificial para identificar possíveis riscos. Para decisões jurídicas importantes, recomendamos sempre consultar um advogado.',
        },
      },
      {
        '@type': 'Question',
        name: 'A análise de contrato é gratuita?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, a análise é totalmente gratuita. Você faz upload do seu contrato em PDF e recebe o resultado em minutos, sem custo.',
        },
      },
      {
        '@type': 'Question',
        name: 'Meu contrato é armazenado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Seus documentos são criptografados e excluídos automaticamente após 7 dias. Não utilizamos seus contratos para treinar modelos de IA nem compartilhamos com terceiros.',
        },
      },
      {
        '@type': 'Question',
        name: 'Funciona para qualquer tipo de contrato?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim, analisamos qualquer contrato em português brasileiro, com especialização em aluguel, trabalho, prestação de serviço, compra e venda e financiamento.',
        },
      },
      {
        '@type': 'Question',
        name: 'A análise tem validade jurídica?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A análise é um instrumento informativo e educacional, não um parecer jurídico. Ela identifica padrões e compara com a legislação brasileira para apontar possíveis riscos.',
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
    />
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <JsonLd />
        <FaqJsonLd />
      </head>
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">{children}</body>
    </html>
  );
}
