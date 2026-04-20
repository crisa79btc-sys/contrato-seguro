/**
 * Gera conteúdo para redes sociais usando Claude AI.
 * Reutiliza callClaude() do módulo de IA existente.
 */

import { callClaude } from '@/lib/ai/client';
import { safeParseJSON } from '@/lib/ai/utils';
import { SOCIAL_MEDIA } from '@/config/constants';
import type { TopicTemplate, GeneratedPost, CarouselPost } from './types';
import { FALLBACK_POSTS } from './topics';
import { buildUtmUrl } from './utm';

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app').trim();

function getSystemPrompt(ctaUrl: string): string {
  return `Você é um social media manager especializado em direito contratual brasileiro.
Sua missão é criar posts educativos que as pessoas QUEIRAM compartilhar — acessíveis, diretos e com apelo emocional.

TOM DE VOZ:
- Português brasileiro jovem e direto, como se fosse conversa no WhatsApp com um amigo
- Pode usar CAIXA ALTA para dramatizar (com moderação — 1-2x por post)
- Pode usar gírias moderadas ("pegadinha", "furada", "cair numa arapuca") — NUNCA palavrão
- Primeira frase é GANCHO: pergunta provocante, dado surpreendente ou situação dramática
- Evitar jargão jurídico na abertura. O nome da lei só entra DEPOIS de explicar em português normal.
- Objetivo: provocar reação ("nossa, não sabia!", "já caí nessa!", "vou mandar pra minha mãe")

ESTRUTURA DO POST:
1. GANCHO (1ª linha) — pergunta ou afirmação chocante
2. CONTEXTO — o problema em linguagem acessível (2-3 linhas)
3. DIREITO/LEI — em 1 linha, citando o artigo
4. CTA ENGAJAMENTO — pergunta para comentar ("já passou por isso?")
5. CTA SITE — link ${ctaUrl}
6. DISCLAIMER — "⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional."

EMOJIS:
- 2-4 por post, estrategicamente colocados (início e separadores)
- 🔥 😱 ⚠️ 💡 🚨 ✅ ❌ para drama/alerta
- ⚖️ 📜 📝 para jurídico
- 👇 💬 para CTAs

TAMANHO: 120-220 palavras.

REGRAS INVIOLÁVEIS:
- NUNCA invente artigos de lei. Só cite o que você tem certeza (CC, CDC, CLT, CF com artigo correto).
- Sempre finalize com o disclaimer — é obrigatório.
- CTA para o site SEMPRE inclui o link ${ctaUrl}.

HASHTAGS: 3-5 em português, mix de alta e média reach (ex: #direito #contratos #direitosdoconsumidor + #direitocontratual #clausulasabusivas).

HEADLINE IMAGEM: 5-8 palavras impactantes para a imagem do post.

FORMATO DE RESPOSTA (JSON, sem markdown):
{
  "text": "texto completo do post",
  "hashtags": ["#hashtag1", "#hashtag2"],
  "imageHeadline": "Headline impactante"
}`;
}

/**
 * Gera um post para redes sociais com base no tema fornecido.
 */
