# Configurar Supabase (5 minutos)

## Passo 1: Criar conta e projeto

1. Abrir https://supabase.com e clicar "Start your project"
2. Fazer login com GitHub (a conta `crisa79btc-sys` serve)
3. Clicar "New Project"
4. Configurar:
   - **Name:** contrato-seguro
   - **Database Password:** gerar uma senha forte (anotar!)
   - **Region:** South America (São Paulo) — `sa-east-1`
   - **Plan:** Free (0 BRL/mês — 500MB, 50k rows)
5. Clicar "Create new project" e aguardar (~2 min)

## Passo 2: Aplicar o schema

1. No dashboard do Supabase, ir em **SQL Editor** (menu lateral)
2. Clicar "New query"
3. Copiar TODO o conteúdo do arquivo `docs/database/002_beta_simplified.sql`
4. Colar no editor e clicar **Run**
5. Deve aparecer "Success. No rows returned" — isso é normal

## Passo 3: Copiar as chaves

1. Ir em **Settings** → **API** (menu lateral)
2. Copiar:
   - **Project URL** → é o `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → é o `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → é o `SUPABASE_SERVICE_ROLE_KEY`

## Passo 4: Configurar variáveis locais

Editar o arquivo `.env.local` na raiz do projeto:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxxxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxxxxxxx...
```

## Passo 5: Configurar na Vercel

Rodar no terminal (um por vez):

```bash
echo "https://xxxxxxxx.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production
echo "eyJxxxxxxxx..." | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
echo "eyJxxxxxxxx..." | vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

Depois redeployar:

```bash
vercel --prod --yes
```

## Passo 6: Testar

```bash
npm run dev
# Abrir http://localhost:3000, fazer upload de um contrato
# Se o console mostrar "[Store] Modo Supabase ativado", funcionou!
```

## Custo

O plano Free do Supabase inclui:
- 500MB de banco de dados
- 50.000 linhas
- 2GB de transferência
- Contratos expiram em 7 dias (cleanup automático)

Para o volume da beta, isso é mais que suficiente.
