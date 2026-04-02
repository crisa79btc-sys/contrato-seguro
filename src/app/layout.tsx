import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e40af',
};

export const metadata: Metadata = {
  title: 'ContratoSeguro - Análise de Contratos com IA',
  description:
    'Analise seu contrato em minutos com inteligência artificial. Identifique cláusulas abusivas, riscos e receba uma versão corrigida.',
  keywords: [
    'análise de contrato',
    'cláusula abusiva',
    'contrato de aluguel',
    'revisão de contrato',
    'inteligência artificial',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-white font-sans text-gray-900 antialiased">{children}</body>
    </html>
  );
}