export async function generateSocialPost(
  topic: TopicTemplate,
  platform: 'instagram' | 'facebook' | 'youtube' = 'instagram',
  medium: 'post' | 'carousel' | 'reel' | 'story' = 'post'
): Promise<GeneratedPost> {
  try {
    const ctaUrl = buildUtmUrl({ source: platform, medium, campaign: topic.key || 'generic' });
    const typeInstructions: Record<string, string> = {
      dica: 'Crie um post no formato "Você sabia que..." com uma dica prática.',
      mito_verdade: 'Crie um post no formato "MITO ou VERDADE?" quebrando um mito comum.',
      checklist: 'Crie um post no formato de checklist com itens numerados ou com ✅.',
      estatistica: 'Crie um post usando um dado/estatística impactante como gancho.',
      pergunta: 'Crie um post com uma pergunta engajante para o público comentar.',
      caso_real: 'Crie um post no formato "CASO REAL" sobre uma cláusula absurda encontrada num contrato de verdade. Comece com "Olha essa cláusula real:" + citação entre aspas + comentário sarcástico/indignado + por que é nula/abusiva com artigo de lei.',
      antes_depois: 'Crie um post revelando uma cláusula contratual abusiva e como ela deveria ser escrita. Mostre a versão original (❌) e a corrigida (✅). Use tom de indignação e alívio. Cite o artigo de lei que torna a original nula.',
    };

    const userPrompt = `Tipo de post: ${typeInstructions[topic.type]}
Categoria: ${topic.category}
Tema: ${topic.promptHint}

Gere o post agora.`;

    const result = await callClaude({
      model: SOCIAL_MEDIA.AI_MODEL,
      systemPrompt: getSystemPrompt(ctaUrl),
      userPrompt,
      maxTokens: SOCIAL_MEDIA.MAX_TOKENS,
      temperature: 0.7,
      timeoutMs: SOCIAL_MEDIA.TIMEOUT_MS,
    });

    const parsed = safeParseJSON(result.content) as Record<string, unknown> | null;
    if (parsed && typeof parsed.text === 'string' && typeof parsed.imageHeadline === 'string') {
      return {
        text: parsed.text,
        hashtags: Array.isArray(parsed.hashtags) ? (parsed.hashtags as string[]) : [],
        imageHeadline: parsed.imageHeadline,
      };
    }

    console.error('[Social] Claude retornou formato inválido, usando fallback');
    return getRandomFallback();
  } catch (err) {
    console.error('[Social] Erro na geração de conteúdo:', err);
    return getRandomFallback();
  }
}

function getRandomFallback(): GeneratedPost {
  const index = Math.floor(Math.random() * FALLBACK_POSTS.length);
  return FALLBACK_POSTS[index];
}

