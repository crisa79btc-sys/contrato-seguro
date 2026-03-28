# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

**ContratoSeguro** — Plataforma SaaS de análise e correção de contratos com IA, focada no mercado brasileiro.

## Idioma

- Comunicação com o desenvolvedor deve ser feita em **português brasileiro**.
- Código-fonte, commits e documentação técnica podem ser em inglês ou português, conforme o padrão adotado pelo projeto.

## Stack

- **Frontend:** Next.js 14.2 (App Router), TypeScript, Tailwind CSS 3.4
- **Backend:** Next.js API Routes (processamento async via Promise, futuro: Inngest)
- **IA:** Claude API (Anthropic) — **Haiku para análise/correção de contratos**, Sonnet/Opus apenas para geração de código
- **Parsing:** pdf-parse (PDF). Sem OCR no MVP.
- **Geração Docs:** docx (npm) + pdf-lib (sem Puppeteer) — ainda não implementado
- **Pagamento:** Mercado Pago — preparado nos tipos, não implementado na beta
- **Banco:** Store em memória (dev local). Futuro: Supabase (PostgreSQL)
- **Deploy:** Vercel + Supabase (pendente)

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
    api/
      upload/route.ts               # POST: recebe PDF, parseia, dispara análise
      contract/[id]/status/route.ts  # GET: polling do status da análise
  components/
    ui/Header.tsx                   # Header com logo
    ui/Footer.tsx                   # Footer com disclaimer
    upload/FileUpload.tsx           # Upload drag-drop + validação
    analysis/RiskScore.tsx          # Gauge circular do score 0-100
    analysis/IssueCard.tsx          # Card de problema (com modo locked)
    analysis/ProcessingStatus.tsx   # Tela de espera com progresso
  lib/
    ai/client.ts                    # Client Anthropic + callClaude()
    ai/classifier.ts                # Classificador de tipo de contrato
    ai/analyzer.ts                  # Analisador (tier free/full)
    parsers/pdf.ts                  # Extração de texto de PDF
    db/supabase.ts                  # Client Supabase (preparado, não usado ainda)
    store.ts                        # Store em memória para dev local
  config/constants.ts               # Constantes, modelos IA, feature flags
  schemas/upload.schema.ts          # Validação Zod do upload
  types/
    database.ts                     # Tipos das tabelas do banco
    api.ts                          # Tipos request/response das APIs
    ai.ts                           # Tipos input/output da IA
    index.ts                        # Re-export centralizado
    pdf-parse.d.ts                  # Declaração de tipos para pdf-parse
docs/
  database/001_initial_schema.sql   # Migração SQL completa (9 tabelas + RLS)
  database/README.md                # Como aplicar migrações
  prompts/system-analyzer.md        # Prompt otimizado do analisador
  prompts/system-classifier.md      # Prompt do classificador
  prompts/system-corrector.md       # Prompt do corretor (não implementado)
  prompts/system-negotiation.md     # Prompt de negociação (não implementado)
  api/README.md                     # Documentação das rotas de API
  api/realtime.md                   # Documentação Supabase Realtime
  types/                            # Cópia de referência dos tipos
  dependencies.md                   # Lista de dependências com justificativa
```

## Fluxo Atual (MVP Beta)

1. Usuário faz upload de PDF na landing page
2. `POST /api/upload` valida (MIME, magic bytes, tamanho), parseia texto
3. Contrato salvo no store em memória, análise disparada em background
4. Classificação do tipo (Haiku) → Análise gratuita (Haiku, tier free)
5. Frontend faz polling em `GET /api/contract/[id]/status` a cada 2s
6. Resultado exibido: score de risco + top 3 problemas + total de issues

## O que falta para completar a Fase 1

- [ ] Configurar Supabase (aplicar SQL, migrar store → banco real)
- [ ] Deploy na Vercel com variáveis de ambiente
- [ ] Testar fluxo end-to-end com API key real

## Próximas Fases

- **Fase 2:** Análise completa paga + contrato corrigido (.docx/.pdf) + Mercado Pago
- **Fase 3:** Tipos especializados + biblioteca de modelos + blog SEO + auth
- **Fase 4:** OCR (Claude Vision) + API pública + testes A/B

## Regras Importantes

- **Mobile-first.** 70%+ do tráfego brasileiro é mobile.
- **pt-BR em tudo.** Interface, erros, emails — tudo em português brasileiro.
- **NUNCA commitar chaves de API.** Usar `.env.local`.
- **Upload máximo:** 10MB, apenas PDF no MVP.
- **Disclaimer obrigatório** em toda análise: ferramenta informativa, não parecer jurídico.
- **Tracking de tokens:** toda chamada à IA registra tokens_input, tokens_output, model, duração e custo estimado.
