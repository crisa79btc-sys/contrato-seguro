import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const blogPosts = [
    'clausulas-abusivas-contrato-aluguel',
    'como-analisar-contrato-trabalho',
    'direitos-consumidor-contratos',
    'contrato-prestacao-servico-riscos',
  ];

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/privacidade`,
      lastModified: new Date('2026-04-06'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termos`,
      lastModified: new Date('2026-04-06'),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    ...blogPosts.map((slug) => ({
      url: `${BASE_URL}/blog/${slug}`,
      lastModified: new Date('2026-04-06'),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
