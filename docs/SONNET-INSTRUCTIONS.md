# Instruções para o Sonnet — Implementação das 3 Fases

Este documento é o roteiro de execução para o Claude Sonnet completar o que o
Opus deixou como scaffolding. Todos os arquivos e interfaces já estão no lugar;
o Sonnet só precisa preencher o corpo das funções marcadas com `TODO-Sonnet`
e rodar os testes/deploys.

**Importante:** leia antes de começar:
- `C:\Users\crisa\.claude\plans\gentle-orbiting-pancake.md` (plano mestre)
- `CLAUDE.md` (regras do projeto)
- As regras `C:\Users\crisa\.claude\CLAUDE.md` (premissas globais: pt-BR, haiku, sem deploy sem permissão etc.)

## Ordem de execução e autorizações

Cada Sprint tem "checkpoints" que exigem autorização explícita do usuário
antes de prosseguir. NUNCA fazer commit ou push sem pedir permissão.

---

## SPRINT 1 — IA aprende com perguntas (IMPLEMENTAR PRIMEIRO)

### Estado atual (scaffolding pronto)
- `docs/database/005_analyzer_learnings.sql` ✓
- `src/lib/ai/learn-from-chat.ts` ✓ (completo)
- `src/app/api/cron/learn/route.ts` ✓ (completo)
- `src/app/api/admin/learnings/route.ts` ✓ (completo)
- `src/app/api/admin/learnings/[id]/route.ts` ✓ (completo)
- `src/app/admin/learnings/page.tsx` ✓ (completo)
- `vercel.json` com cron `0 3 * * 0` ✓

### O que o Sonnet precisa fazer

1. **Modificar `src/lib/ai/analyzer.ts`** para aceitar `contractType` e injetar
   os learnings aprovados no system prompt:

   ```ts
   // Antes da chamada Claude:
   const { data: learnings } = await admin
     .from('analyzer_learnings')
     .select('pattern')
     .eq('contract_type', contractType)
     .eq('status', 'approved')
     .limit(20);

   const learningBlock = learnings?.length
     ? `\n\n## PADRÕES APRENDIDOS (atenção especial)\n` +
       learnings.map((l, i) => `${i + 1}. ${l.pattern}`).join('\n')
     : '';

   const systemPrompt = BASE_ANALYZER_PROMPT + learningBlock;
   ```

2. **Atualizar `docs/prompts/system-analyzer.md`** com uma seção
   `## PADRÕES APRENDIDOS (atenção especial)` como placeholder — a regra do
   CLAUDE.md exige que `.md` e `.ts` estejam sincronizados.

3. **Aplicar migração SQL no Supabase:**
   - https://supabase.com/dashboard/project/wdsfemqjwgdfrqedvqyh/sql/new
   - Colar conteúdo de `docs/database/005_analyzer_learnings.sql` e rodar

4. **Verificação manual:**
   ```bash
   # Dry run do cron (não insere nada, só mostra o que faria)
   curl "http://localhost:3000/api/cron/learn?dryRun=true" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```
   Depois acessar http://localhost:3000/admin/learnings (senha = `ADMIN_SECRET`)
   e aprovar um padrão.

5. **Rodar `npm run lint && npm test && npm run build`**.

6. **Pedir autorização de commit** ao usuário, mencionando:
   - Arquivos alterados
   - Nova rota `/admin/learnings`
   - Nova cron no vercel.json

---

## SPRINT 2 — Pipeline de Reels (MAIS TRABALHO)

