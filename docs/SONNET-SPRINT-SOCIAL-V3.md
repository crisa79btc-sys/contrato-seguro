# Sprint Social V3 — Conteúdo Viral + Engajamento Algorítmico

> **Para**: Sonnet 4.6
> **De**: Opus 4.7 (planejamento)
> **Objetivo**: transformar divulgação social de "zero engajamento" em máquina de viralização orgânica + sinais algorítmicos.
> **Data**: 2026-04-18

---

## 0. Contexto e premissas

### 0.1 Diagnóstico
- Conta ContratoSeguro tem 1 seguidor no Facebook e engajamento zero no Instagram.
- Posts atuais usam carrossel educativo genérico: ganchos fracos, títulos longos, 7 slides, zero loops de atenção.
- **Causas já corrigidas** (não mexer):
  - ~~Imagens todas iguais~~ → 7 temas de cor por categoria + 3 layouts por tipo em `src/app/api/social/image/[id]/route.tsx`
  - ~~UTM tracking~~ → `src/lib/social/utm.ts` injeta em todos os CTAs
  - ~~Hashtags 3-tier~~ → `src/lib/reels/hashtag-optimizer.ts`
- **Causas a atacar nesta sprint**:
  1. Ganchos fracos que não param o scroll
  2. Carrosséis longos demais (7 slides) → abandono
  3. Zero CTA explícito de save/share/comment
  4. Zero sinal algorítmico pro IG (primeiro comentário, pergunta direta)
  5. Frequência alta (5/sem) sem audiência → desperdício criativo
  6. Datas comemorativas subaproveitadas (só 6 no banco)
  7. Cover title muito longo (subtítulo + gênero) → não viraliza

### 0.2 Premissas de execução (LEIA ANTES DE CODAR)
- **Pensar globalmente antes de corrigir**: cada tarefa cita os arquivos envolvidos. Leia TODOS antes de começar.
- **Não fazer deploy/push** sem autorização explícita do usuário. Só build + commit local.
- **Manter compatibilidade** com estado atual: `CarouselPost` type pode ganhar campo, não perder.
- **Haiku para geração de conteúdo** (já configurado via `SOCIAL_MEDIA.AI_MODEL`). Não trocar modelo.
- **Testar build** (`npm run build`) ao final de cada Parte. Se quebrar, parar e arrumar antes de seguir.
- **Commit único** no final, com mensagem descritiva. NÃO commit por Parte.

### 0.3 Ordem de execução obrigatória
```
Parte 1 (conteúdo) → Parte 2 (engajamento) → Parte 3 (frequência+datas) → Parte 4 (opcional: stories)
```
Parte 4 é OPCIONAL — fazer apenas se build das Partes 1-3 passar limpo e sobrar orçamento de tempo.

---

## PARTE 1 — Conteúdo viral (prioridade máxima)

### 1.1 Adicionar tipo `caso_real` ao PostType

**Arquivo**: `src/lib/social/types.ts`

**Mudança**: adicionar `'caso_real'` ao union `PostType`:
```typescript
export type PostType =
  | 'dica'
  | 'mito_verdade'
  | 'checklist'
  | 'estatistica'
  | 'pergunta'
  | 'caso_real';
```

**Validação mental**: procure por `PostType` em todo `src/lib/social/` e confirme que cada `Record<PostType, ...>` ou switch não quebra. Em particular:
- `src/lib/social/topics.ts` → `DAY_OF_WEEK_CALENDAR` usa valores concretos, OK
- `src/lib/social/content-generator.ts` → `typeInstructions` é `Record<string, string>`, OK
- `src/app/api/social/image/[id]/route.tsx` → `BADGE_MAP` é `Record<string, string>`, OK

---

### 1.2 Adicionar 6 temas `caso_real` ao TOPIC_BANK

**Arquivo**: `src/lib/social/topics.ts`

**Mudança**: adicionar esta seção ao final de `TOPIC_BANK` (antes do `]`):

