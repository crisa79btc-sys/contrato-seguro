# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

**ContratoSeguro** — Plataforma SaaS de análise e correção de contratos com IA, focada no mercado brasileiro.

## Idioma

- Comunicação com o desenvolvedor deve ser feita em **português brasileiro**.
- Código-fonte, commits e documentação técnica podem ser em inglês ou português, conforme o padrão adotado pelo projeto.

## Stack

- **Frontend:** Next.js 14.2 (App Router), TypeScript, Tailwind CSS 3.4
- **Backend:** Next.js API Routes + `waitUntil()` do `@vercel/functions` para background processing
- **IA:** Claude API (Anthropic) — **Haiku para análise/correção de contratos e posts sociais**, Sonnet/Opus apenas para geração de código
- **Parsing:** pdf-parse (PDF) + Claude Vision (OCR para escaneados/imagens)
- **Geração Docs:** docx (npm) + pdf-lib (sem Puppeteer)
- **Pagamento:** Mercado Pago — backend pronto, billing desligado na beta
- **Banco:** Supabase (PostgreSQL) com schema 001 normalizado. Store adapta queries para tabelas separadas.
- **Social Media:** Meta Graph API (Facebook + Instagram) + Vercel Cron + Claude para conteúdo
- **Deploy:** Vercel (contrato-seguro-inky.vercel.app) + Supabase (wdsfemqjwgdfrqedvqyh)

## Modelo de Negócio

- **Beta (atual):** tudo gratuito, sem cobrança. Feature flag `BILLING_ENABLED=false`.
- **Produção (futuro):** análise prévia SEMPRE gratuita. Cobrança apenas no download do contrato corrigido.
- Preço dinâmico: calculado sobre custo real de tokens × multiplicador configurável.
- Receita vem do volume de uso, preço baixo por download.

## Comandos

```bash
npm install          # Instalar dependências
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run lint         # Verificar ESLint
npm run format       # Formatar com Prettier
npm test             # Testes com Vitest
```

## Estrutura do Código (estado atual)

```
src/
  app/
    page.tsx                        # Landing page com upload
    layout.tsx                      # Layout global (pt-BR, metadata SEO)
    analise/[id]/page.tsx           # Resultado da análise (polling + exibição)
    analise/[id]/layout.tsx         # Metadata OG dinâmica para compartilhamento
    analise/[id]/opengraph-image.tsx # Imagem OG gerada para previews sociais
    sitemap.ts                      # Sitemap XML para Google
    robots.ts                       # robots.txt para crawlers
    manifest.ts                     # PWA manifest
    api/
      upload/route.ts               # POST: recebe PDF/JPG/PNG, parseia, dispara análise
      contract/[id]/status/route.ts  # GET: polling do status da análise
      contract/[id]/report/route.ts  # GET: download do relatório em PDF
      contract/[id]/correct/route.ts # POST: dispara correção em background
      contract/[id]/download/route.ts # GET: download DOCX/PDF corrigido
      payment/create/route.ts        # POST: cria sessão Mercado Pago (Checkout Pro)
      payment/webhook/route.ts       # POST: webhook do Mercado Pago (notificação)
      cron/social/route.ts           # GET: Vercel Cron — post automático redes sociais
      social/image/[id]/route.tsx    # GET: gera imagem 1080x1080 para posts (Edge Runtime)
  components/
    ui/Header.tsx                   # Header com logo
    ui/Footer.tsx                   # Footer com disclaimer
    upload/FileUpload.tsx           # Upload drag-drop + validação (PDF, JPG, PNG, WebP)
    analysis/RiskScore.tsx          # Gauge circular animado do score 0-100
    analysis/IssueCard.tsx          # Card de problema (com modo locked + stagger)
    analysis/ProcessingStatus.tsx   # Tela de espera com progresso
    analysis/ShareButtons.tsx       # Compartilhar WhatsApp + copiar link
    history/RecentAnalyses.tsx      # Histórico local de análises
  lib/
    ai/client.ts                    # Client Anthropic + callClaude()
    ai/classifier.ts                # Classificador de tipo de contrato
    ai/analyzer.ts                  # Analisador (tier free/full)
    ai/corrector.ts                 # Corretor de contratos (Haiku, 16384 tokens, 3min timeout)
    ai/utils.ts                     # safeParseJSON (fallback para JSON malformado)
    parsers/pdf.ts                  # Extração de texto de PDF (com fallback Vision)
    parsers/ocr-vision.ts           # OCR via Claude Vision (imagens e PDFs escaneados)
    parsers/text-cleaner.ts         # Limpeza de texto (paginação, truncamento)
    export/pdf-report.ts            # Geração de relatório PDF da análise
    export/pdf-corrected.ts         # PDF corrigido (Times 12pt, justificado, margens 3cm/2cm)
    export/docx-corrected.ts        # DOCX corrigido (Times 12pt, justificado, 1.5 entrelinhas)
    payment/mercadopago.ts          # Integração Mercado Pago (Checkout Pro, webhook, status)
    social/types.ts                 # Tipos do módulo de automação social
    social/topics.ts                # Banco de 30+ temas + rotação automática
    social/content-generator.ts     # Claude gera posts para redes sociais
    social/meta-client.ts           # Cliente Meta Graph API (Facebook + Instagram)
    social/state.ts                 # Estado da automação social (app_config)
    social/post-orchestrator.ts     # Orquestração: tema → conteúdo → imagem → publicar
    db/supabase.ts                  # Client Supabase (lazy, admin + public)
    store.ts                        # Store dual-mode: Supabase (schema 001 normalizado) ou memória (dev)
    local-history.ts                # Histórico local no localStorage
  config/constants.ts               # Constantes, modelos IA, feature flags
  schemas/upload.schema.ts          # Validação Zod do upload
  schemas/ai-output.schema.ts       # Validação Zod dos outputs da IA
  types/
    database.ts                     # Tipos das tabelas do banco
    api.ts                          # Tipos request/response das APIs
    ai.ts                           # Tipos input/output da IA
    index.ts                        # Re-export centralizado
    pdf-parse.d.ts                  # Declaração de tipos para pdf-parse
docs/
  database/001_initial_schema.sql   # Schema ativo no Supabase (9 tabelas + RLS)
  database/002_beta_simplified.sql  # Schema alternativo (NÃO usado — mantido como referência)
  database/README.md                # Como aplicar migrações
  prompts/system-analyzer.md        # Prompt do analisador (com jurisprudência pacificada)
  prompts/system-classifier.md      # Prompt do classificador
  prompts/system-corrector.md       # Prompt do corretor (com jurisprudência + legal_notes)
  prompts/system-negotiation.md     # Prompt de negociação (não implementado)
  prompts/jurisprudencia-pacificada.md # Base de jurisprudência dos Tribunais Superiores
  api/README.md                     # Documentação das rotas de API
  api/realtime.md                   # Documentação Supabase Realtime
  dependencies.md                   # Lista de dependências com justificativa
```

