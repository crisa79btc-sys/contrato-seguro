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
      upload/route.ts               # POST: recebe PDF/JPG/PNG, parseia, dispara análise
      contract/[id]/status/route.ts  # GET: polling do status da análise
      contract/[id]/report/route.ts  # GET: download do relatório em PDF
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
    export/pdf-corrected.ts         # Geração de PDF do contrato corrigido (formatação profissional)
    export/docx-corrected.ts        # Geração de DOCX do contrato corrigido (Word)
    db/supabase.ts                  # Client Supabase (lazy, não usado ainda)
    store.ts                        # Store em memória para dev local
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
  database/001_initial_schema.sql   # Migração SQL completa (9 tabelas + RLS)
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
3. Contrato salvo no store em memória, análise disparada em background
4. Classificação do tipo (Haiku, 15s timeout) → Análise gratuita (Haiku, 120s timeout)
5. Frontend faz polling em `GET /api/contract/[id]/status` a cada 2s
6. Resultado exibido: score animado + top 3 problemas + total + cards locked
7. Usuário pode: compartilhar (WhatsApp/link), baixar relatório PDF, ver histórico
8. Usuário clica "Corrigir contrato gratuitamente" → `POST /api/contract/[id]/correct`
9. Correção em background (Haiku, 16384 tokens, 3min timeout) → polling detecta conclusão
10. Resultado: cards de alterações + notas jurídicas expandíveis + download DOCX/PDF

### Rotas da API de correção
- `POST /api/contract/[id]/correct` — dispara correção em background, retorna 202
- `GET /api/contract/[id]/download?format=docx|pdf` — download do contrato corrigido

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
- 29 testes unitários (Vitest)

## O que falta para completar a Fase 1

- [ ] Configurar Supabase (aplicar SQL, migrar store → banco real)
- [ ] Deploy na Vercel com variáveis de ambiente
- [ ] Testar fluxo end-to-end com API key real

## Próximas Fases

- **Fase 2:** Análise completa paga + Mercado Pago (correção já implementada na beta)
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
