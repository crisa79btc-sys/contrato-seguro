# ContratoSeguro - Dependencias do Projeto

Lista completa de dependencias com versao recomendada e justificativa.

---

## Dependencias de Producao

### Framework e Runtime

| Pacote         | Versao   | Justificativa                                                        |
| -------------- | -------- | -------------------------------------------------------------------- |
| next           | ^14.2    | Framework React com App Router, Server Components e API Routes       |
| react          | ^18.3    | Biblioteca de UI, versao compativel com Next.js 14                   |
| react-dom      | ^18.3    | Renderizacao React para o browser                                    |
| typescript     | ^5.5     | Tipagem estatica para maior seguranca e produtividade no codigo      |

### Estilizacao

| Pacote                      | Versao  | Justificativa                                                  |
| --------------------------- | ------- | -------------------------------------------------------------- |
| tailwindcss                 | ^3.4    | Framework CSS utility-first, rapido para prototipacao e producao |
| @tailwindcss/typography     | ^0.5    | Plugin para estilizacao de conteudo de texto rico (prose)      |

### Supabase (Banco de Dados, Auth, Storage, Realtime)

| Pacote              | Versao  | Justificativa                                                     |
| ------------------- | ------- | ----------------------------------------------------------------- |
| @supabase/supabase-js | ^2.45  | Client SDK do Supabase para acesso ao PostgreSQL, Auth, Storage e Realtime |
| @supabase/ssr       | ^0.4    | Integracao SSR do Supabase com Next.js App Router (cookies, middleware) |

### Inteligencia Artificial

| Pacote              | Versao  | Justificativa                                                 |
| ------------------- | ------- | ------------------------------------------------------------- |
| @anthropic-ai/sdk   | ^0.30   | SDK oficial da Anthropic para acesso ao Claude API (Haiku)    |

### Background Jobs

| Pacote   | Versao  | Justificativa                                                       |
| -------- | ------- | ------------------------------------------------------------------- |
| inngest  | ^3.20   | Orquestracao de jobs em background com retry, eventos e observabilidade |

### Parsing de Documentos

| Pacote     | Versao  | Justificativa                                                   |
| ---------- | ------- | --------------------------------------------------------------- |
| pdf-parse  | ^1.1    | Extracao de texto de arquivos PDF                               |
| mammoth    | ^1.8    | Extracao de texto de arquivos DOCX preservando estrutura        |

### Geracao de Documentos

| Pacote   | Versao  | Justificativa                                                     |
| -------- | ------- | ----------------------------------------------------------------- |
| docx     | ^8.5    | Geracao de arquivos DOCX programaticamente com formatacao completa |
| pdf-lib  | ^1.17   | Geracao e manipulacao de arquivos PDF sem dependencias nativas     |

### Validacao

| Pacote | Versao  | Justificativa                                                        |
| ------ | ------- | -------------------------------------------------------------------- |
| zod    | ^3.23   | Validacao de schemas com inferencia de tipos TypeScript               |

### Pagamento (futuro)

| Pacote      | Versao  | Justificativa                                                   |
| ----------- | ------- | --------------------------------------------------------------- |
| mercadopago | ^2.0    | SDK oficial do Mercado Pago para criacao de pagamentos e webhooks |

### Monitoramento (opcional)

| Pacote          | Versao  | Justificativa                                                     |
| --------------- | ------- | ----------------------------------------------------------------- |
| @sentry/nextjs  | ^8.0    | Monitoramento de erros e performance, integracao nativa com Next.js. Opcional: so necessario se `SENTRY_DSN` estiver configurado |

---

## Dependencias de Desenvolvimento

### Tipos TypeScript

| Pacote        | Versao  | Justificativa                                |
| ------------- | ------- | -------------------------------------------- |
| @types/node   | ^20     | Definicoes de tipo para APIs do Node.js      |
| @types/react  | ^18     | Definicoes de tipo para React                |

### Linting e Formatacao

| Pacote                         | Versao  | Justificativa                                           |
| ------------------------------ | ------- | ------------------------------------------------------- |
| eslint                         | ^8.57   | Linter para identificar problemas no codigo             |
| eslint-config-next             | ^14.2   | Configuracao ESLint oficial do Next.js                  |
| prettier                       | ^3.3    | Formatador de codigo para consistencia no estilo        |
| prettier-plugin-tailwindcss    | ^0.6    | Ordena classes Tailwind automaticamente                 |

### Testes

| Pacote                   | Versao  | Justificativa                                                  |
| ------------------------ | ------- | -------------------------------------------------------------- |
| vitest                   | ^2.0    | Framework de testes unitarios rapido, compativel com Vite/Next |
| @testing-library/react   | ^16.0   | Testes de componentes React focados em comportamento do usuario |

---

## Instalacao

### Dependencias de producao

```bash
npm install next@^14.2 react@^18.3 react-dom@^18.3 typescript@^5.5 \
  tailwindcss@^3.4 @tailwindcss/typography@^0.5 \
  @supabase/supabase-js@^2.45 @supabase/ssr@^0.4 \
  @anthropic-ai/sdk@^0.30 \
  inngest@^3.20 \
  pdf-parse@^1.1 mammoth@^1.8 \
  docx@^8.5 pdf-lib@^1.17 \
  zod@^3.23 \
  mercadopago@^2.0
```

**Opcional (monitoramento):**

```bash
npm install @sentry/nextjs@^8.0
```

### Dependencias de desenvolvimento

```bash
npm install -D @types/node@^20 @types/react@^18 \
  eslint@^8.57 eslint-config-next@^14.2 \
  prettier@^3.3 prettier-plugin-tailwindcss@^0.6 \
  vitest@^2.0 @testing-library/react@^16.0
```

---

## Notas

- **Versoes com `^`**: Permitem atualizacoes de patch e minor automaticamente. Fixe versoes exatas no `package-lock.json`.
- **Mercado Pago**: Incluido desde o inicio para evitar refatoracao futura, mas so sera utilizado quando `BILLING_ENABLED=true`.
- **pdf-parse**: Nao tem tipos TypeScript oficiais. Pode ser necessario criar um arquivo `types/pdf-parse.d.ts` com declaracao de modulo.
- **Inngest**: Requer configuracao de endpoint em `/api/inngest` para receber eventos. Na Vercel, funciona nativamente.
- **Supabase SSR**: Necessario para manter sessao de autenticacao no App Router do Next.js (Server Components, Route Handlers, Middleware).
- **@sentry/nextjs**: Dependencia opcional. Instale apenas se for utilizar monitoramento de erros via Sentry (requer `SENTRY_DSN` no `.env`).
