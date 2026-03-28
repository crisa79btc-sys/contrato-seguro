# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Projeto

**ContratoSeguro** — Plataforma SaaS de análise e correção de contratos com IA, focada no mercado brasileiro.

## Idioma

- Comunicação com o desenvolvedor deve ser feita em **português brasileiro**.
- Código-fonte, commits e documentação técnica podem ser em inglês ou português, conforme o padrão adotado pelo projeto.

## Stack

- **Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes + background jobs (Inngest/Trigger.dev) para processamento pesado
- **IA:** Claude API (Anthropic) — **Haiku para análise/correção de contratos**, Sonnet/Opus apenas para geração de código
- **Parsing:** pdf-parse + mammoth (PDF e DOCX). Sem OCR no MVP.
- **Geração Docs:** docx (npm) + pdf-lib (sem Puppeteer)
- **Pagamento:** Mercado Pago (primário, PIX) — preparado mas desativado na beta
- **Banco:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (bucket privado, signed URLs)
- **Auth:** Supabase Auth
- **Deploy:** Vercel + Supabase

## Modelo de Negócio

- **Beta (atual):** tudo gratuito, sem cobrança. Feature flag `BILLING_ENABLED=false`.
- **Produção (futuro):** análise prévia SEMPRE gratuita. Cobrança apenas no download do contrato corrigido.
- Receita vem do volume de uso, preço baixo por download.
- O preço do download deve cobrir custo de tokens (análise + correção) + margem.

## Decisões Arquiteturais

- **Sem Puppeteer** na Vercel (inviável por tamanho). Usar pdf-lib ou API externa.
- **Sem Tesseract.js** no MVP. OCR futuro via Claude Vision.
- **Background jobs** para processamento de análise (timeout da Vercel é limitado).
- **Modelos econômicos** (Haiku) para toda interação com contratos. Modelos robustos só para programação.
- **Não é necessário** consulta OAB. A plataforma corrige erros e fundamenta juridicamente. Responsabilidade é de quem assina.

## Comandos

```bash
# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Build
npm run build

# Lint
npm run lint

# Testes
npm test
```

## Estrutura Principal

```
src/
  app/              # Páginas (App Router)
  components/       # Componentes React
  lib/
    ai/             # Lógica de análise/correção (usa Haiku)
    parsers/        # Parsing PDF/DOCX
    generators/     # Geração de documentos
    payment/        # Integração pagamento (Mercado Pago)
    db/             # Supabase client
  hooks/            # Custom hooks React
  config/           # Constantes, pricing, feature flags
  schemas/          # Validação com Zod
  middleware.ts     # Rate limiting + auth
prompts/            # Prompts de IA (fora do src/ para não ir no bundle)
```

## Regras Importantes

- **Mobile-first.** 70%+ do tráfego brasileiro é mobile.
- **pt-BR em tudo.** Interface, erros, emails — tudo em português brasileiro.
- **NUNCA commitar chaves de API.** Usar `.env.local`.
- **Criptografar** textos de contratos antes de salvar no banco (AES-256-GCM).
- **Arquivos expiram em 7 dias** (exclusão automática via Supabase).
- **Rate limiting** por IP e por conta.
- **Upload máximo:** 10MB.
- **Disclaimer obrigatório** em toda análise: ferramenta informativa, não parecer jurídico.