## Fluxo Atual (MVP Beta)

1. Usuário faz upload de PDF ou imagem (JPG/PNG/WebP) na landing page
2. `POST /api/upload` valida (MIME, magic bytes, tamanho), parseia texto (pdf-parse ou Claude Vision para escaneados/imagens), limpa
3. Contrato salvo no Supabase (ou memória em dev local), análise disparada em background via `waitUntil()`
4. Classificação do tipo (Haiku, 15s timeout) → Análise gratuita (Haiku, 120s timeout)
5. Frontend faz polling em `GET /api/contract/[id]/status` a cada 2s
6. Resultado exibido: score animado + top 3 problemas + total + cards locked
7. Usuário pode: compartilhar (WhatsApp/link), baixar relatório PDF, ver histórico
8. Usuário clica "Corrigir contrato gratuitamente" → `POST /api/contract/[id]/correct`
9. Correção em background (Haiku, 16384 tokens, 3min timeout) → polling detecta conclusão
10. Resultado: cards de alterações + notas jurídicas expandíveis + download DOCX/PDF

### Rotas da API de correção
- `POST /api/contract/[id]/correct` — dispara correção em background, retorna 202
- `GET /api/contract/[id]/download?format=docx|pdf` — download do contrato corrigido (gate por pagamento quando BILLING_ENABLED=true)

### Rotas da API de pagamento (Mercado Pago)
- `POST /api/payment/create` — cria preferência de pagamento (Checkout Pro), retorna paymentUrl
- `POST /api/payment/webhook` — webhook automático do Mercado Pago (notificação de status)
- Quando BILLING_ENABLED=false (beta), `/api/payment/create` retorna `{ free: true }` e download é liberado

## Robustez implementada

- Safe JSON parsing (3 estratégias de fallback para outputs da IA)
- Validação Zod de todos os outputs da IA
- Timeout + retry (2x) nas chamadas Claude
- Error handling granular (classificação pode falhar sem bloquear análise)
- Limpeza de texto (remove paginação PDF, trunca contratos longos)
- OCR via Claude Vision (PDFs escaneados + imagens JPG/PNG/WebP)
- Jurisprudência pacificada integrada nos prompts (STF, STJ, TST)
- Schema Zod da correção tolerante com defaults (campos opcionais não rejeitam)
- top_issues trunca para 3 em vez de rejeitar quando IA retorna mais
- Corretor com fallback: reconstrói JSON se corrected_text existe mas campos secundários falham
- Formatação formal de documentos (Times 12pt, justificado, margens 3cm/2cm, entrelinhas 1.5)
- Detecção inteligente de cláusulas por ordinal (PRIMEIRA, SEGUNDA, etc.)
- SEO completo: sitemap, robots.txt, JSON-LD, Open Graph, Twitter Cards, FAQ structured data
- OG image dinâmica para previews no WhatsApp/Facebook
- PWA manifest (instalável no celular)
- 29 testes unitários (Vitest)