```typescript
  // === CASO REAL — cláusulas absurdas comentadas ===
  {
    key: 'caso-real-multa-100pct',
    category: 'aluguel',
    type: 'caso_real',
    promptHint: 'Cláusula real encontrada: "O locatário pagará multa equivalente a 100% do valor total do contrato em caso de rescisão antecipada". Comentar com sarcasmo: isso é absurdo e ilegal. A Lei 8.245/91 art. 4º exige multa PROPORCIONAL ao tempo restante. Tom de choque/indignação saudável.',
  },
  {
    key: 'caso-real-pj-pejotizacao',
    category: 'trabalho',
    type: 'caso_real',
    promptHint: 'Caso real: contrato PJ com jornada fixa 9-18h, chefe direto, exclusividade, férias não remuneradas. Comentar: isso é pejotização clássica e é RECLAMAÇÃO TRABALHISTA certa. CLT arts. 2º e 3º. Vínculo empregatício disfarçado.',
  },
  {
    key: 'caso-real-foro-abusivo',
    category: 'consumidor',
    type: 'caso_real',
    promptHint: 'Cláusula real: contrato de consumo eleger foro em cidade 2000 km distante do consumidor. Isso é NULO (CDC art. 51, IV). Consumidor ajuíza no próprio domicílio (CDC art. 101, I). Tom: "acham que você não vai contestar".',
  },
  {
    key: 'caso-real-reserva-dominio',
    category: 'compra_venda',
    type: 'caso_real',
    promptHint: 'Caso real: vendedor cobrou multa de 30% + reteve 100% dos valores pagos em compra de veículo parcelado. Comentar: retenção integral é abusiva (CDC art. 53). Com reserva de domínio válida, só pode reter o uso do bem + valor razoável pelo depreciação. CC arts. 521-528.',
  },
  {
    key: 'caso-real-assinatura-perpetua',
    category: 'digital',
    type: 'caso_real',
    promptHint: 'Cláusula real de app de streaming: "renovação automática por 12 meses sem opção de cancelamento online". CDC art. 51 + Lei 14.181/2021 (superendividamento). Cancelamento deve ser pelo MESMO canal da contratação (CDC art. 49 par. único). Tom: indignação comedida.',
  },
  {
    key: 'caso-real-limitacao-total',
    category: 'servico',
    type: 'caso_real',
    promptHint: 'Cláusula real: "a responsabilidade do prestador fica limitada ao valor da mensalidade, excluindo danos diretos, indiretos e lucros cessantes". NULA. Limitar responsabilidade por negligência grave viola CDC art. 51, I + CC art. 422 (boa-fé). Tom: "isso é comum e poucos sabem que é nulo".',
  },
```

**Validação mental**: o array `TOPIC_BANK` já tem 90+ temas. Adicionar 6 não quebra nada. Verificar que a vírgula após o último item permanece se houver mais itens depois.

---

### 1.3 Reescrever `CAROUSEL_SYSTEM_PROMPT` com ganchos virais

**Arquivo**: `src/lib/social/content-generator.ts`

**Substituir integralmente** a constante `CAROUSEL_SYSTEM_PROMPT` (linhas ~115–154) pelo prompt abaixo:

```typescript
const CAROUSEL_SYSTEM_PROMPT = `Você é um social media manager viral especializado em direito contratual brasileiro. Seu trabalho: criar carrosséis que PAREM o scroll, gerem SAVE, SHARE e COMENTÁRIO — não carrosséis educativos chatos.

TOM DE VOZ:
- Português brasileiro jovem e direto — conversa de WhatsApp, não aula de direito
- Pode usar CAIXA ALTA em palavras-chave (1-3 por post, nunca em frase inteira)
- Gírias moderadas: "pegadinha", "furada", "pilantragem", "cilada" — NUNCA palavrão
- Tom de cumplicidade: "a gente sabe que ninguém lê, mas..."

ESTRUTURA DO CARROSSEL (3 a 5 slides — NUNCA mais que 5):
- Slide 1 (capa): gancho visceral (ver regras abaixo)
- Slides 2 a N-1: conteúdo prático (cada slide UM ponto)
- Slide penúltimo (ou último de conteúdo): PERGUNTA DIRETA AO LEITOR para gerar comentário
- (O slide de CTA final é gerado separadamente, NÃO incluir nos 'slides')

REGRAS DA CAPA (coverTitle):
- MÁXIMO 5 palavras. Idealmente 3-4.
- Provocativo, contraintuitivo, chocante ou curioso
- Usar CAIXA ALTA em 1-2 palavras-chave
- EXEMPLOS BONS: "PERDEU R$ 3 MIL", "CLÁUSULA ILEGAL COMUM", "NÃO ASSINE ISSO", "GOLPE LEGAL EXISTE", "VOCÊ PAGA DE BOBO", "CAIU NESSA?"
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