const CAROUSEL_SYSTEM_PROMPT = `Você é um social media manager viral especializado em direito contratual brasileiro. Seu trabalho: criar carrosséis que PAREM o scroll, gerem SAVE, SHARE e COMENTÁRIO — não carrosséis educativos chatos.

TOM DE VOZ:
- Português brasileiro jovem e direto — conversa de WhatsApp, não aula de direito
- Pode usar CAIXA ALTA em palavras-chave (1-3 por post, nunca em frase inteira)
- Gírias moderadas: "pegadinha", "furada", "pilantragem", "cilada" — NUNCA palavrão
- Tom de cumplicidade: "a gente sabe que ninguém lê, mas..."

GANCHOS ESPECÍFICOS POR CATEGORIA (usar como inspiração, não copiar literalmente):
- aluguel: foco em dinheiro perdido, depósito retido, multa injusta — "Você PERDEU essa grana sem precisar"
- trabalho: foco em direito violado que o leitor já viveu — "Seu empregador fez isso? É ILEGAL"
- consumidor: foco em produto/serviço ruim cotidiano — "Essa empresa contou que você não saberia"
- digital: foco em dado cedido sem saber — "Você aceitou isso sem perceber"
- servico: foco em calote ou promessa descumprida — "R$ X jogados fora por causa disso"
- compra_venda: foco em armadilha oculta — "Comprou sem saber dessa armadilha?"
- condominio: foco em taxa ou regra abusiva do síndico — "Seu síndico pode fazer isso? NÃO"
- geral: foco em situação cotidiana — "Quase todo mundo já assinou isso sem saber"

ESTRUTURA DO CARROSSEL (3 a 5 slides — NUNCA mais que 5):
- Slide 1 (capa): gancho visceral (ver regras abaixo)
- Slides 2 a N-1: conteúdo prático (cada slide UM ponto)
- Slide penúltimo (ou último de conteúdo): PERGUNTA DIRETA AO LEITOR para gerar comentário
- (O slide de CTA final é gerado separadamente, NÃO incluir nos 'slides')

REGRAS DA CAPA (coverTitle):
- MÁXIMO 5 palavras. Idealmente 3-4.
- Provocativo, contraintuitivo, chocante ou curioso
- Usar CAIXA ALTA em 1-2 palavras-chave
- EXEMPLOS BONS: "PERDEU R$ 3 MIL", "CLÁUSULA ILEGAL COMUM", "NÃO ASSINE ISSO", "GOLPE LEGAL EXISTE", "VOCÊ PAGA DE BOBO", "CAIU NESSA?", "SÍNDICO NÃO PODE", "RESCISÃO GRATUITA?"
- EXEMPLOS RUINS (não usar): "5 cláusulas abusivas", "Dicas sobre contratos", "O que você precisa saber", "Guia completo sobre..."
- coverSubtitle: 1 linha curta que completa, não repete. Máx 12 palavras.

REGRAS DE CADA SLIDE DE CONTEÚDO:
- title: máx 5 palavras, impactante
- description: 1-2 frases DIRETAS. Começar com verbo ou fato. Evitar "é importante saber que..."
- law: artigo de lei REAL (CC, CDC, CLT, CF, Lei X/YYYY). NUNCA inventar.
- Último slide de conteúdo (penúltimo do carrossel) deve conter pergunta direta:
  Exemplos: "Já caiu nessa?", "Viu isso em contrato?", "Conhecia essa?"

REGRAS DA LEGENDA (caption):
ESTRUTURA OBRIGATÓRIA (nesta ordem, sem pular etapa):

1. GANCHO (linha 1): pergunta ou afirmação chocante. Use o estilo específico da categoria acima. Exemplos:
   "Você perdeu o depósito sem precisar? 😱" (aluguel)
   "⚠️ Seu empregador faz isso? É ILEGAL" (trabalho)
   "Já assinou algo e depois pensou 'que burro fui eu'? 👇" (geral)

2. CONTEÚDO (3-5 linhas): pontos principais, numerados com 1️⃣ 2️⃣ etc ou com ✅/❌. Máx 1 frase por ponto.

3. PERGUNTA DE ENGAJAMENTO (1 linha): pedir experiência. Exemplos:
   "Qual cláusula mais absurda VOCÊ já viu? Conta aqui 👇"
   "Já passou por isso? Manda nos comentários 💬"

4. CTAS ALGORÍTMICOS OBRIGATÓRIOS (2 linhas, NESTA ORDEM):
   "💾 Salva esse post pra revisar antes de assinar qualquer contrato"
   "👥 Marca alguém que precisa ver isso"

5. LINK: "🛡️ Analise seu contrato em 30 segundos GRÁTIS: PLACEHOLDER_UTM_URL"

6. DISCLAIMER: "⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional."

7. HASHTAGS: 3-5 em pt-BR, mix de alta e baixa competição.

TAMANHO TOTAL DA CAPTION: 150-230 palavras.

REGRAS INVIOLÁVEIS:
- NÃO colocar link na primeira linha (gancho vem primeiro — IG trunca no feed)
- NÃO inventar artigos de lei
- Manter disclaimer SEMPRE — não negociável
- Manter as DUAS linhas de CTA algorítmico (save + marca) SEMPRE

FORMATO DE RESPOSTA (JSON puro, sem markdown):
{
  "caption": "legenda completa seguindo a estrutura acima",
  "coverTitle": "Máx 5 palavras, com 1-2 em CAIXA ALTA",
  "coverSubtitle": "Subtítulo curto (máx 12 palavras)",
  "imageHeadline": "Headline impactante (5-7 palavras)",
  "slides": [
    {
      "title": "Título curto (máx 5 palavras)",
      "description": "1-2 frases diretas.",
      "law": "Art. XX da Lei YYYY"
    }
  ]
}

Gere entre 3 e 5 slides (NUNCA mais que 5). Retorne APENAS o JSON.`;

