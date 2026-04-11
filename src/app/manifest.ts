import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ContratoSeguro - Análise de Contratos com IA',
    short_name: 'ContratoSeguro',
    description:
      'Analise seu contrato em minutos com inteligência artificial. Identifique cláusulas abusivas, riscos e receba uma versão corrigida. 100% gratuito.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f0e17',
    theme_color: '#7c3aed',
    orientation: 'portrait-primary',
    lang: 'pt-BR',
    dir: 'ltr',
    categories: ['productivity', 'utilities', 'legal'],
    icons: [
      { src: '/icon-192.png',          sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png',          sizes: '512x512', type: 'image/png' },
      { src: '/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    screenshots: [
      {
        src: '/brand/screenshot-mobile.png',
        sizes: '390x844',
        type: 'image/png',
        // @ts-expect-error — form_factor is valid in PWA spec but not yet in TS types
        form_factor: 'narrow',
        label: 'Análise de contrato em segundos',
      },
    ],
    shortcuts: [
      {
        name: 'Analisar contrato',
        short_name: 'Analisar',
        description: 'Fazer upload de um novo contrato para análise',
        url: '/',
        icons: [{ src: '/icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