1. GANCHO (linha 1): pergunta ou afirmação chocante. Exemplos:
   "Você pagou R$ 3 mil de multa sem precisar? 😱"
   "⚠️ 9 em cada 10 contratos têm ESSA cláusula ilegal"
   "Já assinou algo e depois pensou 'que burro fui eu'? 👇"

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
```

**Pontos críticos**:
- O placeholder `PLACEHOLDER_UTM_URL` é substituído em runtime pelo UTM real — manter exatamente como está
- A regra "3 a 5 slides" é enforçada pelo `.slice(0, 7)` existente — mudar esse `.slice(0, 7)` para `.slice(0, 5)` (próximo passo)

---

### 1.4 Enforçar máximo de 5 slides no parser

**Arquivo**: `src/lib/social/content-generator.ts`

**Mudança**: na função `generateCarouselPost`, trocar:
```typescript
slides: (parsed.slides as Array<Record<string, string>>).slice(0, 7).map((s) => ({
```
Por:
```typescript
slides: (parsed.slides as Array<Record<string, string>>).slice(0, 5).map((s) => ({
```

**Validação mental**: o fallback `getFallbackCarousel` devolve 5 slides — OK.

---

### 1.5 Adicionar `typeInstructions` para `caso_real` em `generateSocialPost`

**Arquivo**: `src/lib/social/content-generator.ts`

**Mudança**: na função `generateSocialPost`, dentro de `typeInstructions`, adicionar:
```typescript
caso_real: 'Crie um post no formato "CASO REAL" sobre uma cláusula absurda encontrada num contrato de verdade. Comece com "Olha essa cláusula real:" + citação entre aspas + comentário sarcástico/indignado + por que é nula/abusiva com artigo de lei.',
```

**Validação mental**: esse `typeInstructions` é `Record<string, string>` — não dá erro de tipo.

---

### 1.6 Atualizar `BADGE_MAP` no gerador de imagem

**Arquivo**: `src/app/api/social/image/[id]/route.tsx`

**Mudança**: no objeto `BADGE_MAP` (~linha 82), adicionar:
```typescript
caso_real: 'CASO REAL 🚨',
```

Resultado esperado:
```typescript
const BADGE_MAP: Record<string, string> = {
  dica:         'DICA JURÍDICA',
  mito_verdade: 'MITO ou VERDADE?',
  checklist:    'CHECKLIST',
  estatistica:  'VOCÊ SABIA?',
  pergunta:     'PARA REFLETIR',
  caso_real:    'CASO REAL 🚨',
};
```

---

### 1.7 Criar layout de capa específico para `caso_real`

**Arquivo**: `src/app/api/social/image/[id]/route.tsx`

**Mudança**: adicionar função `CoverCasoReal` (logo depois de `CoverEstatistica`):

```typescript
// ─── TEMPLATE: COVER caso_real ───────────────────────────────────────────────
function CoverCasoReal({ title, subtitle, current, total, theme }: {
  title: string; subtitle: string; current: number; total: number; theme: Theme;
}) {
  return (
    <div style={{
      width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
      backgroundImage: `linear-gradient(155deg, ${theme.bg2} 0%, ${theme.bg1} 100%)`,
      fontFamily: 'Poppins', position: 'relative',
    }}>
      {/* Faixa superior vermelha estilo "alerta" */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '12px',
        background: 'linear-gradient(90deg, #dc2626, #f43f5e, #dc2626)',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '60px 60px 0' }}>
        <Logo />
        <div style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.45)',
          borderRadius: '100px', padding: '8px 18px',
        }}>
          <span style={{ fontSize: '14px' }}>🚨</span>
          <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '15px', color: '#fca5a5', letterSpacing: '0.5px' }}>
            CASO REAL
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 60px', gap: '24px' }}>
        {/* Aspas decorativas */}
        <span style={{ fontSize: '140px', lineHeight: 0.6, color: `${theme.accent}55`, fontFamily: 'Poppins', fontWeight: 800 }}>
          "
        </span>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 800,
          fontSize: title.length > 20 ? '68px' : '84px',
          color: WHITE, lineHeight: 1.05, letterSpacing: '-1.5px', marginTop: '-40px',
        }}>
          {title}
        </div>
        <div style={{
          fontFamily: 'Poppins', fontWeight: 400, fontSize: '25px',
          color: 'rgba(255,255,255,0.6)', lineHeight: 1.4, maxWidth: '780px',
        }}>
          {subtitle}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 60px 52px' }}>
        <Dots current={current} total={total} accent={theme.accent} />
        <span style={{ fontFamily: 'Poppins', fontSize: '15px', color: 'rgba(255,255,255,0.4)' }}>Deslize →</span>
      </div>
    </div>
  );
}
```

**Integrar no switch do handler GET** (final do arquivo):
```typescript
if (type === 'cover') {
  if (badge === 'pergunta') {
    jsx = <CoverPergunta ... />;
  } else if (badge === 'mito_verdade') {
    jsx = <CoverMitoVerdade ... />;
  } else if (badge === 'estatistica') {
    jsx = <CoverEstatistica ... />;
  } else if (badge === 'caso_real') {
    jsx = <CoverCasoReal title={title} subtitle={subtitle} current={current} total={total} theme={theme} />;
  } else {
    jsx = <CoverSlide ... />;
  }
}
```

---

### 1.8 Integrar `caso_real` no calendário semanal

**Arquivo**: `src/lib/social/topics.ts`

**Mudança**: no `DAY_OF_WEEK_CALENDAR`, trocar o domingo para caso_real:
```typescript
export const DAY_OF_WEEK_CALENDAR: Record<number, { category: PostCategory; type: PostType }> = {
  0: { category: 'consumidor', type: 'caso_real' },     // Dom — caso real que chocou
  1: { category: 'trabalho',   type: 'dica' },           // Seg — direitos trabalhistas
  2: { category: 'aluguel',    type: 'checklist' },      // Ter — moradia prática
  3: { category: 'consumidor', type: 'mito_verdade' },   // Qua — mitos do CDC
  4: { category: 'digital',    type: 'dica' },           // Qui — contratos digitais
  5: { category: 'geral',      type: 'pergunta' },       // Sex — engajamento
  6: { category: 'aluguel',    type: 'caso_real' },      // Sáb — caso real moradia
};
```

**Validação mental**: sexta já é `geral/pergunta` — vamos manter como engajamento puro.

---

### 1.9 Build + validação da Parte 1

```bash
npm run build
```

Se falhar por erro de tipo, verificar:
- `PostType` em `types.ts` inclui `'caso_real'`
- `generateSocialPost` trata o novo tipo (tem `typeInstructions.caso_real`)
- O badge não é obrigatório em algum `Record<PostType, X>` — se for, preencher

---

## PARTE 2 — Engajamento algorítmico

### 2.1 Adicionar `postFirstComment` no meta-client

**Arquivo**: `src/lib/social/meta-client.ts`

**Mudança**: adicionar esta função logo antes de `isMetaConfigured` (final do arquivo):

```typescript
/**
 * Posta um comentário como a própria conta num post do Instagram.
 * Usado logo após a publicação para hackear o algoritmo:
 * - Gera sinal inicial de conversação
 * - Permite incluir link clicável (caption do IG não tem links)
 * - Aumenta probabilidade de outros comentários
 *
 * Requer que o post já esteja publicado (mediaId retornado pelo publish).
 */
