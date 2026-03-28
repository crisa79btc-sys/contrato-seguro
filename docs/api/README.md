# ContratoSeguro - Contratos de API

Documentacao completa de todas as API Routes do projeto ContratoSeguro.

**Stack:** Next.js 14+ App Router, TypeScript, Supabase, Claude API (Anthropic), Inngest, Mercado Pago.

**Nota sobre a Beta:** Na versao beta, billing esta desativado via feature flag (`BILLING_ENABLED=false`). Todas as funcionalidades sao gratuitas. As rotas de pagamento estao preparadas mas inativas.

---

## Indice

1. [POST /api/upload](#post-apiupload)
2. [POST /api/analyze](#post-apianalyze)
3. [GET /api/analysis/[id]](#get-apianalysisid)
4. [POST /api/correct](#post-apicorrect)
5. [GET /api/correction/[id]](#get-apicorrectionid)
6. [POST /api/generate-doc](#post-apigenerate-doc)
7. [POST /api/payment/create](#post-apipaymentcreate)
8. [POST /api/payment/webhook](#post-apipaymentwebhook)
9. [GET /api/contract/[id]/status](#get-apicontractidstatus)

---

## POST /api/upload

Upload de contrato para analise.

### Descricao

Recebe um arquivo de contrato (PDF ou DOCX) via FormData, valida tipo e tamanho, extrai o texto, armazena o arquivo no Supabase Storage e cria um registro inicial na tabela `contracts`. Em seguida, dispara um job de classificacao em background via Inngest.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Content-Type   | multipart/form-data       | Sim         |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Body (FormData):**

| Campo | Tipo | Descricao                        | Obrigatorio |
| ----- | ---- | -------------------------------- | ----------- |
| file  | File | Arquivo PDF ou DOCX, max 10 MB  | Sim         |

### Validacoes

1. **Tipo MIME real**: Verifica magic bytes do arquivo (nao confia apenas no Content-Type).
   - PDF: bytes iniciais `%PDF`
   - DOCX: bytes iniciais `PK` (ZIP com estrutura Office Open XML)
2. **Tamanho maximo**: 10 MB (configuravel via `MAX_UPLOAD_SIZE_MB`).
3. **Rate limiting**: Maximo de uploads por hora (configuravel via `RATE_LIMIT_UPLOADS_PER_HOUR`).

### Fluxo interno

1. Valida autenticacao (Supabase Auth).
2. Extrai arquivo do FormData.
3. Verifica magic bytes para tipo real.
4. Verifica tamanho do arquivo.
5. Faz parsing do texto com `pdf-parse` (PDF) ou `mammoth` (DOCX).
6. Faz upload do arquivo para Supabase Storage (bucket `contracts`).
7. Cria registro na tabela `contracts` com `status: "uploaded"`.
8. Dispara evento `contract/uploaded` no Inngest para classificacao.
9. Retorna resposta.

### Response

**200 OK**

```json
{
  "contractId": "uuid-do-contrato",
  "fileName": "contrato-aluguel.pdf",
  "fileSize": 245760,
  "status": "uploaded"
}
```

### Erros

| Status | Codigo              | Descricao                                        |
| ------ | ------------------- | ------------------------------------------------ |
| 400    | INVALID_FILE_TYPE   | Tipo de arquivo nao suportado (apenas PDF/DOCX)  |
| 400    | FILE_TOO_LARGE      | Arquivo excede o limite de 10 MB                 |
| 400    | EMPTY_FILE          | Arquivo vazio ou sem texto extraivel             |
| 401    | UNAUTHORIZED        | Token de autenticacao ausente ou invalido        |
| 429    | RATE_LIMIT_EXCEEDED | Limite de uploads por hora excedido              |
| 500    | UPLOAD_FAILED       | Erro interno ao processar upload                 |

**Formato de erro padrao:**

```json
{
  "error": "Apenas arquivos PDF e DOCX sao aceitos.",
  "code": "INVALID_FILE_TYPE"
}
```

### Notas de implementacao

- O parsing de texto e feito no momento do upload para evitar reprocessamento.
- O texto extraido e salvo na coluna `extracted_text` da tabela `contracts`.
- O job de classificacao identifica o tipo de contrato (aluguel, trabalho, prestacao de servicos, etc.) usando Claude Haiku.
- O arquivo original e armazenado criptografado no Supabase Storage.

---

## POST /api/analyze

Dispara analise de um contrato ja carregado.

### Descricao

Inicia o processo de analise de um contrato, identificando clausulas abusivas, riscos e oportunidades. O processamento e feito em background via Inngest e o resultado e entregue via Supabase Realtime ou polling.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Content-Type   | application/json          | Sim         |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Body:**

```json
{
  "contractId": "uuid-do-contrato",
  "tier": "free"
}
```

| Campo      | Tipo                  | Descricao                                    | Obrigatorio |
| ---------- | --------------------- | -------------------------------------------- | ----------- |
| contractId | string (UUID)         | ID do contrato a ser analisado               | Sim         |
| tier       | `"free"` \| `"full"` | Nivel de analise (gratuita ou completa)       | Sim         |

### Validacoes

1. Contrato deve existir na base.
2. Status do contrato deve ser `"uploaded"`, `"classified"` ou `"analyzed"` (permite reanalisar).
3. Se `BILLING_ENABLED=true` e `tier="full"`, verifica se ha pagamento confirmado.
4. Rate limiting por usuario.

### Response

**202 Accepted**

```json
{
  "analysisId": "uuid-da-analise",
  "status": "processing"
}
```

### Entrega do resultado

O resultado da analise e entregue de duas formas:

1. **Supabase Realtime** (preferido): O frontend faz subscribe na tabela `analyses` filtrando por `contract_id`. Quando a analise e concluida, o registro e atualizado com `status: "completed"` e os dados da analise.
2. **Polling**: GET `/api/contract/[id]/status` a cada 3 segundos.

Consulte a [documentacao de Realtime](./realtime.md) para detalhes de integracao.

### Erros

| Status | Codigo                | Descricao                                        |
| ------ | --------------------- | ------------------------------------------------ |
| 400    | CONTRACT_NOT_FOUND    | Contrato nao encontrado                          |
| 400    | INVALID_STATUS        | Contrato nao esta em status valido para analise  |
| 401    | UNAUTHORIZED          | Token de autenticacao ausente ou invalido        |
| 402    | PAYMENT_REQUIRED      | Billing ativo e sem pagamento para tier "full"   |
| 429    | RATE_LIMIT_EXCEEDED   | Limite de analises excedido                      |
| 500    | ANALYSIS_FAILED       | Erro interno ao iniciar analise                  |

### Notas de implementacao

- Na beta, `tier` sempre se comporta como "free" independente do valor enviado (billing desativado).
- O job Inngest usa Claude Haiku (`AI_MODEL_ANALYSIS`) com `AI_MAX_TOKENS_ANALYSIS` tokens.
- O prompt de analise identifica: clausulas abusivas, riscos, score de seguranca (0-100), sugestoes.
- O resultado e salvo na tabela `analyses` vinculado ao `contract_id`.

---

## GET /api/analysis/[id]

Retorna o resultado de uma analise.

### Descricao

Busca e retorna os dados de uma analise especifica. O conteudo retornado varia conforme o tier da analise.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Path params:**

| Param | Tipo          | Descricao          |
| ----- | ------------- | ------------------ |
| id    | string (UUID) | ID da analise      |

### Response

**200 OK - Tier "free"**

```json
{
  "id": "uuid-da-analise",
  "contractId": "uuid-do-contrato",
  "status": "completed",
  "tier": "free",
  "score": 72,
  "totalIssues": 8,
  "topClauses": [
    {
      "title": "Clausula de rescisao unilateral",
      "severity": "high",
      "summary": "Permite que o locador rescinda sem aviso previo de 30 dias."
    },
    {
      "title": "Multa desproporcional",
      "severity": "high",
      "summary": "Multa de 6 meses por quebra de contrato excede o razoavel."
    },
    {
      "title": "Reajuste sem indice definido",
      "severity": "medium",
      "summary": "Nao especifica o indice de reajuste anual (IGPM, IPCA, etc.)."
    }
  ],
  "upgradeAvailable": true
}
```

**200 OK - Tier "full"**

```json
{
  "id": "uuid-da-analise",
  "contractId": "uuid-do-contrato",
  "status": "completed",
  "tier": "full",
  "score": 72,
  "totalIssues": 8,
  "clauses": [
    {
      "id": "clause-1",
      "title": "Clausula de rescisao unilateral",
      "severity": "high",
      "category": "rescisao",
      "originalText": "O locador podera rescindir...",
      "analysis": "Esta clausula e potencialmente abusiva pois...",
      "recommendation": "Incluir aviso previo minimo de 30 dias...",
      "legalBasis": "Art. 4 da Lei 8.245/91 (Lei do Inquilinato)"
    }
  ],
  "summary": "O contrato apresenta 3 clausulas de alto risco...",
  "recommendations": [
    "Negociar clausula de rescisao...",
    "Definir indice de reajuste..."
  ]
}
```

### Erros

| Status | Codigo             | Descricao                                  |
| ------ | ------------------ | ------------------------------------------ |
| 401    | UNAUTHORIZED       | Token de autenticacao ausente ou invalido  |
| 403    | FORBIDDEN          | Analise pertence a outro usuario           |
| 404    | NOT_FOUND          | Analise nao encontrada                     |

### Notas de implementacao

- A resposta do tier "free" inclui apenas score, total de problemas encontrados e os 3 mais criticos.
- O campo `upgradeAvailable` indica se o usuario pode fazer upgrade para analise completa.
- Na beta, `upgradeAvailable` sempre retorna `true` e a analise completa e gratuita.

---

## POST /api/correct

Dispara a correcao automatica de um contrato.

### Descricao

Gera uma versao corrigida do contrato, com sugestoes de alteracao para cada clausula problematica encontrada na analise. Requer que uma analise completa (tier "full") tenha sido feita previamente.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Content-Type   | application/json          | Sim         |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Body:**

```json
{
  "contractId": "uuid-do-contrato"
}
```

| Campo      | Tipo          | Descricao                         | Obrigatorio |
| ---------- | ------------- | --------------------------------- | ----------- |
| contractId | string (UUID) | ID do contrato a ser corrigido    | Sim         |

### Response

**202 Accepted**

```json
{
  "correctionId": "uuid-da-correcao",
  "status": "processing"
}
```

### Erros

| Status | Codigo              | Descricao                                        |
| ------ | ------------------- | ------------------------------------------------ |
| 400    | NO_ANALYSIS         | Contrato nao possui analise completa             |
| 400    | CONTRACT_NOT_FOUND  | Contrato nao encontrado                          |
| 401    | UNAUTHORIZED        | Token de autenticacao ausente ou invalido        |
| 402    | PAYMENT_REQUIRED    | Billing ativo e sem pagamento para correcao      |
| 429    | RATE_LIMIT_EXCEEDED | Limite de requisicoes excedido                   |
| 500    | CORRECTION_FAILED   | Erro interno ao iniciar correcao                 |

### Notas de implementacao

- O job Inngest usa Claude Haiku (`AI_MODEL_CORRECTION`) com `AI_MAX_TOKENS_CORRECTION` tokens (8192).
- Gera: texto corrigido, diff entre original e corrigido, script de negociacao.
- O resultado e entregue via Supabase Realtime (tabela `corrected_contracts`) ou polling.
- Na beta, correcao e gratuita (billing desativado).

---

## GET /api/correction/[id]

Retorna o resultado de uma correcao.

### Descricao

Busca e retorna os dados de uma correcao especifica, incluindo o texto corrigido, diff e script de negociacao.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Path params:**

| Param | Tipo          | Descricao          |
| ----- | ------------- | ------------------ |
| id    | string (UUID) | ID da correcao     |

### Response

**200 OK**

```json
{
  "id": "uuid-da-correcao",
  "contractId": "uuid-do-contrato",
  "status": "completed",
  "correctedText": "Texto completo do contrato corrigido...",
  "changes": [
    {
      "clauseId": "clause-1",
      "original": "O locador podera rescindir o contrato a qualquer momento.",
      "corrected": "O locador podera rescindir o contrato mediante aviso previo de 30 dias, conforme Art. 4 da Lei 8.245/91.",
      "reason": "Adicionado prazo de aviso previo conforme legislacao vigente."
    }
  ],
  "negotiationScript": {
    "introduction": "Ao conversar com a outra parte sobre as alteracoes...",
    "points": [
      {
        "topic": "Clausula de rescisao",
        "argument": "A lei garante aviso previo de 30 dias...",
        "tone": "assertive"
      }
    ],
    "closing": "Lembre-se de manter um tom cordial..."
  },
  "createdAt": "2026-03-28T10:30:00Z"
}
```

### Erros

| Status | Codigo        | Descricao                                  |
| ------ | ------------- | ------------------------------------------ |
| 401    | UNAUTHORIZED  | Token de autenticacao ausente ou invalido  |
| 403    | FORBIDDEN     | Correcao pertence a outro usuario          |
| 404    | NOT_FOUND     | Correcao nao encontrada                    |

---

## POST /api/generate-doc

Gera documento para download.

### Descricao

Gera uma versao do contrato corrigido em formato DOCX ou PDF para download. Retorna uma URL temporaria (valida por 1 hora) para o arquivo gerado.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Content-Type   | application/json          | Sim         |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Body:**

```json
{
  "contractId": "uuid-do-contrato",
  "format": "docx"
}
```

| Campo      | Tipo                   | Descricao                        | Obrigatorio |
| ---------- | ---------------------- | -------------------------------- | ----------- |
| contractId | string (UUID)          | ID do contrato                   | Sim         |
| format     | `"docx"` \| `"pdf"`   | Formato do documento gerado      | Sim         |

### Response

**200 OK**

```json
{
  "downloadUrl": "https://xxx.supabase.co/storage/v1/object/sign/corrected-contracts/...",
  "expires_at": "2026-03-28T11:30:00Z"
}
```

### Erros

| Status | Codigo             | Descricao                                  |
| ------ | ------------------ | ------------------------------------------ |
| 400    | INVALID_FORMAT     | Formato invalido (apenas docx ou pdf)      |
| 400    | NO_CORRECTION      | Contrato nao possui correcao               |
| 401    | UNAUTHORIZED       | Token de autenticacao ausente ou invalido  |
| 404    | NOT_FOUND          | Contrato nao encontrado                    |
| 500    | GENERATION_FAILED  | Erro ao gerar documento                    |

### Notas de implementacao

- Usa a lib `docx` para gerar DOCX e `pdf-lib` para gerar PDF.
- O arquivo gerado e salvo temporariamente no Supabase Storage (bucket `corrected-contracts`).
- A URL assinada expira em 1 hora.
- Inclui marca d'agua "Gerado por ContratoSeguro" no rodape.

---

## POST /api/payment/create

> **Status: Preparado, inativo na beta.** Retorna 503 quando `BILLING_ENABLED=false`.

Cria uma preferencia de pagamento no Mercado Pago.

### Descricao

Inicia o fluxo de pagamento para um produto (analise completa, contrato corrigido, pacote completo ou template). Cria uma preferencia no Mercado Pago e retorna a URL de checkout.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Content-Type   | application/json          | Sim         |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Body:**

```json
{
  "contractId": "uuid-do-contrato",
  "product": "full_analysis"
}
```

| Campo      | Tipo                                          | Descricao                     | Obrigatorio |
| ---------- | --------------------------------------------- | ----------------------------- | ----------- |
| contractId | string (UUID)                                 | ID do contrato                | Sim         |
| product    | `"full_analysis"` \| `"corrected_contract"` \| `"complete_package"` \| `"template"` | Produto a ser comprado   | Sim         |

### Response

**200 OK**

```json
{
  "paymentUrl": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=...",
  "paymentId": "uuid-do-pagamento"
}
```

### Erros

| Status | Codigo             | Descricao                                  |
| ------ | ------------------ | ------------------------------------------ |
| 400    | INVALID_PRODUCT    | Produto invalido                           |
| 401    | UNAUTHORIZED       | Token de autenticacao ausente ou invalido  |
| 404    | NOT_FOUND          | Contrato nao encontrado                    |
| 503    | BILLING_DISABLED   | Billing desativado na versao beta          |

### Notas de implementacao

- Verifica `BILLING_ENABLED` antes de processar.
- Cria registro na tabela `payments` com status `"pending"`.
- URLs de callback: success, failure, pending apontam para paginas do app.
- Na beta, retorna erro 503 com mensagem amigavel.

---

## POST /api/payment/webhook

> **Status: Preparado, inativo na beta.** Retorna 200 (ACK) mas nao processa quando `BILLING_ENABLED=false`.

Recebe notificacoes do Mercado Pago.

### Descricao

Endpoint chamado pelo Mercado Pago para notificar sobre mudancas no status de pagamento. Valida a assinatura do webhook, atualiza o status na base e libera acesso ao produto comprado.

### Request

**Headers:**

| Header                        | Valor              | Obrigatorio |
| ----------------------------- | ------------------ | ----------- |
| Content-Type                  | application/json   | Sim         |
| x-signature                   | assinatura HMAC    | Sim         |

**Body (enviado pelo Mercado Pago):**

```json
{
  "action": "payment.updated",
  "data": {
    "id": "12345678"
  },
  "type": "payment"
}
```

### Response

**200 OK**

```json
{
  "received": true
}
```

### Fluxo interno

1. Valida assinatura HMAC usando `MERCADO_PAGO_WEBHOOK_SECRET`.
2. Busca detalhes do pagamento na API do Mercado Pago.
3. Atualiza registro na tabela `payments`.
4. Se pagamento aprovado, atualiza `contracts` para liberar o produto.
5. Retorna 200 (sempre, mesmo em erro, para evitar retentativas desnecessarias do MP).

### Erros

Nao retorna erros HTTP para o Mercado Pago (sempre 200). Erros sao logados internamente.

### Notas de implementacao

- Sempre retorna 200 para o Mercado Pago para evitar retentativas.
- Erros sao logados no Sentry (se configurado).
- Na beta, recebe a requisicao e retorna 200 sem processar.
- Webhook deve ser registrado no painel do Mercado Pago apontando para `{APP_URL}/api/payment/webhook`.

---

## GET /api/contract/[id]/status

Endpoint de polling para verificar status do processamento.

### Descricao

Alternativa ao Supabase Realtime para clientes que preferem polling. Retorna o status atual do contrato e, quando disponivel, o progresso e resultado parcial.

### Request

**Headers:**

| Header         | Valor                     | Obrigatorio |
| -------------- | ------------------------- | ----------- |
| Authorization  | Bearer {supabase_token}   | Sim         |

**Path params:**

| Param | Tipo          | Descricao          |
| ----- | ------------- | ------------------ |
| id    | string (UUID) | ID do contrato     |

### Response

**200 OK - Em processamento**

```json
{
  "contractId": "uuid-do-contrato",
  "status": "analyzing",
  "progress": 65,
  "currentStep": "Analisando clausulas de rescisao..."
}
```

**200 OK - Concluido**

```json
{
  "contractId": "uuid-do-contrato",
  "status": "analyzed",
  "progress": 100,
  "result": {
    "analysisId": "uuid-da-analise",
    "score": 72
  }
}
```

### Status possiveis

| Status       | Descricao                              |
| ------------ | -------------------------------------- |
| uploaded     | Contrato carregado, aguardando acao    |
| classifying  | Classificacao em andamento             |
| classified   | Classificacao concluida                |
| analyzing    | Analise em andamento                   |
| analyzed     | Analise concluida                      |
| correcting   | Correcao em andamento                  |
| corrected    | Correcao concluida                     |
| error        | Erro no processamento                  |

### Erros

| Status | Codigo        | Descricao                                  |
| ------ | ------------- | ------------------------------------------ |
| 401    | UNAUTHORIZED  | Token de autenticacao ausente ou invalido  |
| 403    | FORBIDDEN     | Contrato pertence a outro usuario          |
| 404    | NOT_FOUND     | Contrato nao encontrado                    |

### Notas de implementacao

- Recomendado polling a cada 3 segundos.
- Preferir Supabase Realtime quando possivel (menor latencia, menos requisicoes).
- O campo `progress` e uma estimativa (0-100) e pode nao ser linear.
- O campo `currentStep` e uma mensagem legivel para exibir ao usuario.

---

## Padroes gerais

### Autenticacao

Todas as rotas (exceto webhook) requerem autenticacao via Supabase Auth. O token JWT deve ser enviado no header `Authorization: Bearer {token}`.

### Formato de erro padrao

Todos os erros seguem o formato flat (nao aninhado), consistente com `ErrorResponse` em `types/api.ts`:

```json
{
  "error": "Descricao legivel do erro.",
  "code": "ERROR_CODE",
  "details": "Informacoes adicionais opcionais."
}
```

### Rate limiting

Rate limiting e implementado por usuario autenticado (IP para usuarios anonimos):

| Recurso              | Limite padrao       | Configuracao                     |
| -------------------- | ------------------- | -------------------------------- |
| Uploads por hora     | 10                  | `RATE_LIMIT_UPLOADS_PER_HOUR`   |
| Analises por mes     | 999 (beta)          | `RATE_LIMIT_ANALYSES_PER_MONTH` |

Quando o limite e atingido, a resposta inclui headers:

```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1711612800
Retry-After: 3600
```

### Validacao

Todas as entradas sao validadas com Zod. Erros de validacao retornam status 400 com detalhes dos campos invalidos.

### CORS

As rotas aceitam apenas requisicoes da origem configurada em `NEXT_PUBLIC_APP_URL`.

### Seguranca

- Arquivos de contrato sao criptografados em repouso.
- Textos extraidos sao deletados apos `CONTRACT_EXPIRY_DAYS` dias.
- Logs nao registram conteudo de contratos, apenas metadados.
- Comunicacao entre servicos usa HTTPS.
