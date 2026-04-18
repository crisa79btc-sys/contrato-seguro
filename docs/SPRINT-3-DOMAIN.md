# Sprint 3 — Domínio contratoseguro.com.br

Guia completo para migrar de `contrato-seguro-inky.vercel.app` para
`contratoseguro.com.br`. Ordem exata dos passos, com links diretos e
snippets prontos. Tempo estimado: **1h de trabalho + 24-48h de propagação DNS**.

---

## 1. Registrar o domínio

- **Onde:** https://registro.br/busca-dominio/
- **Busca:** `contratoseguro` → escolher `.com.br` (~R$40/ano, 1-5 anos)
- **Se ocupado:** tentar `contratoseguro.app.br` ou `contratoseguro.net.br`
  (atualizar todos os passos abaixo com o domínio escolhido)
- **CPF/CNPJ titular:** o domínio fica no seu nome — NÃO registrar em nome do
  Vercel ou de terceiros

Após pagamento, o domínio fica disponível em https://registro.br/minhas-contas/
em até 15 minutos.

## 2. Adicionar domínio no Vercel

1. https://vercel.com/dashboard → projeto `contrato-seguro` → **Settings** → **Domains**
2. Clicar **Add** → digitar `contratoseguro.com.br`
3. Vercel mostra 2 registros DNS — anotar os valores (tipicamente):
   - Tipo `A` @ → `76.76.21.21`
   - Tipo `CNAME` www → `cname.vercel-dns.com`
4. Repetir o passo 2 para `www.contratoseguro.com.br`

## 3. Configurar DNS no Registro.br

- https://registro.br/minhas-contas/ → seu domínio → **DNS**
- Manter opção **"Usar servidores DNS do Registro.br"** (mais simples)
- Clicar **"Editar Zona"** e adicionar:

| Nome | Tipo | Valor | TTL |
|---|---|---|---|
| @ | A | 76.76.21.21 | 3600 |
| www | CNAME | cname.vercel-dns.com | 3600 |

- Salvar. Propagação: 15 minutos a 48h (média: 2h).

Verificar propagação: https://dnschecker.org/#A/contratoseguro.com.br

## 4. SSL automático

Após DNS propagar, o Vercel provisiona Let's Encrypt em ~1min. Em
**Settings → Domains** o status passa de "Invalid Configuration" para
"Valid Configuration" com ✓ verde.

Se ficar travado em "Invalid Configuration" por > 30min, clicar **"Refresh"**.

## 5. Atualizar código

### 5.1. `next.config.mjs` — redirect 301 do domínio antigo

Substituir o conteúdo atual por:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'contrato-seguro-inky.vercel.app' }],
        destination: 'https://contratoseguro.com.br/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
```

### 5.2. `src/app/sitemap.ts` — trocar BASE_URL default

Linha 3:
```diff
-const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://contrato-seguro-inky.vercel.app';
+const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://contratoseguro.com.br';
```

### 5.3. `src/app/robots.ts` — trocar host

Procurar qualquer menção ao domínio Vercel antigo e trocar por
`contratoseguro.com.br`. O sitemap referenciado deve ser
`https://contratoseguro.com.br/sitemap.xml`.

### 5.4. `src/app/layout.tsx` — metadataBase

Se ainda não houver, adicionar dentro do objeto `metadata`:

```ts
metadataBase: new URL('https://contratoseguro.com.br'),
```

### 5.5. `src/lib/social/meta-client.ts` e outros que referenciam o domínio

Buscar ocorrências de `contrato-seguro-inky.vercel.app` no código e trocar
por `contratoseguro.com.br`. Lista típica:
- `src/lib/social/content-generator.ts` (CTA nos posts)
- `src/lib/reels/transcription-analyzer.ts` (já usa `contratoseguro.com.br`, confirmar)
- `src/lib/reels/platforms/facebook.ts` (platform URL)
- Qualquer endpoint OG image

Comando para listar (PowerShell / WSL):
```bash
grep -r "contrato-seguro-inky" src/ docs/
```

## 6. Atualizar variáveis no Vercel

https://vercel.com/dashboard → projeto → **Settings** → **Environment Variables**

- Editar `NEXT_PUBLIC_SITE_URL` → `https://contratoseguro.com.br`
- Editar `NEXT_PUBLIC_APP_URL` → `https://contratoseguro.com.br` (se existir)
- **Redeploy** (Deployments → última → **Redeploy**)

## 7. Atualizar Supabase Auth

https://supabase.com/dashboard/project/wdsfemqjwgdfrqedvqyh/auth/url-configuration

- **Site URL:** `https://contratoseguro.com.br`
- **Redirect URLs:** adicionar
  - `https://contratoseguro.com.br/auth/callback`
  - manter `https://contrato-seguro-inky.vercel.app/auth/callback` durante uns dias (transição)

## 8. Atualizar Google OAuth (quando configurado)

https://console.cloud.google.com → Credentials → OAuth Client ID `ContratoSeguro`

- **Authorized JavaScript origins:** adicionar `https://contratoseguro.com.br`
- **Authorized redirect URIs:** manter o do Supabase (callback vai para lá)

## 9. Atualizar Meta App (para social/reels)

https://developers.facebook.com → App ContratoSeguro → Settings → Basic

- **App Domains:** adicionar `contratoseguro.com.br`
- **Site URL:** `https://contratoseguro.com.br`

## 10. Google Search Console

https://search.google.com/search-console

1. **Add Property** → Domain → `contratoseguro.com.br`
2. Verificar via DNS TXT (Registro.br → adicionar registro TXT)
3. Submit sitemap: `https://contratoseguro.com.br/sitemap.xml`
4. Na propriedade antiga (`contrato-seguro-inky.vercel.app`): não remover por
   60 dias (mantém métricas históricas)

## 11. Verificação end-to-end

- [ ] `curl -I https://contratoseguro.com.br` retorna `200` e header `server: Vercel`
- [ ] Certificado SSL válido (ícone 🔒 no navegador)
- [ ] `https://contrato-seguro-inky.vercel.app` retorna `308` → `contratoseguro.com.br`
- [ ] Upload de contrato funciona no novo domínio
- [ ] Login Google OAuth funciona (quando ativo)
- [ ] Compartilhar `/analise/:id` no WhatsApp mostra preview correto (OG image)
- [ ] Sitemap acessível: `https://contratoseguro.com.br/sitemap.xml`

## Custo

**R$40/ano** (~R$3,30/mês). Vercel + SSL grátis.

## Troubleshooting

**"Invalid Configuration" no Vercel após 1h:**
- `nslookup contratoseguro.com.br` retorna o IP certo? Se não, DNS ainda não propagou.
- Se retorna IP errado (outro site), verificar se o Registro.br tem algum registro A antigo.

**OAuth quebra após troca:**
- Supabase Site URL precisa bater EXATAMENTE com o domínio servido (com ou sem www).
- Se estiver usando `www.contratoseguro.com.br`, usar esse domínio nas config — não misturar.

**Redirect loop:**
- Acontece se o redirect do `next.config.mjs` apontar para o mesmo host que
  está servindo. Confirmar que o `has` do redirect só dispara no domínio antigo.