export async function postFirstComment(params: {
  mediaId: string;
  text: string;
}): Promise<MetaPostResult> {
  const { token } = getConfig();

  try {
    const response = await fetch(`${GRAPH_API}/${params.mediaId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        message: params.text,
      }),
    });

    const data = await response.json() as { id?: string; error?: { message: string } };

    if (!response.ok || !data.id) {
      const errorMsg = data.error?.message || `HTTP ${response.status}`;
      console.error('[Social] Erro postFirstComment:', errorMsg);
      return { id: '', success: false, error: errorMsg };
    }

    return { id: data.id, success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    console.error('[Social] Erro postFirstComment:', msg);
    return { id: '', success: false, error: msg };
  }
}
```

---

### 2.2 Integrar `postFirstComment` no orquestrador

**Arquivo**: `src/lib/social/post-orchestrator.ts`

**Mudança A**: importar a função no topo:
```typescript
import { postToThreads, postCarouselToInstagram, postAlbumToFacebook, isMetaConfigured, postFirstComment } from './meta-client';
```

**Mudança B**: adicionar função helper antes de `runSocialPost`:
```typescript
/**
 * Gera texto do primeiro comentário para postar como a própria conta.
 * Objetivo: gerar sinal algorítmico + incluir link clicável.
 */
function buildFirstComment(ctaUrl: string): string {
  const variations = [
    `🛡️ Quer ver se SEU contrato tem cláusula ilegal? Análise em 30s (grátis): ${ctaUrl}\n\nQual cláusula mais absurda VOCÊ já viu? Conta aqui 👇`,
    `🔍 Analisa seu próprio contrato aqui em 30 segundos (grátis, sem cadastro): ${ctaUrl}\n\nJá pegou uma pegadinha num contrato? Comenta aí 💬`,
    `⚖️ Testa seu contrato antes de assinar: ${ctaUrl}\n\nConhece alguém que caiu numa dessas? Marca a pessoa 👇`,
  ];
  return variations[Math.floor(Math.random() * variations.length)]!;
}
```

**Mudança C**: logo após o `Promise.all` que publica (após a linha que loga resultados `if (igResult) console.log...`), adicionar bloco que posta comentário quando IG publicou com sucesso:

```typescript
  // Primeiro comentário automático no IG — hacks de algoritmo
  if (igResult?.success && igResult.id) {
    const ctaUrl = `${APP_URL}?utm_source=instagram&utm_medium=comment&utm_campaign=${topic.key}`;
    const commentText = buildFirstComment(ctaUrl);
    const commentResult = await postFirstComment({ mediaId: igResult.id, text: commentText });
    console.log('[Social] IG first comment:', commentResult.success ? `OK (${commentResult.id})` : `ERRO: ${commentResult.error}`);
  }
```

**Onde colocar EXATAMENTE**: entre o bloco de logs (`if (fbResult) console.log(...)` etc) e o cálculo de `anySuccess`. Isso garante que o comentário roda mesmo se outros canais falharem, mas só se IG funcionou.

**Validação mental**:
- Se `igResult.success === false`, não tenta comentar → OK
- Se Meta demorar pra "disponibilizar" o post, comentário falha com "not found" → OK (já tem try/catch interno, não derruba o fluxo)
- Link no comentário é diferente do link no caption (`medium=comment` vs `medium=carousel`) → permite medir qual converte mais

---

### 2.3 Build + validação da Parte 2

```bash
npm run build
```

Se passar, testar mentalmente:
1. Cron dispara → `runSocialPost` → carrossel gerado → imagens upload → publica FB+IG em paralelo
2. IG retorna `{id: 'xxx', success: true}` → código entra no bloco novo → chama `postFirstComment` → OK
3. Se IG falhar → bloco novo não executa → fluxo continua normal

---

## PARTE 3 — Frequência e datas estratégicas

### 3.1 Reduzir frequência do cron de 5 para 3 posts/semana

**Arquivo**: `src/app/api/cron/social/route.ts`

**Mudança**: trocar o bloco de `shouldPost` por:
```typescript
// Estratégia 3 posts/semana: seg/qua/sex às 22h UTC (19h BRT)
// Horário noturno concentra maior engajamento pré-dormir.
// Reduzido de 5→3 enquanto audiência é baixa (evita desperdício criativo).
if (!force && !dryRun) {
  const now = new Date();
  const hourUtc = now.getUTCHours();
  const dayOfWeek = now.getUTCDay(); // 0=domingo, 6=sábado
  const shouldPost = hourUtc === 22 && [1, 3, 5].includes(dayOfWeek);
  if (!shouldPost) {
    return NextResponse.json({ skipped: true, reason: 'horário não é slot de posting (seg/qua/sex 19h BRT)' });
  }
}
```

**Validação mental**: 
- Cron `vercel.json` roda 12 e 22 UTC diariamente. Com a nova regra, só 22 UTC de seg/qua/sex passa → 3 posts/sem.
- DAY_OF_WEEK_CALENDAR precisa cobrir 1, 3, 5 → hoje cobre, OK.

---

### 3.2 Simplificar cron em `vercel.json`

**Arquivo**: `vercel.json`

**Mudança**: trocar `"schedule": "0 12,22 * * *"` por `"schedule": "0 22 * * 1,3,5"`:
```json
{
  "crons": [
    {
      "path": "/api/cron/social",
      "schedule": "0 22 * * 1,3,5"
    },
    ...
  ]
}
```

**Por quê**: economiza invocações do cron. O filtro dentro do route já garante seg/qua/sex, mas evitar cron disparar todo dia 12 UTC só pra retornar `skipped`.

---

### 3.3 Expandir `SPECIAL_DATES` com 10 datas brasileiras de alto engajamento

**Arquivo**: `src/lib/social/topics.ts`

**Substituir integralmente** o objeto `SPECIAL_DATES` por:
```typescript
export const SPECIAL_DATES: Record<string, { category: PostCategory; type: PostType; hint: string }> = {
  '01-15': { category: 'trabalho',    type: 'dica',         hint: 'Volta das férias coletivas — direitos do trabalhador no retorno: comprovante de gozo, folha de ponto. CLT art. 143.' },
  '02-10': { category: 'digital',     type: 'caso_real',    hint: 'Temporada de Carnaval e golpes digitais de revenda de ingresso: caso real de cláusula "sem reembolso" em app de eventos, que é NULA (CDC art. 35).' },
  '03-08': { category: 'trabalho',    type: 'estatistica',  hint: 'Dia Internacional da Mulher — estatística de desigualdade salarial e direitos da trabalhadora grávida/licença maternidade (CF art. 7º XVIII + CLT 392).' },
  '03-15': { category: 'consumidor',  type: 'dica',         hint: 'Dia Mundial do Consumidor — CDC art. 6º: 7 direitos básicos que todo consumidor tem.' },
  '05-01': { category: 'trabalho',    type: 'estatistica',  hint: 'Dia do Trabalhador — quantos direitos ainda são violados: FGTS não recolhido, horas extras não pagas. Dados do TST.' },
  '05-12': { category: 'trabalho',    type: 'dica',         hint: 'Dia das Mães (semana) — licença maternidade, adaptação de horários, proibição de discriminação. CF art. 7º XVIII + Lei 11.770/08.' },
  '06-12': { category: 'servico',     type: 'caso_real',    hint: 'Dia dos Namorados — contratos de fotografia/restaurante com cláusula de "não reembolso em caso de desistência". Caso real: noiva perdeu R$ 5k. CDC art. 51.' },
  '08-11': { category: 'geral',       type: 'dica',         hint: 'Dia do Advogado — 5 situações em que NÃO dá pra resolver sozinho: herança complexa, contratos > R$ 50k, divórcio litigioso, ações trabalhistas, despejo.' },
  '09-07': { category: 'consumidor',  type: 'mito_verdade', hint: 'Independência do Brasil — "o consumidor brasileiro é o mais protegido do mundo". Verdade parcial: CDC é top 3 mundial, mas execução falha.' },
  '10-12': { category: 'servico',     type: 'checklist',    hint: 'Dia das Crianças — contratos de festa infantil (buffet, animador, fotógrafo): 5 cláusulas que você TEM que olhar antes de assinar.' },
  '10-29': { category: 'digital',     type: 'dica',         hint: 'Dia Mundial da Internet — termos de uso e LGPD: quais dados você cedeu sem saber. Lei 13.709/18.' },
  '11-25': { category: 'consumidor',  type: 'caso_real',    hint: 'Black Friday — caso real de "desconto enganoso" (preço inflado antes, desconto falso). CDC art. 37 + Decreto 5.903/06 exige histórico de preço honesto.' },
  '12-10': { category: 'trabalho',    type: 'checklist',    hint: 'Dezembro — 13º salário, férias coletivas, rescisões de fim de ano. Checklist do que conferir no holerite.' },
};
```

**Validação mental**: 
- Formato `MM-DD` → consistente com o que `pickNextTopic` consome (verificar em `topics.ts`).
- Data inclui tipos novos (`caso_real`) — requer Parte 1 já aplicada.

---

### 3.4 Build + validação da Parte 3

```bash
npm run build
```

Testar mentalmente: em 25/nov cron roda 22 UTC → `shouldPost` passa (é quarta) → `pickNextTopic` consulta SPECIAL_DATES → encontra `11-25` → usa categoria `consumidor` + tipo `caso_real` → conteúdo de Black Friday.

---

## PARTE 4 (OPCIONAL) — Stories automáticas

> **Faça apenas se Partes 1-3 estiverem limpas no build. Se ficar confuso, PULE e documente que não fez.**

### 4.1 Adicionar `postStoryToInstagram` no meta-client

**Arquivo**: `src/lib/social/meta-client.ts`

**Adicionar função** (antes de `isMetaConfigured`):
```typescript
/**
 * Publica um Story no Instagram Business.
 * Story reaproveita capa do carrossel — posta 24h depois, gera alcance extra.
 */
export async function postStoryToInstagram(params: {
  imageUrl: string;
}): Promise<MetaPostResult> {
  const { token, igUserId } = getConfig();
  if (!igUserId) return { id: '', success: false, error: 'META_IG_USER_ID não configurado' };

  try {
    // Etapa 1: Criar container de STORY
    const createRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        access_token: token,
        image_url: params.imageUrl,
        media_type: 'STORIES',
      }),
    });
    const createData = await createRes.json() as { id?: string; error?: { message: string } };
    if (!createRes.ok || !createData.id) {
      return { id: '', success: false, error: createData.error?.message || `HTTP ${createRes.status}` };
    }

    // Etapa 2: Aguardar + publicar
    await new Promise(r => setTimeout(r, 3000));
    const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: token, creation_id: createData.id }),
    });
    const publishData = await publishRes.json() as { id?: string; error?: { message: string } };
    if (publishRes.ok && publishData.id) return { id: publishData.id, success: true };
    return { id: '', success: false, error: publishData.error?.message || `HTTP ${publishRes.status}` };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Erro desconhecido';
    return { id: '', success: false, error: msg };
  }
}
```

### 4.2 Salvar URL da capa no estado

**Arquivo**: `src/lib/social/state.ts`

**Adicionar** 2 funções (seguir padrão das existentes `getLastType`, `recordPost`):
```typescript
export async function recordLastCoverUrl(url: string): Promise<void> {
  // implementar com mesmo padrão de app_config das outras funções
}

export async function getLastCoverUrl(): Promise<string | null> {
  // implementar com mesmo padrão de app_config das outras funções
}
```
**Observação**: ler `state.ts` antes de implementar — seguir o padrão exato que já existe lá. Se não conseguir encaixar limpo, PULE esta parte (4.2 + 4.3 + 4.4).

### 4.3 Criar cron `/api/cron/social-story`
Rota nova que chama `getLastCoverUrl` + `postStoryToInstagram`.

### 4.4 Registrar cron em `vercel.json`
Adicionar:
```json
{ "path": "/api/cron/social-story", "schedule": "0 14 * * 2,4,6" }
```
(14 UTC = 11h BRT, terça/quinta/sábado — 24-36h depois de cada post principal)

---

## COMMIT FINAL

Após build limpo de TODAS as partes:

```bash
git add -A
git status  # conferir arquivos modificados
npm run build  # build final
```

Se build passar, apresentar ao usuário a mensagem de commit sugerida ANTES de commitar:
```
Social V3: conteúdo viral + engajamento algorítmico + calendário estratégico

- Novo tipo de post "caso_real" com layout de capa dedicado
- CAROUSEL_SYSTEM_PROMPT reescrito: ganchos virais, 3-5 slides, CTA save/marca
- Primeiro comentário automático no IG (sinal algorítmico + link clicável)
- Frequência reduzida 5→3 posts/semana (seg/qua/sex 19h BRT)
- SPECIAL_DATES expandidas: 6 → 13 datas brasileiras de alto engajamento
- [Parte 4 se fez: Stories automáticas 24h após carrossel]
```

**NÃO COMMITAR SEM PERMISSÃO EXPLÍCITA DO USUÁRIO.**

---

## CHECKLIST FINAL DE VALIDAÇÃO (o Sonnet responde ao usuário)

Ao final, responder ao usuário em formato:
```
✅ Parte 1 — Conteúdo viral: OK (ou FALHOU em X)
✅ Parte 2 — Engajamento algorítmico: OK
✅ Parte 3 — Frequência + datas: OK
☐ Parte 4 — Stories: PULADA (ou OK, ou FALHOU em X)

Build final: PASSOU (ou FALHOU)
Arquivos modificados: N arquivos
Mensagem de commit sugerida acima.
Aguardando autorização para commit.
```

---

## ANEXO — O que NÃO fazer

- ❌ NÃO mexer em `src/app/api/social/image/[id]/route.tsx` além de (1.6 BADGE_MAP) e (1.7 CoverCasoReal + integração). O arquivo foi recém-refatorado com 7 temas de cor.
- ❌ NÃO mudar `hashtag-optimizer.ts` — hashtags já estão boas.
- ❌ NÃO mexer em `generateSocialPost` além do `typeInstructions` (1.5) — a função não é chamada no fluxo atual, está lá pra compatibilidade.
- ❌ NÃO tocar em Reels (`src/lib/reels/`) — é outra sprint, fora do escopo.
- ❌ NÃO adicionar dependências npm novas.
- ❌ NÃO criar arquivos markdown de documentação extras.
