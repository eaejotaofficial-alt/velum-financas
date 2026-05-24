# Velum Finanças

App de finanças 360 — Next.js 14 + Tailwind + Recharts.

---

## 🚀 Como subir no ar (GitHub + Vercel, 100% pelo navegador)

### Passo 1 — Criar conta no GitHub (se ainda não tiver)

Acesse [github.com](https://github.com) e crie uma conta gratuita.

### Passo 2 — Criar o repositório

1. Clique no botão **"+"** no canto superior direito → **"New repository"**.
2. Nome do repositório: `velum-financas`
3. Marque como **Private** (privado) se preferir.
4. **NÃO** marque "Add a README file" (porque já temos um).
5. Clique em **"Create repository"**.

### Passo 3 — Subir os arquivos do projeto

Na tela do repositório recém-criado:

1. Clique no link **"uploading an existing file"** (no meio da página).
2. **Arraste a pasta `velum-nextjs` inteira** para a área de upload — ou todos os arquivos dentro dela, mantendo a estrutura.
3. **Importante:** o arquivo `.gitignore` precisa estar lá (ele garante que `node_modules` e `.env.local` não sejam enviados).
4. Role pra baixo, escreva uma mensagem tipo "primeiro commit" e clique em **"Commit changes"**.

### Passo 4 — Conectar à Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login **com a sua conta do GitHub**.
2. Na tela inicial, clique em **"Add New..." → "Project"**.
3. Encontre `velum-financas` na lista e clique em **"Import"**.
4. Na tela de configuração, **deixe tudo no padrão** — a Vercel detecta automaticamente que é Next.js.
5. **MUITO IMPORTANTE — antes de clicar em Deploy:**
   - Expanda a seção **"Environment Variables"**.
   - Adicione a variável:
     - **Name:** `ANTHROPIC_API_KEY`
     - **Value:** sua chave da Anthropic (pegue em [console.anthropic.com/settings/keys](https://console.anthropic.com/settings/keys))
6. Clique em **"Deploy"**.
7. Espera ~1 minuto. Quando terminar, clique em **"Visit"** ou **"Continue to Dashboard"**.

🎉 **Pronto. Seu app tá no ar.** A Vercel te dá uma URL do tipo `velum-financas-seunome.vercel.app`.

---

## 🔄 Como atualizar o app depois

Qualquer mudança que você fizer nos arquivos no GitHub vira deploy automático na Vercel em menos de 1 minuto. Não precisa fazer nada além de editar e commitar.

### Editar um arquivo direto no GitHub

1. Abre o arquivo no repositório (ex: `components/VelumFinancas.jsx`).
2. Clica no ícone de **lápis** (canto superior direito do arquivo).
3. Edita.
4. Clica em **"Commit changes"** lá embaixo.
5. A Vercel detecta a mudança e refaz o deploy sozinha.

---

## 🛠 Estrutura do projeto

```
velum-nextjs/
├── app/
│   ├── layout.js         ← Layout raiz, importa as fontes Geist
│   ├── page.js           ← Página inicial (renderiza o componente)
│   ├── globals.css       ← Tailwind + animações + slider
│   └── api/claude/
│       └── route.js      ← Proxy para a API da Anthropic (resolve CORS)
├── components/
│   └── VelumFinancas.jsx ← Componente principal (toda a app)
├── public/               ← Imagens/SVGs estáticos (vazio por enquanto)
├── package.json          ← Dependências
├── tailwind.config.js    ← Config do Tailwind
├── postcss.config.js
├── next.config.mjs
├── jsconfig.json         ← Alias @/ para a raiz do projeto
└── .gitignore
```

---

## 🐛 Se algo der errado

- **"ANTHROPIC_API_KEY não configurada"** na aba Objetivos ou Notificações  
  → Vai em **Vercel → Settings → Environment Variables**, adiciona a `ANTHROPIC_API_KEY` e refaz o deploy (Deployments → ⋯ → Redeploy).

- **Deploy falhou na Vercel**  
  → Abre a aba **Logs** do deploy. Geralmente é falta de algum arquivo de config. Me passa o erro e te ajudo.

- **Página em branco depois do deploy**  
  → Abre o console do navegador (Cmd + Option + I no Mac → aba "Console") e me manda o erro vermelho.

---

## 📝 Variáveis do app

Nada de senhas no código. A única coisa sensível é a `ANTHROPIC_API_KEY`, que mora só no painel da Vercel (não vai pro GitHub).