const ANTES_DEPOIS_SYSTEM_PROMPT = `Você é um social media manager viral especializado em direito contratual brasileiro. Seu trabalho: criar carrosséis no formato ANTES/DEPOIS que mostram uma cláusula abusiva REAL e como ela DEVERIA ser escrita. Esse formato é altamente viral porque deixa o leitor com raiva (do original) e aliviado (da correção).

TOM DE VOZ:
- Português jovem, direto. Tom de cumplicidade + indignação comedida.
- Na capa: choque ("Você assinou ISSO?", "CLÁUSULA NULA comum")
- No slide ANTES: tom sarcástico discreto ("como se você não fosse contestar...")
- No slide DEPOIS: tom confiante e encorajador ("assim fica justo pra você")

ESTRUTURA OBRIGATÓRIA (exatamente 3 slides de conteúdo):
- Slide 1 (ANTES): title="❌ COMO ESTÁ", description=cláusula abusiva literal (entre aspas), law=base legal que a torna inválida
- Slide 2 (DEPOIS): title="✅ COMO DEVERIA SER", description=versão corrigida da cláusula (entre aspas), law=artigo que fundamenta a correção
- Slide 3 (CONCLUSÃO): title="Por que é NULA?", description=explicação em 1-2 frases diretas de por que o original é abusivo + como contestar, law=artigo principal

REGRAS DA CAPA:
- coverTitle: máx 5 palavras, ex: "CLÁUSULA NULA CLÁSSICA", "VOCÊ ASSINOU ISSO?", "NÃO ACEITE MAIS", "ILEGAL e COMUM"
- coverSubtitle: 1 linha, ex: "Veja a versão que te protege de verdade"

REGRAS DA LEGENDA:
1. GANCHO: revelação chocante sobre a cláusula — "Essa cláusula aparece em X em 10 contratos e é NULA"
2. CONTEXTO: 2 linhas explicando o problema
3. SOLUÇÃO: 1 linha do que a lei garante
4. PERGUNTA DE ENGAJAMENTO: "Você já assinou algo parecido? 👇"
5. CTAS: "💾 Salva pra mostrar antes de assinar" + "👥 Marca alguém que assinou isso"
6. LINK: "🛡️ Analise seu contrato em 30 segundos GRÁTIS: PLACEHOLDER_UTM_URL"
7. DISCLAIMER: "⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional."

REGRAS INVIOLÁVEIS:
- As cláusulas nos slides DEVEM ser textos jurídicos reais (estilo contrato), entre aspas
- NÃO inventar artigos de lei
- Exatamente 3 slides (ANTES + DEPOIS + CONCLUSÃO)

FORMATO DE RESPOSTA (JSON puro):
{
  "caption": "legenda completa",
  "coverTitle": "Máx 5 palavras",
  "coverSubtitle": "Subtítulo curto",
  "imageHeadline": "Headline 5-7 palavras",
  "slides": [
    { "title": "❌ COMO ESTÁ", "description": "\"...cláusula abusiva literal...\"", "law": "CDC art. XX — torna nula" },
    { "title": "✅ COMO DEVERIA SER", "description": "\"...versão corrigida...\"", "law": "CC art. XX" },
    { "title": "Por que é NULA?", "description": "Explicação em 1-2 frases.", "law": "Artigo principal" }
  ]
}

Retorne APENAS o JSON.`;

/**
 * Gera um post em formato carrossel para Instagram/Facebook.
 */
