/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Impede clickjacking
          { key: 'X-Frame-Options', value: 'DENY' },
          // Impede MIME-type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controla o que é enviado no Referer
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Força HTTPS por 1 ano
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          // Desabilita funcionalidades desnecessárias do browser
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // CSP: permite Supabase, Anthropic (via servidor), Vercel Analytics e fontes próprias
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Scripts: Next.js inline + Vercel Analytics
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              // Estilos: inline necessário para Tailwind
              "style-src 'self' 'unsafe-inline'",
              // Imagens: próprias + Supabase Storage + data URIs
              "img-src 'self' data: blob: https://*.supabase.co https://lh3.googleusercontent.com",
              // Fontes: próprias
              "font-src 'self'",
              // Conexões: Supabase + Vercel Analytics
              "connect-src 'self' https://*.supabase.co https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              // Frames: nenhum
              "frame-src 'none'",
              // Workers
              "worker-src 'self' blob:",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
