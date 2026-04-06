/**
 * Gera imagens dinâmicas para posts de redes sociais.
 * URL pública acessível pelo Instagram e Facebook.
 *
 * Uso: /api/social/image/{id}?headline=Texto&category=aluguel
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

const CATEGORY_EMOJIS: Record<string, string> = {
  aluguel: '🏠',
  trabalho: '💼',
  servico: '🔧',
  compra_venda: '🚗',
  consumidor: '🛒',
  digital: '💻',
  geral: '📋',
};

const CATEGORY_LABELS: Record<string, string> = {
  aluguel: 'Contrato de Aluguel',
  trabalho: 'Contrato de Trabalho',
  servico: 'Prestação de Serviço',
  compra_venda: 'Compra e Venda',
  consumidor: 'Direito do Consumidor',
  digital: 'Contratos Digitais',
  geral: 'Dica Jurídica',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const headline = request.nextUrl.searchParams.get('headline') || 'Proteja seus direitos';
  const category = request.nextUrl.searchParams.get('category') || 'geral';
  const emoji = CATEGORY_EMOJIS[category] || '📋';
  const label = CATEGORY_LABELS[category] || 'Dica Jurídica';

  // Evitar warning de params não usado
  void params;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 40%, #2563eb 100%)',
          fontFamily: 'system-ui, sans-serif',
          padding: '60px',
        }}
      >
        {/* Header: Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '42px' }}>🛡️</span>
          <span style={{ color: 'white', fontSize: '36px', fontWeight: 800 }}>
            ContratoSeguro
          </span>
        </div>

        {/* Card central */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
            borderRadius: '24px',
            padding: '50px 60px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
            maxWidth: '900px',
            width: '100%',
          }}
        >
          {/* Categoria badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#eff6ff',
              borderRadius: '100px',
              padding: '8px 20px',
              marginBottom: '24px',
            }}
          >
            <span style={{ fontSize: '24px' }}>{emoji}</span>
            <span style={{ color: '#1e40af', fontSize: '18px', fontWeight: 600 }}>
              {label}
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '44px',
              fontWeight: 800,
              color: '#1e293b',
              textAlign: 'center',
              lineHeight: 1.2,
            }}
          >
            {headline}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '22px', fontWeight: 600 }}>
            Analise seu contrato gratuitamente com IA
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px' }}>
            contrato-seguro-inky.vercel.app
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1080 }
  );
}
