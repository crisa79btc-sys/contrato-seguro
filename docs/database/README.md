# ContratoSeguro - Migrações do Banco de Dados

## Visão Geral

Este diretório contém os arquivos SQL de migração para o banco de dados do ContratoSeguro, hospedado no **Supabase (PostgreSQL)**.

## Estrutura de Arquivos

```
docs/database/
  001_initial_schema.sql   # Schema inicial completo (tabelas, RLS, funções, seeds)
  README.md                # Este arquivo
```

## Como Aplicar as Migrações

### Opção 1: SQL Editor do Supabase (Recomendado para primeira vez)

1. Acesse o painel do Supabase: https://app.supabase.com
2. Selecione o projeto ContratoSeguro
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo completo do arquivo `001_initial_schema.sql`
6. Clique em **Run** (ou Ctrl+Enter)
7. Verifique se todas as tabelas foram criadas em **Table Editor**

### Opção 2: Supabase CLI (Recomendado para CI/CD)

```bash
# Instalar o Supabase CLI
npm install -g supabase

# Login
supabase login

# Linkar ao projeto (use o ref do seu projeto)
supabase link --project-ref SEU_PROJECT_REF

# Executar a migração diretamente
supabase db push

# Ou, se estiver usando o sistema de migrações nativo:
# Copie o arquivo para supabase/migrations/
cp docs/database/001_initial_schema.sql supabase/migrations/20260328000000_initial_schema.sql
supabase db push
```

### Opção 3: psql (Conexão direta)

```bash
# Obtenha a connection string no Dashboard > Settings > Database
psql "postgresql://postgres.[ref]:[password]@aws-0-sa-east-1.pooler.supabase.com:6543/postgres" \
  -f docs/database/001_initial_schema.sql
```

## O Que a Migração 001 Cria

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `users` | Perfil do usuario (estende `auth.users`) |
| `contracts` | Contratos enviados para analise |
| `analyses` | Resultado consolidado da analise de IA |
| `clause_analyses` | Analise detalhada de cada clausula |
| `corrected_contracts` | Contrato corrigido pela IA |
| `payments` | Pagamentos (inativo na beta) |
| `contract_templates` | Biblioteca de modelos (futuro) |
| `audit_logs` | Logs de auditoria LGPD |
| `app_config` | Feature flags e configuracoes |

### Funcionalidades

- **RLS (Row Level Security)**: Habilitado em todas as tabelas. Cada usuario so acessa seus proprios dados.
- **Trigger `updated_at`**: Atualiza automaticamente o campo `updated_at` em todas as tabelas que o possuem.
- **Auto-criacao de perfil**: Quando um usuario se registra via Supabase Auth, um perfil e criado automaticamente na tabela `users`.
- **Cleanup de expirados**: Funcao `cleanup_expired_contracts()` que remove contratos com mais de 7 dias.
- **Audit logging**: Funcao `log_audit()` para registrar acoes (LGPD).
- **Storage buckets**: Buckets privados para contratos originais, corrigidos e templates.
- **Feature flags**: Tabela `app_config` com configuracoes iniciais da beta.

### Configuracoes Iniciais (app_config)

| Chave | Valor | Descricao |
|-------|-------|-----------|
| `BILLING_ENABLED` | `false` | Cobranca desabilitada na beta |
| `FREE_ANALYSES_LIMIT` | `0` | 0 = ilimitado na beta |
| `FREE_CORRECTIONS_LIMIT` | `0` | 0 = ilimitado na beta |
| `MAX_FILE_SIZE_BYTES` | `10485760` | 10 MB |
| `CONTRACT_EXPIRY_DAYS` | `7` | Dias ate expiracao |
| `DEFAULT_AI_MODEL` | `gpt-4o` | Modelo padrao |
| `TEMPLATES_ENABLED` | `false` | Templates desabilitados |
| `ANONYMOUS_UPLOAD_ENABLED` | `true` | Upload sem login na beta |
| `PRICES` | `{...}` | Tabela de precos em centavos |
| `SCHEMA_VERSION` | `001` | Versao do schema |

## Configurar Cleanup Automatico

### Com pg_cron (planos Pro+ do Supabase)

Habilite a extensao pg_cron no Dashboard (Database > Extensions) e execute:

```sql
SELECT cron.schedule(
  'cleanup-expired-contracts',
  '0 3 * * *',  -- todo dia as 3h da manha
  $$SELECT public.cleanup_expired_contracts()$$
);
```

### Sem pg_cron (plano Free)

Crie uma **Edge Function** no Supabase ou use um servico externo de cron (ex: cron-job.org, GitHub Actions) que faca uma chamada RPC:

```typescript
// Supabase Edge Function (exemplo)
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data, error } = await supabase.rpc('cleanup_expired_contracts')

  return new Response(
    JSON.stringify({ deleted: data, error }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## Proximas Migracoes

Ao criar novas migracoes, siga o padrao de nomenclatura:

```
002_add_notifications.sql
003_add_subscription_tiers.sql
...
```

Cada arquivo deve ser **idempotente** quando possivel (usar `IF NOT EXISTS`, `ON CONFLICT DO NOTHING`, etc.).

## Rollback

O arquivo de migracao nao inclui rollback automatico. Em caso de necessidade, crie um arquivo de rollback manual:

```sql
-- rollback_001.sql
DROP TABLE IF EXISTS public.app_config CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.contract_templates CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.corrected_contracts CASCADE;
DROP TABLE IF EXISTS public.clause_analyses CASCADE;
DROP TABLE IF EXISTS public.analyses CASCADE;
DROP TABLE IF EXISTS public.contracts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.cleanup_expired_contracts();
DROP FUNCTION IF EXISTS public.log_audit();
```

**Atencao**: O rollback apaga TODOS os dados. Use apenas em ambiente de desenvolvimento.