## O que falta para completar a Fase 1

- [x] Deploy na Vercel com variáveis de ambiente (contrato-seguro-inky.vercel.app)
- [x] Testar fluxo end-to-end com API key real
- [x] Configurar Supabase (schema 001 aplicado, store adaptado)
- [x] Google Search Console cadastrado + sitemap submetido
- [ ] Bing Webmaster Tools (Bing fora do ar em 2026-04-05, tentar depois)

## O que está pronto para a Fase 2

- [x] Tipos de pagamento completos (PaymentProduct, PaymentStatus, etc.)
- [x] Integração Mercado Pago: criar preferência + consultar pagamento + mapear status
- [x] API routes: POST /api/payment/create + POST /api/payment/webhook
- [x] Gate de pagamento no download (402 quando BILLING_ENABLED=true e não pagou)
- [x] Feature flag BILLING_ENABLED (false=beta grátis, true=cobra no download)
- [x] Schema SQL com tabela payments + preços em app_config
- [ ] Criar conta Mercado Pago + obter ACCESS_TOKEN de produção
- [ ] Ativar BILLING_ENABLED=true + MERCADOPAGO_ACCESS_TOKEN na Vercel
- [ ] UI de pagamento no frontend (botão "Pagar R$9,90 para baixar")
- [ ] Testar fluxo pagamento → webhook → download

## SEO e Divulgação Digital (implementado)

- Sitemap XML: `/sitemap.xml`
- robots.txt: bloqueia /api/ e /analise/ de indexação
- PWA manifest: app instalável no celular
- Open Graph + Twitter Cards: preview rico ao compartilhar
- JSON-LD: WebApplication + FAQPage (Google Rich Results)
- 14 keywords estratégicas em pt-BR
- OG image dinâmica em /analise/[id]
- Canonical URL configurada

## Automação Social Media (NOVO — implementado, falta configurar Meta)

Sistema de publicação automática em Facebook e Instagram:
- Vercel Cron diário às 9h BRT (12:00 UTC)
- Claude Haiku gera conteúdo educativo sobre contratos (~R$0,01/mês)
- 30+ temas com rotação automática (7 categorias × 5 tipos de post)
- Imagens 1080×1080 geradas via next/og (Edge Runtime)
- Meta Graph API v21.0 para publicação
- Estado persistido no Supabase (app_config)
- Fallback para posts pré-escritos se Claude falhar

### Variáveis de ambiente necessárias (ainda não configuradas)
```env
META_PAGE_ACCESS_TOKEN=    # Token da página Facebook (longa duração)
META_PAGE_ID=              # ID da página Facebook
META_IG_USER_ID=           # ID da conta Business Instagram
CRON_SECRET=               # Gerado automaticamente pelo Vercel
```

### Setup pendente do usuário
1. Criar app em developers.facebook.com
2. Gerar Page Access Token com permissões
3. Conectar Instagram Business
4. Configurar variáveis no Vercel

## Próximas Fases

- **Fase 1.5 (atual):** Configurar Meta Developer + ativar automação social
- **Fase 2:** Ativar Mercado Pago + cobrar pelo download corrigido (backend pronto, falta UI + conta MP)
- **Fase 3:** Tipos especializados + biblioteca de modelos + blog SEO + auth
- **Fase 4:** API pública + testes A/B + otimização de custos

## Regras Importantes

- **Mobile-first.** 70%+ do tráfego brasileiro é mobile.
- **pt-BR em tudo.** Interface, erros, emails — tudo em português brasileiro.
- **NUNCA commitar chaves de API.** Usar `.env.local`.
- **Upload máximo:** 10MB. Aceita PDF, JPG, PNG, WebP.
- **Disclaimer obrigatório** em toda análise: ferramenta informativa, não parecer jurídico.
- **Tracking de tokens:** toda chamada à IA registra tokens_input, tokens_output, model, duração e custo estimado.
- **Prompts sincronizados:** o prompt hardcoded em `src/lib/ai/analyzer.ts` DEVE ser idêntico ao de `docs/prompts/system-analyzer.md`. Ao alterar um, alterar o outro.

## Guardrails Jurídicos (lições aprendidas)

Erros reais detectados em testes que os prompts agora previnem:
- Não inventar erros aritméticos — verificar a conta antes de afirmar
- Não aplicar CDC em contratos B2B entre empresas
- Não chamar de "inválido/nulo" o que é apenas desfavorável
- Veículos: art. 1.267 (tradição), NÃO art. 1.245 (imóveis)
- Reserva de domínio é válida (CC arts. 521-528)
- Classificar severidade proporcionalmente: critical só para nulidades reais
