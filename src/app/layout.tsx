import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Instrument_Serif, Inter, JetBrains_Mono } from 'next/font/google';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: ['400'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
});

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
        name: 'Vale a pena pagar R$ 9,90 pela correção?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. Um advogado cobra de R$ 300 a R$ 1.000 para revisar um contrato. Uma única cláusula abusiva escondida pode custar milhares em processos ou multas indevidas. R$ 9,90 se paga na primeira cláusula corrigida.',
        },
      },
      {
        '@type': 'Question',
        name: 'Como posso confiar que a análise é correta?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'A IA cita artigo específico da lei em cada problema apontado (CC, CDC, CLT, etc.) — você pode verificar cada citação. Também integra jurisprudência pacificada do STF, STJ e TST. Mesmo assim, para decisões críticas, sempre recomendamos revisão por um advogado.',
        },
      },
      {
        '@type': 'Question',
        name: 'Meus dados ficam seguros?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Sim. Documentos são criptografados (AES-256), excluídos automaticamente em 7 dias e nunca usados para treinar modelos. Somos conformes com a LGPD. Nenhum humano tem acesso ao seu contrato — apenas a IA, pelo tempo estritamente necessário para a análise.',
        },
      },
      {
        '@type': 'Question',
        name: 'O ContratoSeguro substitui um advogado?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Não — e nem queremos substituir. Somos uma ferramenta de apoio que faz em 2 minutos o que levaria horas de leitura. Para litígios, contratos de alto valor ou situações complexas, sempre consulte um advogado. O ContratoSeguro é perfeito para triagem prévia, entender o que está assinando, ou ter uma segunda opinião rápida.',
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
      <body className={`${instrumentSerif.variable} ${inter.variable} ${jetbrainsMono.variable} min-h-screen bg-[#0b0613] antialiased`}>
        {children}
        <Analytics />
        <SpeedInsights />
        <WhatsAppButton />
      </body>
    </html>
  );
}