### Estado atual (scaffolding pronto)
| Arquivo | Estado |
|---|---|
| `docs/database/006_reels.sql` | ✓ completo |
| `src/lib/reels/types.ts` | ✓ completo |
| `src/lib/reels/whisper.ts` | ✓ completo (Replicate, polling) |
| `src/lib/reels/transcription-analyzer.ts` | ✓ completo (Claude Haiku) |
| `src/lib/reels/video-processor.ts` | ⚠️ helpers prontos, `processVideo()` TODO |
| `src/lib/reels/thumbnail-generator.ts` | ⚠️ `buildTextSvg()` pronto, `generateThumbnail()` TODO |
| `src/lib/reels/scheduler.ts` | ✓ completo |
| `src/lib/reels/music-library.ts` | ✓ completo (falta arquivos .mp3) |
| `src/lib/reels/hashtag-optimizer.ts` | ✓ completo |
| `src/lib/reels/platforms/instagram.ts` | ✓ completo (4-fase com polling) |
| `src/lib/reels/platforms/facebook.ts` | ✓ completo (fallback hosted video) |
| `src/lib/reels/platforms/youtube.ts` | ⚠️ auth OK, `publishYouTubeShort()` TODO |
| `src/app/api/admin/reels/upload/route.ts` | ✓ completo |
| `src/app/api/admin/reels/queue/route.ts` | ✓ completo |
| `src/app/api/admin/reels/queue/[id]/route.ts` | ✓ completo |
| `src/app/api/reels/process/[id]/route.ts` | ✓ completo (orquestrador) |
| `src/app/api/cron/reels-publish/route.ts` | ✓ completo |
| `src/app/api/cron/reels-metrics/route.ts` | ⚠️ auth OK, fetchers parciais |
| `src/app/admin/reels/upload/page.tsx` | ✓ completo |
| `src/app/admin/reels/queue/page.tsx` | ✓ completo |

### TODOs ordenados

#### 2.1. Aplicar migração 006 + criar buckets

```sql
-- Supabase SQL editor
-- Colar conteúdo de docs/database/006_reels.sql
```

Os buckets (`reels-raw` privado, `reels-ready` público) estão no SQL — se já
existirem, o `INSERT ... ON CONFLICT DO NOTHING` cuida.

#### 2.2. Instalar dependências

```bash
npm install replicate
# googleapis NÃO é necessário — usamos fetch direto para YouTube
# sharp JÁ ESTÁ instalado via Next.js
```

Verificar `package.json` para evitar duplicação.

#### 2.3. Implementar `processVideo()` em `src/lib/reels/video-processor.ts`

A função já tem os helpers prontos (`buildAssSubtitles`, `buildFfmpegCommand`,
`invertCuts`). Falta a chamada Replicate.

**Caminho recomendado — modelo `jigsawstack/ffmpeg` ou custom Cog:**

O Replicate não tem um modelo FFmpeg oficial universal. Opções:

a) **Usar `cjwbw/ffmpeg-compiled` ou similar** — buscar em
   https://replicate.com/explore e filtrar por "ffmpeg". Se existir um que
   aceite `filter_complex`, é plug-and-play.

b) **Criar um Cog próprio** — https://github.com/replicate/cog — ~30min de setup,
   escala infinitamente, custa ~$0.02/reel. Dockerfile simples com
   `RUN apt install ffmpeg`, expõe endpoint que recebe `{videoUrl, filterComplex,
   assSubtitles, musicUrl}` e retorna o mp4 final.

c) **Alternativa sem Replicate — Cloudinary:**
   https://cloudinary.com/documentation/video_manipulation_and_delivery
   Transformações via URL, free tier 25 créditos/mês, um reel = ~1 crédito.
   Já tem FFmpeg server-side.

d) **Alternativa Shotstack:** https://shotstack.io — API declarativa de edição
   de vídeo (JSON → MP4). Free tier 20min/mês. Ideal para este volume.

**Recomendação:** começar por Shotstack (c. mais simples). Se custar demais,
migrar para Cog próprio (c. mais escalável).

Template de implementação:

```ts
import Replicate from 'replicate'; // ou fetch direto

export async function processVideo(input: VideoProcessInput): Promise<VideoProcessResult> {
  const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

  const ass = buildAssSubtitles(input.segments);
  // Subir o ASS para algum storage temporário (Supabase Storage, bucket reels-raw, path tmp/)
  // OU passar inline se o modelo aceitar.

  const filterComplex = buildFfmpegCommand({
    rawInput: '[0]',
    cuts: input.cuts,
    durationTotal: /* calcular a partir de segments */,
    subtitleFile: '/tmp/subs.ass',
    musicInput: '[1]',
  });

  const output = await replicate.run('MODEL_SLUG:VERSION', {
    input: {
      video: input.rawUrl,
      music: input.musicUrl,
      ass_subtitles: /* URL do ASS */,
      filter_complex: filterComplex,
    },
  });

  // Baixar output (URL do Replicate), fazer upload em reels-ready/<outputName>
  const videoBuffer = await fetch(output as string).then(r => r.arrayBuffer());
  const admin = getAdminClient();
  await admin.storage.from('reels-ready').upload(`ready/${input.outputName}`, new Uint8Array(videoBuffer), {
    contentType: 'video/mp4',
    upsert: true,
  });
  const publicUrl = admin.storage.from('reels-ready').getPublicUrl(`ready/${input.outputName}`).data.publicUrl;

  // durationSeconds: usar último segment.end ou metadata do FFmpeg
  return { outputUrl: publicUrl, durationSeconds: /* ... */, sizeBytes: videoBuffer.byteLength };
}
```

