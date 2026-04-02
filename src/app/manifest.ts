import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ContratoSeguro - Análise de Contratos com IA',
    short_name: 'ContratoSeguro',
    description:
      'Analise seu contrato em minutos com inteligência artificial. Identifique cláusulas abusivas, riscos e receba uma versão corrigida.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e40af',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
