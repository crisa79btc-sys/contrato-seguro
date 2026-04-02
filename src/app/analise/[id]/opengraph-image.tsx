import { ImageResponse } from 'next/og';

export const alt = 'Análise de Contrato - ContratoSeguro';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * OG image gerada dinamicamente para previews no WhatsApp, Facebook, etc.
 * Usa branding genérico (crawlers não acessam o store de contratos).
 */
export default async function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #2563eb 100%)',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '40px',
          }}
        >
          <span style={{ fontSize: '56px' }}>🛡️</span>
          <span style={{ color: 'white', fontSize: '48px', fontWeight: 800 }}>
            ContratoSeguro
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'white',
            borderRadius: '24px',
            padding: '48px 80px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          }}
        >
          <div
            style={{
              fontSize: '36px',
              fontWeight: 700,
              color: '#1e3a8a',
              marginBottom: '16px',
              textAlign: 'center',
            }}
          >
            Resultado da Análise
          </div>
          <div
            style={{
              fontSize: '22px',
              color: '#6b7280',
              textAlign: 'center',
              maxWidth: '600px',
            }}
          >
            Seu contrato foi analisado por IA com base na legislação brasileira.
            Veja os riscos identificados e baixe a versão corrigida.
          </div>
        </div>

        <div
          style={{
            marginTop: '32px',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '20px',
          }}
        >
          Analise seu contrato gratuitamente
        </div>
      </div>
    ),
    { ...size }
  );
}