#### 2.4. Implementar `generateThumbnail()` em `src/lib/reels/thumbnail-generator.ts`

O SVG (`buildTextSvg`) já está pronto. Falta extrair frame + compor.

**Abordagem mais simples (recomendada):** adicionar uma segunda saída ao
Replicate job do `processVideo` que já gera `frame.jpg` em `$thumbnail_moment`.
Salva uma chamada de API.

**Alternativa standalone:**
```ts
import sharp from 'sharp';

export async function generateThumbnail(params: GenerateThumbnailParams): Promise<GenerateThumbnailResult> {
  // 1. Chamar Replicate/Shotstack com comando:
  //    ffmpeg -ss $MOMENT -i $VIDEO -frames:v 1 -vf scale=1080:1920 frame.jpg
  const frameUrl = await extractFrame(params.readyVideoUrl, params.momentSeconds);
  const frameBuffer = Buffer.from(await fetch(frameUrl).then(r => r.arrayBuffer()));

  // 2. Compor com SVG
  const svg = buildTextSvg(params.text);
  const thumb = await sharp(frameBuffer)
    .resize(1080, 1920, { fit: 'cover' })
    .composite([{ input: Buffer.from(svg), gravity: 'south' }])
    .jpeg({ quality: 90 })
    .toBuffer();

  // 3. Upload
  const path = `thumbs/${params.reelId}.jpg`;
  await params.admin.storage.from('reels-ready').upload(path, thumb, {
    contentType: 'image/jpeg',
    upsert: true,
  });
  const publicUrl = params.admin.storage.from('reels-ready').getPublicUrl(path).data.publicUrl;

  return { storagePath: path, publicUrl };
}
```

#### 2.5. Implementar `publishYouTubeShort()` em `src/lib/reels/platforms/youtube.ts`

Seguir TODO-Sonnet no próprio arquivo. Resumo:

1. `getAccessToken()` (já implementado)
2. Baixar o vídeo de `params.videoUrl` (`arrayBuffer()`)
3. Fase 1: POST para `UPLOAD_URL` com JSON body:
   ```json
   {
     "snippet": {
       "title": "...#Shorts",  // obrigatório ter #Shorts
       "description": "...",
       "tags": [...],
       "categoryId": "22"
     },
     "status": { "privacyStatus": "public", "selfDeclaredMadeForKids": false }
   }
   ```
   Headers: `Authorization: Bearer <access_token>`, `Content-Type: application/json`,
   `X-Upload-Content-Type: video/mp4`, `X-Upload-Content-Length: <bytes>`
   → retorna URL no header `Location`.
4. Fase 2: PUT na URL retornada com o binário. Retorna `{id, snippet, status}`.
5. `platformUrl: https://www.youtube.com/shorts/<id>`

Alternativa mais simples (uploadType=multipart — uma chamada só): ver
https://developers.google.com/youtube/v3/docs/videos/insert

#### 2.6. Baixar 10 trilhas royalty-free para `public/audio/`

Ver `public/audio/README.md`. Fontes gratuitas:
- https://pixabay.com/music/ (licença CC0, sem atribuição obrigatória)
- https://freesound.org/ (CC BY)
- https://www.chosic.com/free-music/all/ (CC BY)

Nomes esperados (conforme `src/lib/reels/music-library.ts`):
- `corporate-serious-1.mp3`
- `corporate-serious-2.mp3`
- `corporate-uplifting-1.mp3`
- `corporate-uplifting-2.mp3`
- `ambient-calm-1.mp3`
- `ambient-calm-2.mp3`
- `ambient-neutral-1.mp3`
- `ambient-neutral-2.mp3`
- `energetic-tech-1.mp3`
- `energetic-tech-2.mp3`

Cada um 30-90s, ~128kbps MP3, volume normalizado. Duração mínima = duração
máxima dos reels (90s). Se a trilha for mais curta, FFmpeg repete com `aloop`.

#### 2.7. Implementar fetchers em `src/app/api/cron/reels-metrics/route.ts`

