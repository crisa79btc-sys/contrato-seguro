/**
 * Geração de imagens para posts sociais via Google Gemini 2.0 Flash.
 * Gratuito: 500 imagens/dia no tier free.
 * Fallback: retorna null se Gemini não estiver configurado ou falhar.
 */

import { GoogleGenAI } from '@google/genai';

let genAI: GoogleGenAI | null = null;

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

/**
 * Verifica se o Gemini está configurado.
 */
export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Gera uma imagem 1080x1080 para post social usando Gemini.
 * Retorna o buffer da imagem PNG ou null se falhar.
 */
export async function generateSocialImage(params: {
  headline: string;
  category: string;
  categoryLabel: string;
  categoryEmoji: string;
}): Promise<{ data: Buffer; mimeType: string } | null> {
  const client = getClient();
  if (!client) {
    console.log('[Gemini] API key não configurada, usando fallback next/og');
    return null;
  }

  const prompt = `Crie uma imagem profissional 1080x1080 pixels para um post de rede social.

ESTILO:
- Design moderno e limpo, estilo corporate/legal tech
- Paleta de cores: tons de azul escuro (#1e3a8a), branco e dourado como acento
- Fundo com gradiente sutil ou padrão geométrico abstrato
- NÃO inclua fotos de pessoas reais
- Pode usar ícones vetoriais ou ilustrações minimalistas

CONTEÚDO:
- No topo: logo "🛡️ ContratoSeguro" em branco, fonte bold
- No centro, em destaque: "${params.headline}"
- Badge de categoria: ${params.categoryEmoji} ${params.categoryLabel}
- No rodapé: "Analise seu contrato gratuitamente com IA"
- URL pequena: "contrato-seguro-inky.vercel.app"

IMPORTANTE:
- O texto deve ser LEGÍVEL e bem posicionado
- Proporção quadrada (1:1)
- Qualidade profissional, pronto para publicar no Instagram/Facebook
- Contraste alto entre texto e fundo`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: prompt,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts;
    if (!parts) {
      console.error('[Gemini] Resposta sem parts');
      return null;
    }

    for (const part of parts) {
      if (part.inlineData?.data) {
        const buffer = Buffer.from(part.inlineData.data, 'base64');
        console.log(`[Gemini] Imagem gerada: ${(buffer.length / 1024).toFixed(0)}KB`);
        return {
          data: buffer,
          mimeType: part.inlineData.mimeType || 'image/png',
        };
      }
    }

    console.error('[Gemini] Resposta sem imagem inline');
    return null;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Gemini] Erro na geração de imagem:', msg);
    return null;
  }
}
