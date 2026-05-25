# Velum Finanças

App pessoal de finanças 360 — Next.js 14 + Tailwind + Recharts + Supabase Auth.

---

## 🚀 Como subir no ar (GitHub + Vercel, 100% pelo navegador)

### Passo 1 — Subir os arquivos pro GitHub

1. Acesse [github.com](https://github.com) e crie um repo `velum-financas` (privado se quiser).
2. **NÃO** marque "Add a README file" — já temos um.
3. Clique em **"uploading an existing file"** e arraste o **conteúdo** desta pasta (não a pasta inteira, os arquivos de dentro).
4. Commit.

### Passo 2 — Deploy na Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com sua conta GitHub.
2. **"Add New..." → "Project"** → importa `velum-financas`.
3. Deixe tudo no padrão. **Clique em Deploy.**
4. ~1 minuto e tá no ar.

🎉 **Funciona em modo local nesse ponto** — login só salva no navegador atual, mas tá tudo rodando.

### Passo 3 — Configurar Anthropic (pra IA funcionar nos Objetivos e Notificações)

1. Pegue uma chave em [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys).
2. Vá em **Vercel → seu projeto → Settings → Environment Variables**.
3. Adicione:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** sua chave (`sk-ant-...`)
4. Volte em **Deployments → último deploy → ⋯ → Redeploy**.

### Passo 4 — Configurar Supabase (pra login real)

1. Crie conta grátis em [supabase.com](https://supabase.com).
2. Clique em **"New Project"** → escolha um nome, região (São Paulo se possível), e senha do banco.
3. Espera ~2 minutos enquanto o projeto sobe.
4. No menu lateral, vá em **Settings → API**.
5. Copie os dois valores:
   - **Project URL** (algo como `https://xxx.supabase.co`)
   - **anon public** key (a longa, NÃO a `service_role`)
6. Em **Vercel → Settings → Environment Variables**, adicione:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL` → **Value:** o Project URL
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **Value:** a anon key
7. Refaz o deploy.

#### Configuração opcional no Supabase

Por padrão, o Supabase manda um e-mail de confirmação quando alguém se cadastra. Pra desativar (cadastro instantâneo, sem verificar e-mail):

1. No Supabase, vá em **Authentication → Sign In / Up → Email**.
2. Desmarque **"Confirm email"**.
3. Salvar.

(Pra app pessoal seu, sem e-mail é mais prático. Pra app público com vários usuários, deixe ligado.)

---

## 📱 Instalando como app

Depois do deploy, abra `velum-financas-seunome.vercel.app` e:

- **Chrome / Edge / Arc (Mac, Windows, Android):** o navegador detecta o app. Clique no ícone de instalar à direita da barra de URL, ou vá na **aba Configurações dentro do Velum → Instalar como app**.
- **Safari (iPhone/iPad):** botão Compartilhar → "Adicionar à Tela de Início".
- **Safari (Mac 17+):** menu Arquivo → "Adicionar ao Dock".

Funciona offline depois de instalado (cache automático via service worker).

---

## 🔄 Como atualizar o app

Qualquer edição que você fizer no GitHub vira deploy automático na Vercel em ~1 minuto.

- **Editar um arquivo no GitHub:** abre o arquivo → ícone de **lápis** → edita → **Commit changes**.
- A Vercel detecta a mudança e refaz o deploy sozinha.

---

## 🛠 Estrutura

```
velum-nextjs/
├── app/
│   ├── layout.js              ← Layout raiz, fontes, PWA metadata
│   ├── page.js                ← Página principal
│   ├── globals.css            ← Tailwind + animações + fonte Geist
│   └── api/claude/
│       └── route.js           ← Proxy server-side pra Anthropic
├── components/
│   └── VelumFinancas.jsx      ← Componente principal (tudo aqui)
├── lib/
│   └── supabase.js            ← Cliente Supabase com fallback
├── public/
│   ├── favicon.svg, favicon.ico
│   ├── icon-192.png, icon-512.png, apple-touch-icon.png
│   ├── velum-logo-horizontal.svg, velum-logo-vertical.svg
│   ├── manifest.json          ← PWA manifest
│   └── sw.js                  ← Service worker (offline + install)
├── package.json
├── tailwind.config.js, postcss.config.js
├── next.config.mjs
├── jsconfig.json              ← Alias @/
└── .gitignore
```

---

## 🐛 Diagnóstico

- **"ANTHROPIC_API_KEY não configurada"** ao clicar em "Pedir plano à Velum AI"  
  → Configurar a env var na Vercel (Passo 3 acima) e refazer deploy.

- **Login não aparece "modo local ativo" e não consigo me cadastrar**  
  → Falta configurar Supabase (Passo 4). Sem isso, dá pra "fazer login" só localmente — o e-mail/senha é aceito sem validar, mas funciona só no navegador atual.

- **Cadastrei e não recebi e-mail de confirmação**  
  → Olhe no spam. Se quiser dispensar confirmação, desative em Supabase → Authentication → Email → "Confirm email" off.

- **Página em branco depois do deploy**  
  → Cmd+Option+I (Mac) → aba "Console" → me manda o erro vermelho.

- **Deploy falhou na Vercel**  
  → Aba **Logs** do deploy → me manda o erro.

---

## 📝 Privacidade

- Suas finanças ficam no `localStorage` do navegador (por enquanto). Trocar de aparelho = começar do zero.
- Quando você logar com Supabase, a sessão fica salva mas **os dados financeiros continuam locais**. Migrar pra banco de dados é o próximo passo possível.
- A `ANTHROPIC_API_KEY` mora só no servidor da Vercel — nunca exposta no front.