Os stubs Instagram e YouTube já estão OK. Para Facebook, completar:
```ts
// Views dos videos
const res2 = await fetch(
  `https://graph.facebook.com/v21.0/${videoId}/video_insights?metric=total_video_views&access_token=${token}`
);
```

#### 2.8. Setup externo do usuário (guiar passo-a-passo)

Pedir ao usuário:

a) **Replicate:** https://replicate.com → criar conta → https://replicate.com/account/api-tokens
   → copiar token → adicionar `REPLICATE_API_TOKEN` no Vercel env vars.

b) **YouTube Data API v3:**
   - https://console.cloud.google.com → "New Project" → "ContratoSeguro"
   - https://console.cloud.google.com/apis/library/youtube.googleapis.com → **Enable**
   - https://console.cloud.google.com/apis/credentials → **Create credentials** →
     **OAuth client ID** → **Desktop app** → download JSON
   - Copiar `client_id` → `YOUTUBE_CLIENT_ID` no Vercel
   - Copiar `client_secret` → `YOUTUBE_CLIENT_SECRET` no Vercel
   - Gerar refresh token:
     1. https://developers.google.com/oauthplayground
     2. Settings (⚙ canto direito) → marcar **"Use your own OAuth credentials"** → colar Client ID/Secret
     3. Na lista esquerda, rolar até **YouTube Data API v3** → marcar `https://www.googleapis.com/auth/youtube.upload`
     4. **Authorize APIs** → fazer login com a conta Google que será dona do canal
     5. **Exchange authorization code for tokens** → copiar `refresh_token`
     6. Adicionar `YOUTUBE_REFRESH_TOKEN` no Vercel
   - Para métricas (só leitura): mesmo projeto → **Create credentials** → **API key** →
     copiar → `YOUTUBE_API_KEY`

c) **ADMIN_SECRET:** `openssl rand -hex 32` → adicionar no Vercel env vars.

d) **Meta:** já tem `META_PAGE_ACCESS_TOKEN`, `META_PAGE_ID`, `META_IG_USER_ID`.
   Validar que as permissões `pages_manage_posts` e `instagram_content_publish`
   estão ativas (https://developers.facebook.com/apps → App → App Review → Permissions).

#### 2.9. Teste E2E

1. Gravar vídeo curto no iPhone (30s: "teste contrato seguro")
2. Acessar `/admin/reels/upload` → upload
3. Aguardar ~3min → `/admin/reels/queue` mostra reel `ready`
4. Editar título, clicar **"Publicar agora"**
5. Verificar IG/FB/YT: post apareceu
6. No dia seguinte, checar métricas via cron manual:
   ```bash
   curl "https://contrato-seguro-inky.vercel.app/api/cron/reels-metrics" \
     -H "Authorization: Bearer $CRON_SECRET"
   ```

#### 2.10. Antes de pedir commit, checar

- `npm run lint`
- `npm test`
- `npm run build`
- Atualizar `CLAUDE.md` com as novas rotas e tabelas.

**Pedir autorização de push** mencionando:
- Novas tabelas no Supabase
- Novas crons no vercel.json
- Novas env vars no Vercel
- Novas páginas admin

---

## SPRINT 3 — Domínio (mais rápido)

Seguir 100% o `docs/SPRINT-3-DOMAIN.md`. Executar na ordem:

1. Usuário registra domínio (passo 1)
2. Adicionar no Vercel (passo 2)
3. Configurar DNS (passo 3) — aguardar propagação em paralelo
4. Sonnet atualiza código (passo 5) em local, faz commit
5. Sonnet atualiza env vars do Vercel (passo 6) após autorização
6. Sonnet atualiza Supabase/Google/Meta (passos 7-9)
7. Verificação E2E (passo 11)
8. Pedir autorização de push do código atualizado

---

## Custo esperado para o Sonnet processar tudo

- Sprint 1: ~5k tokens escrita / 10k leitura → R$0,30
- Sprint 2: ~30k tokens escrita / 50k leitura → R$2,00 (mais complexo)
- Sprint 3: ~5k tokens → R$0,20

Total estimado: **~R$2,50** em tokens Sonnet para completar o scaffolding.

## Em caso de dúvida

1. Ler o plano mestre: `C:\Users\crisa\.claude\plans\gentle-orbiting-pancake.md`
2. Nunca decidir arquitetura sem confirmar com o usuário (regra CLAUDE.md global)
3. Nunca fazer `git push` sem autorização explícita
4. Bugs encontrados no caminho: corrigir automaticamente (CLAUDE.md 5.2)