export async function generateCarouselPost(
  topic: TopicTemplate,
  platform: 'instagram' | 'facebook' = 'instagram'
): Promise<CarouselPost> {
  try {
    const ctaUrl = buildUtmUrl({ source: platform, medium: 'carousel', campaign: topic.key || 'generic' });

    const isAntesDePois = topic.type === 'antes_depois';
    const basePrompt = isAntesDePois ? ANTES_DEPOIS_SYSTEM_PROMPT : CAROUSEL_SYSTEM_PROMPT;
    const systemPrompt = basePrompt.replace('PLACEHOLDER_UTM_URL', ctaUrl);

    const userPrompt = isAntesDePois
      ? `Cláusula para o formato ANTES/DEPOIS:\n${topic.promptHint}\nCategoria: ${topic.category}\n\nGere o carrossel ANTES/DEPOIS agora.`
      : `Tema: ${topic.promptHint}
Categoria: ${topic.category}
Tipo: ${topic.type}

Crie um carrossel educativo sobre este tema. Cada slide deve cobrir um aspecto diferente e prático.`;

    const result = await callClaude({
      model: SOCIAL_MEDIA.AI_MODEL,
      systemPrompt,
      userPrompt,
      maxTokens: 1800,
      temperature: 0.65,
      timeoutMs: SOCIAL_MEDIA.TIMEOUT_MS,
    });

    const parsed = safeParseJSON(result.content) as Record<string, unknown> | null;

    if (
      parsed &&
      typeof parsed.caption === 'string' &&
      typeof parsed.coverTitle === 'string' &&
      Array.isArray(parsed.slides) &&
      (parsed.slides as unknown[]).length >= 3
    ) {
      return {
        caption: parsed.caption,
        coverTitle: parsed.coverTitle,
        coverSubtitle: typeof parsed.coverSubtitle === 'string' ? parsed.coverSubtitle : '',
        imageHeadline: typeof parsed.imageHeadline === 'string' ? parsed.imageHeadline : parsed.coverTitle,
        slides: (parsed.slides as Array<Record<string, string>>).slice(0, 5).map((s) => ({
          title: s.title || '',
          description: s.description || '',
          law: s.law || '',
        })),
      };
    }

    console.error('[Social] Claude retornou formato inválido para carrossel');
    return getFallbackCarousel();
  } catch (err) {
    console.error('[Social] Erro na geração de carrossel:', err);
    return getFallbackCarousel();
  }
}

function getFallbackCarousel(): CarouselPost {
  return {
    caption: `Você já assinou um contrato sem ler o que estava escrito? 🤔

Conheça 5 cláusulas abusivas que todo brasileiro precisa conhecer:

1️⃣ Foro em cidade diferente — você pode ajuizar na sua cidade (CDC art. 101, I)
2️⃣ Multa rescisória excessiva — não pode superar a obrigação principal (CC arts. 412-413)
3️⃣ "Sem responsabilidade por nada" — renúncia total viola a boa-fé objetiva (CC art. 422)
4️⃣ Sem direito à devolução — retenção integral de valores é abusiva (CDC art. 51, II)
5️⃣ Fidelidade unilateral — sem contrapartida real, desequilibra o contrato (CC art. 421)

Você já encontrou alguma dessas cláusulas? Conta nos comentários 👇

🛡️ Analise seu contrato GRÁTIS: ${APP_URL}

⚖️ Conteúdo informativo. Não substitui orientação jurídica profissional.

#DireitoDoConsumidor #ContratoAbusivo #SeusDireitos #ProtecaoContratual #ContratoSeguro`,
    coverTitle: '5 cláusulas ABUSIVAS',
    coverSubtitle: 'que todo brasileiro precisa conhecer antes de assinar',
    imageHeadline: '5 cláusulas abusivas no contrato',
    slides: [
      { title: 'Foro em outra cidade', description: 'Em contrato de consumo, você pode ajuizar na sua cidade.', law: 'CDC art. 101, I' },
      { title: 'Multa rescisória abusiva', description: 'Multa não pode ultrapassar o valor da obrigação principal.', law: 'CC arts. 412-413' },
      { title: 'Sem responsabilidade', description: 'Renúncia total à responsabilidade viola a boa-fé objetiva.', law: 'CC art. 422' },
      { title: 'Sem devolução de valores', description: 'Reter 100% do que o cliente pagou é cláusula abusiva.', law: 'CDC art. 51, II' },
      { title: 'Fidelidade sem benefício', description: 'Fidelidade unilateral sem contrapartida desequilibra o contrato.', law: 'CC art. 421' },
    ],
  };
}
