# 🏆 Copa do Mundo Azure — Guia do Evento TFTEC (FIFA 2026 Tickets)

> ⚽ **Bem-vindo(a) ao gramado!** Neste evento você vai **construir do zero** o seu próprio ambiente em nuvem e colocar no ar a aplicação **FIFA 2026 Tickets** — a bilheteria oficial (fictícia) da Copa do Mundo.
>
> 🥅 **Para todos os níveis.** Você não precisa ser sênior. Cada passo é explicado em detalhe, com o **caminho visual pelo Portal do Azure** sempre que possível — aqui a ideia é **entender o que você está fazendo**.

> 🚧 **Documento vivo.** Itens marcados com _⚠️ a confirmar_ serão fixados conforme o evento se aproxima (ex.: URL do repositório público, dataset do banco). A estrutura, a arquitetura e os passos já valem.

> 🎟️ **Tem um app irmão!** Existe também o **Bolão TFTEC** (palpites). Este guia é o do **Tickets** (venda de ingressos) — arquitetura diferente (banco **relacional** + 2 Web Apps). Se você for fazer os dois, repare nas diferenças: é parte do aprendizado.

---

## 📋 Índice

1. [Sobre a aplicação](#-1-sobre-a-aplicação)
2. [Objetivos do evento](#-2-objetivos-do-evento)
3. [Tecnologias Azure que vamos usar](#-3-tecnologias-azure-que-vamos-usar)
4. [Arquitetura da aplicação](#-4-arquitetura-da-aplicação)
5. [A jornada do aluno](#-5-a-jornada-do-aluno)
   - [🎽 Fase 0 — Pré-jogo: pré-requisitos](#-fase-0--pré-jogo-pré-requisitos)
   - [🤝 Fase 1 — Convocação: fork do repositório](#-fase-1--convocação-fork-do-repositório)
   - [🏟️ Fase 2 — Fase de Grupos: criar os recursos no Portal](#️-fase-2--fase-de-grupos-criar-os-recursos-no-portal)
   - [🗄️ Fase 3 — Oitavas: importar o banco (bacpac)](#️-fase-3--oitavas-importar-o-banco-bacpac)
   - [🔧 Fase 4 — Quartas: configurar e proteger o backend](#-fase-4--quartas-configurar-e-proteger-o-backend)
   - [⚙️ Fase 5 — Semifinal: CI/CD com GitHub Actions](#️-fase-5--semifinal-cicd-com-github-actions)
   - [🏆 Fase 6 — Final: deploy, validar e comemorar](#-fase-6--final-deploy-validar-e-comemorar)
   - [🎖️ Fase 7 — Pós-jogo: troubleshooting](#️-fase-7--pós-jogo-troubleshooting)
6. [Tabela de variáveis e segredos](#-6-tabela-de-variáveis-e-segredos)

---

## ⚽ 1. Sobre a aplicação

O **FIFA 2026 Tickets** é a **bilheteria** (fictícia, educacional) da Copa do Mundo 2026: o torcedor navega pelos jogos, estádios e seleções, escolhe um setor e **compra ingressos**, recebendo um **ingresso premium com QR code** validável.

É uma aplicação **3 camadas clássica** — o pão-com-manteiga da web corporativa:

- 🎟️ **Catálogo** de jogos (104 partidas), 16 estádios oficiais e 48 seleções
- 🛒 **Fluxo de compra** com ocupação por jogo e bloqueio de esgotado
- 🪪 **Ingresso premium** com QR code real + página de validação
- 📊 **Painel admin** (vendas, usuários, resultados) com paginação server-side
- 🔐 **Autenticação própria** (JWT) + papel admin
- 📚 Conteúdo: História das Copas, quiz, bracket do mata-mata

> 💡 **Por que esse app?** Ele ensina a arquitetura web **mais comum do mercado**: frontend estático + API + **banco relacional (SQL)**, com **frontend público e backend/banco privados**, deploy automatizado e migração de dados via **`.bacpac`**. É o cenário que você mais vai encontrar na vida real.

---

## 🎯 2. Objetivos do evento

Ao final, você terá feito **com as suas próprias mãos**:

| # | Você vai aprender a... |
|---|---|
| 1 | Criar e organizar recursos no **Azure** usando o **Portal** (caminho visual) |
| 2 | Provisionar um **banco relacional** (Azure SQL Database) e **migrar dados** via `.bacpac` |
| 3 | Hospedar **dois Web Apps** (frontend + backend) num App Service Plan |
| 4 | **Isolar o backend** (acesso só pelo frontend) — defesa em profundidade |
| 5 | Configurar **CI/CD com GitHub Actions** usando **publish profiles** |
| 6 | Entender **reverse proxy** (`web.config`) e como front fala com back sem CORS |
| 7 | Validar a aplicação ponta a ponta e diagnosticar problemas |

> 🧠 **Filosofia:** **Portal-first** (clicar e ver). Script só quando **realmente necessário** (e sinalizado). Você sai sabendo **o que cada peça faz**.

> 🆚 **Diferença para o Bolão:** lá o banco é **NoSQL (Cosmos)** com Functions e tempo real; aqui é **SQL relacional** com migração de dados (`.bacpac`) e topologia front/back separados. Dois mundos comuns no mercado.

---

## ☁️ 3. Tecnologias Azure que vamos usar

Tudo dentro de **um Resource Group** (`fifa2026-rg`). Como nomes de Web App e SQL Server são **globais**, você escolhe um **sufixo único** (ex.: `joao2026`).

| Serviço Azure | Para que serve no Tickets | Camada / Custo |
|---|---|---|
| 🟦 **App Service Plan (Windows, B1)** | A "máquina" que hospeda os 2 Web Apps | B1 (~$13/mês) |
| 🌐 **Web App `fifa2026-web`** | Frontend (build React/Vite) + `web.config` que faz proxy `/api/*` | incluso no Plan |
| 🔒 **Web App `fifa2026-back`** | Backend Express/Node — **privado** (só o front acessa) | incluso no Plan |
| 🟥 **Azure SQL Database** | Banco relacional dos jogos, ingressos, usuários, vendas | Basic (~$5/mês) |
| 💾 **Storage Account** (temporário) | Hospedar o `.bacpac` para importar no SQL | Standard_LRS (centavos) |
| 🤖 **GitHub Actions** (CI/CD) | Build + deploy automáticos a cada push | Grátis (repo público) |

> 💰 **Custo total:** ~**$18/mês** (App Service B1 + SQL Basic). O resto é centavos. Configure um **alerta de orçamento** (Fase 0).

> 🔐 **Sobre segredos:** este app usa **App Settings** (no Web App) + **publish profiles** (segredo no GitHub) — modelo simples e muito comum. _Boa prática extra (opcional):_ migrar a senha do SQL para um **Key Vault** — fora do escopo base, mas anote como evolução.

---

## 🗺️ 4. Arquitetura da aplicação

O "mapa do estádio" — **Cenário Azure Web App** (o que você vai montar):

```
                          🌎 TORCEDOR (navegador / celular)
                                      │  HTTPS
                                      ▼
        ┌─────────────────────────────────────────────────────────┐
        │   🌐 WEB APP  fifa2026-web-<suffix>  (Windows)           │
        │   • Conteúdo: build estático do React (dist/)            │
        │   • web.config: reescreve  /api/*  ──────────────────────┼──┐
        │     (reverse proxy → backend; cliente nunca vê o back)   │  │
        └─────────────────────────────────────────────────────────┘  │
                                                                      │  /api/*
                                                                      ▼
        ┌─────────────────────────────────────────────────────────┐
        │   🔒 WEB APP  fifa2026-back-<suffix>  (Windows, Node)    │
        │   • API Express  (auth, jogos, compra, ingressos, admin) │
        │   • 🚧 Access Restriction: SÓ os IPs de saída do front   │
        │     (a Internet NÃO fala direto com o backend)           │
        └──────────────────────────────┬──────────────────────────┘
                                        │ driver mssql (porta 1433)
                                        ▼
        ┌─────────────────────────────────────────────────────────┐
        │   🟥 AZURE SQL DATABASE  FIFA2026Tickets                 │
        │   • Servidor lógico: fifa2026-sql-<suffix>               │
        │   • Firewall: libera "Azure services" (ou IPs do back)   │
        │   • Dados carregados de  FIFA2026Tickets.bacpac          │
        └─────────────────────────────────────────────────────────┘

        ───────────────────────────────────────────────────────────
        🤖 GITHUB ACTIONS:  git push  →  build  →  deploy
            • deploy-frontend.yml → fifa2026-web   (publish profile)
            • deploy-backend.yml  → fifa2026-back  (publish profile)
            • BACKEND_URL é embutido no web.config + bundle no build
```

**Princípios de design (e o que isso ensina):**

- 🧅 **Defesa em profundidade.** Só o frontend é público. O backend aceita **apenas** os IPs de saída do frontend (Access Restriction). O banco aceita **apenas** o backend (firewall). Três camadas, cada uma protegendo a próxima.
- 🔁 **Sem CORS em produção.** O navegador chama `/api/*` na **mesma origem** do frontend; o `web.config` faz o *reverse proxy* para o backend. Você aprende o padrão *proxy reverso*.
- 🗃️ **Migração de dados real.** O banco não nasce vazio: você **importa um `.bacpac`** — exatamente como se faz ao mover um sistema legado para a nuvem.
- 🤖 **Deploy é botão.** `git push` → GitHub Actions builda e publica cada camada no seu Web App. Você só conecta o ambiente via **publish profiles + Variables**, sem editar código.

---

## 🧭 5. A jornada do aluno

| Fase | Etapa | Tempo aprox. |
|---|---|---|
| 🎽 Pré-jogo | 0. Pré-requisitos | 10 min |
| 🤝 Convocação | 1. Fork do repositório | 5 min |
| 🏟️ Fase de Grupos | 2. Criar recursos no Portal | 35 min |
| 🗄️ Oitavas | 3. Importar o banco (bacpac) | 15 min |
| 🔧 Quartas | 4. Configurar e proteger o backend | 15 min |
| ⚙️ Semifinal | 5. CI/CD com GitHub Actions | 15 min |
| 🏆 Final | 6. Deploy, validar e comemorar | 15 min |
| 🎖️ Pós-jogo | 7. Troubleshooting | livre |

> 🧩 **Como o código chega até você:** ele fica num **repositório público no GitHub**. Você faz um **fork**, e o **GitHub Actions já vem pronto no projeto**. Você conecta o seu ambiente via **2 Secrets (publish profiles) + 2 Variables (nomes dos seus Web Apps)** — **sem alterar código**.

---

### 🎽 Fase 0 — Pré-jogo: pré-requisitos

- [ ] **Conta Azure ativa** — [azure.microsoft.com/free](https://azure.microsoft.com/free/)
- [ ] **Conta GitHub** — [github.com](https://github.com/)
- [ ] **Navegador moderno**
- [ ] **Bloco de notas** para anotar nomes, servidor SQL, senha
- [ ] _(Opcional, Fase 3 alternativa)_ **Azure Data Studio** ou **SSMS** se quiser importar o banco por ferramenta

**Confirme o Azure:** entre em [portal.azure.com](https://portal.azure.com) → topo direito → **Subscription** ativa.

**Alerta de orçamento (recomendado):** Portal → **Cost Management → Budgets → + Add** → `$25`/mês, alerta em 80% e 100% → seu e-mail.

> ✅ **Pronto quando:** você abre o Portal e vê uma subscription ativa.

---

### 🤝 Fase 1 — Convocação: fork do repositório

1. Acesse o repositório público: **`https://github.com/TFTEC/<repo-publico-tickets>`** _(⚠️ a confirmar — URL final no evento)_
2. **Fork** (canto superior direito) → **Create fork**
3. No **seu** fork → aba **Actions** → **"I understand my workflows, go ahead and enable them"** (forks vêm com Actions desabilitado)
4. Localize, no repo, o arquivo **`FIFA2026-APP/FIFA2026Tickets.bacpac`** — é a fonte dos dados, você vai usá-lo na Fase 3. _(⚠️ o dataset é atualizado pela organização antes do evento.)_

> ✅ **Pronto quando:** existe um fork seu com Actions habilitado.

---

### 🏟️ Fase 2 — Fase de Grupos: criar os recursos no Portal

Tudo em [portal.azure.com](https://portal.azure.com). Use a **barra de busca** no topo, abra o serviço, **+ Create**, e finalize em **Review + create → Create**.

#### 🎽 Passo 0 — Escolha o seu sufixo

Sufixo único (3-12 chars, minúsculo, sem espaço): **seu nome + ano** → ex.: **`joao2026`**. **Use o mesmo em tudo.** Anote — vai reusar na Fase 5. Onde houver `<suffix>`, troque pelo seu. Região única: **East US**.

---

#### 1️⃣ Resource Group — `fifa2026-rg`

1. Busca → **Resource groups** → **+ Create**
2. **Subscription:** a sua · **Resource group:** `fifa2026-rg` · **Region:** East US
3. **Review + create** → **Create**

---

#### 2️⃣ App Service Plan — `fifa2026-plan-<suffix>`

A "máquina" que hospeda os **dois** Web Apps (eles compartilham o mesmo plano — econômico).

1. Busca → **App Service plans** → **+ Create**
2. **Resource group:** `fifa2026-rg`
3. **Name:** `fifa2026-plan-<suffix>`
4. **Operating System:** **Windows** ← (o app usa `web.config`/iisnode — Windows)
5. **Region:** East US
6. **Pricing plan:** **Basic B1**
7. **Review + create** → **Create**

---

#### 3️⃣ Azure SQL — Servidor lógico + Database `FIFA2026Tickets`

**3a. SQL Server (lógico):**
1. Busca → **SQL servers** → **+ Create**
2. **Resource group:** `fifa2026-rg`
3. **Server name:** `fifa2026-sql-<suffix>` (global)
4. **Location:** East US
5. **Authentication method:** **Use SQL authentication**
6. **Server admin login:** `fifa2026admin`
7. **Password:** crie uma **senha forte** → 📋 **anote** (rótulo: *SQL Admin Password*)
8. **Review + create** → **Create**

**3b. SQL Database:**
1. Busca → **SQL databases** → **+ Create**
2. **Resource group:** `fifa2026-rg`
3. **Database name:** `FIFA2026Tickets`
4. **Server:** selecione o `fifa2026-sql-<suffix>` criado
5. **Want to use SQL elastic pool?** No
6. **Compute + storage:** clique **Configure** → **Basic** (~$5/mês) → Apply
7. **Review + create** → **Create**

**3c. Liberar o firewall do SQL** (para o backend conseguir conectar):
1. Abra o **SQL server** `fifa2026-sql-<suffix>` → menu **Networking**
2. **Public network access:** Selected networks
3. ✅ Marque **"Allow Azure services and resources to access this server"**
4. **Save**

> 📋 Anote o **Server name** completo: `fifa2026-sql-<suffix>.database.windows.net` (rótulo: *DB_SERVER*).

---

#### 4️⃣ Storage Account — `stfifatickets<suffix>` (para o bacpac)

Necessário para o Portal conseguir **importar o `.bacpac`** (ele lê de um blob).

1. Busca → **Storage accounts** → **+ Create**
2. **Resource group:** `fifa2026-rg`
3. **Name:** `stfifatickets<suffix>` (minúsculo, **sem hífen**, 3-24 chars)
4. **Region:** East US · **Performance:** Standard · **Redundancy:** **LRS**
5. **Review + create** → **Create**
6. Após criar → **Data storage → Containers** → **+ Container** → Name: `bacpac` → **Create**

---

#### 5️⃣ Web App backend — `fifa2026-back-<suffix>`

1. Busca → **App Services** → **+ Create** → **Web App**
2. **Resource group:** `fifa2026-rg`
3. **Name:** `fifa2026-back-<suffix>`
4. **Publish:** **Code**
5. **Runtime stack:** **Node 18 LTS**
6. **Operating System:** **Windows**
7. **Region:** East US
8. **Windows Plan:** selecione `fifa2026-plan-<suffix>` (passo 2)
9. **Review + create** → **Create**

(Vamos configurar as App Settings e o isolamento na **Fase 4**.)

---

#### 6️⃣ Web App frontend — `fifa2026-web-<suffix>`

1. Busca → **App Services** → **+ Create** → **Web App**
2. **Resource group:** `fifa2026-rg`
3. **Name:** `fifa2026-web-<suffix>` → vira `https://fifa2026-web-<suffix>.azurewebsites.net`
4. **Publish:** **Code**
5. **Runtime stack:** **Node 20 LTS**
6. **Operating System:** **Windows** (precisa do `web.config`/URL Rewrite)
7. **Region:** East US
8. **Windows Plan:** o mesmo `fifa2026-plan-<suffix>`
9. **Review + create** → **Create**
10. Após criar → **Settings → Configuration → General settings** → **HTTPS Only: On** → Save

---

#### ✅ Checklist da Fase 2

No `fifa2026-rg` você deve ver:

```
fifa2026-rg
├── fifa2026-plan-<suffix>     (App Service Plan B1 Windows)
├── fifa2026-sql-<suffix>      (SQL server) + FIFA2026Tickets (SQL database Basic)
├── stfifatickets<suffix>      (Storage + container "bacpac")
├── fifa2026-back-<suffix>     (Web App backend)
└── fifa2026-web-<suffix>      (Web App frontend, HTTPS Only)
```

Anotado no bloco: *SQL Admin Password*, *DB_SERVER* (`fifa2026-sql-<suffix>.database.windows.net`).

> ✅ **Pronto quando:** os recursos acima existem e o firewall do SQL libera "Azure services".

---

### 🗄️ Fase 3 — Oitavas: importar o banco (bacpac)

O banco não nasce com dados — você vai **carregar o `.bacpac`** (jogos, estádios, seleções, etc.). Isto é uma **migração de dados** real.

**3.1 Subir o `.bacpac` para o Storage**
1. No seu fork (GitHub), abra `FIFA2026-APP/` → baixe o arquivo **`FIFA2026Tickets.bacpac`** (botão **Download**)
2. Portal → Storage `stfifatickets<suffix>` → **Containers** → `bacpac` → **Upload** → selecione o `FIFA2026Tickets.bacpac` → **Upload**

**3.2 Importar no SQL (Portal)**
1. Portal → abra o **SQL server** `fifa2026-sql-<suffix>` (o servidor, não o database)
2. Barra superior → **Import database**
3. **Storage:** selecione o storage `stfifatickets<suffix>` → container `bacpac` → o arquivo `FIFA2026Tickets.bacpac`
4. **Database name:** se o database `FIFA2026Tickets` já existe e está vazio, você pode importar para um novo nome (ex.: `FIFA2026Tickets`) — siga a orientação da tela; o objetivo é ter o database `FIFA2026Tickets` **com os dados**
5. **Authentication:** SQL Server · login `fifa2026admin` · a *SQL Admin Password*
6. **OK** → o import roda em background (acompanhe em **SQL server → Import/Export history**), ~5-15 min

> ⚙️ **Alternativa (ferramenta):** _Azure Data Studio/SSMS_ → conectar em `fifa2026-sql-<suffix>.database.windows.net` → **Import Data-Tier Application** → o `.bacpac`. Use se preferir ferramenta a Portal.

> ✅ **Pronto quando:** o database `FIFA2026Tickets` existe **com dados** (no Portal → SQL database → Query editor → `SELECT COUNT(*) FROM matches` retorna > 0). _(⚠️ contagens exatas dependem do dataset final — documento vivo.)_

---

### 🔧 Fase 4 — Quartas: configurar e proteger o backend

#### 4.1 App Settings do backend

Portal → `fifa2026-back-<suffix>` → **Settings → Configuration → Application settings** → **+ New application setting** (um por linha) → **Save**:

| Name | Value |
|---|---|
| `DB_SERVER` | `fifa2026-sql-<suffix>.database.windows.net` |
| `DB_PORT` | `1433` |
| `DB_USER` | `fifa2026admin` |
| `DB_PASSWORD` | *(a SQL Admin Password da Fase 2)* |
| `DB_NAME` | `FIFA2026Tickets` |
| `JWT_SECRET` | string longa aleatória (gere abaixo) |
| `JWT_EXPIRES_IN` | `7d` |
| `FRONTEND_URL` | `https://fifa2026-web-<suffix>.azurewebsites.net` |
| `WEBSITE_NODE_DEFAULT_VERSION` | `~18` |

Gerar `JWT_SECRET`:
```bash
openssl rand -base64 32
```
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Também em **General settings:** **HTTPS Only: On**.

#### 4.2 Tornar o backend privado (defesa em profundidade)

O backend só deve responder ao **frontend**, nunca à Internet direto.

1. Portal → `fifa2026-web-<suffix>` → **Networking → Outbound addresses** → 📋 copie a lista de **Outbound IP addresses**
2. Portal → `fifa2026-back-<suffix>` → **Networking → Access restriction** → **Add rule**:
   - Para **cada IP** de saída do front: Action **Allow**, Priority crescente, o IP/32
   - Garanta que a regra **default** fique **Deny** (negar o resto)
3. Resultado: só o `fifa2026-web` consegue chamar o `fifa2026-back`. 🧅

> 💡 **Por quê?** É o princípio do mínimo privilégio: cada camada só aceita quem precisa. Mesmo que alguém descubra a URL do backend, a Internet não passa.

> ✅ **Pronto quando:** backend tem todas as App Settings, HTTPS Only On e Access Restriction permitindo só os IPs do front.

---

### ⚙️ Fase 5 — Semifinal: CI/CD com GitHub Actions

Os pipelines (`.github/workflows/deploy-frontend.yml` e `deploy-backend.yml`) **já estão no projeto**. Você só conecta o seu ambiente. **Zero edição de código.**

#### 5.1 Baixar os publish profiles (no Portal)

O **publish profile** é a "chave de deploy" de um Web App.
1. Portal → `fifa2026-back-<suffix>` → barra superior → **Download publish profile** (salva um `.PublishSettings`)
2. Idem para `fifa2026-web-<suffix>`

#### 5.2 Configurar o GitHub (no SEU fork → Settings → Secrets and variables → Actions)

**Aba _Secrets_ → New repository secret** (cole o **conteúdo inteiro** do arquivo `.PublishSettings`):

| Secret | Valor |
|---|---|
| `AZURE_BACKEND_PUBLISH_PROFILE` | conteúdo do publish profile do **back** |
| `AZURE_FRONTEND_PUBLISH_PROFILE` | conteúdo do publish profile do **web** |

**Aba _Variables_ → New repository variable:**

| Variable | Valor |
|---|---|
| `BACKEND_APP_NAME` | `fifa2026-back-<suffix>` |
| `FRONTEND_APP_NAME` | `fifa2026-web-<suffix>` |
| `BACKEND_URL` | `https://fifa2026-back-<suffix>.azurewebsites.net` |

> 🧠 **Como funciona:** os workflows usam essas Variables para saber **o nome dos SEUS Web Apps** e qual **BACKEND_URL** embutir no build do frontend (no `web.config` e no bundle). Se você não definir, eles caem nos defaults antigos (`fifa2026-web`/`fifa2026-back`) — por isso **defina as Variables** com os seus nomes.

> ✅ **Pronto quando:** seu fork tem os **2 Secrets** (publish profiles) e as **3 Variables**.

---

### 🏆 Fase 6 — Final: deploy, validar e comemorar

#### 6.1 Disparar os deploys

Aba **Actions** do seu fork → rode **manualmente** (1ª vez, recomendado):
1. Workflow **Deploy Backend (FIFA 2026 API)** → **Run workflow** → confira o `app_name` → **Run**
2. Espere terminar. Depois: workflow **Deploy Frontend (FIFA 2026 Web)** → **Run workflow** → confira `backend_url` e `app_name` → **Run**

(Nas próximas vezes, qualquer push em `main` que toque `fifa2026-api/**` ou `Lovable/**` dispara o respectivo deploy automaticamente.)

#### 6.2 Validar (smoke)

Abra: **`https://fifa2026-web-<suffix>.azurewebsites.net`**

- [ ] A home carrega (lista de jogos/estádios)
- [ ] `https://fifa2026-web-<suffix>.azurewebsites.net/api/health` responde OK (via proxy do `web.config`)
- [ ] Listagem de **jogos** e **estádios** mostra dados (veio do banco/bacpac)
- [ ] **Cadastre um usuário**, faça **login**
- [ ] Faça uma **compra de ingresso** → recebe o ingresso premium com **QR code**
- [ ] Acesse a **página de validação** do ingresso (QR/link) → mostra "válido"
- [ ] Login admin → painel de vendas/usuários abre

> 🏆 **Conseguiu?** Você publicou uma aplicação 3 camadas completa, com banco relacional migrado por `.bacpac`, backend isolado e CI/CD. **É campeão!** 🎉

---

### 🎖️ Fase 7 — Pós-jogo: troubleshooting

| Sintoma | Causa provável | O que fazer |
|---|---|---|
| Front abre, mas dados não aparecem / `/api/*` 502 | `web.config` apontando para backend errado | Rode o **Deploy Frontend** com `backend_url`/Variable correto; confira `BACKEND_URL` |
| `/api/health` 403 | Access Restriction bloqueando | Os **outbound IPs do front** mudaram — reabra `fifa2026-web → Networking` e atualize as regras do back |
| Backend não conecta no banco | `DB_*` errado ou firewall do SQL | Confira App Settings; SQL server → Networking → "Allow Azure services" ligado |
| Login falha / token inválido | `JWT_SECRET` ausente | Defina `JWT_SECRET` nas App Settings do back e reinicie |
| Deploy falha no GitHub Actions | Publish profile inválido/expirado | Baixe o publish profile de novo no Portal e atualize o Secret |
| Deploy vai pro app errado | Variable de nome errada | Ajuste `BACKEND_APP_NAME`/`FRONTEND_APP_NAME` no GitHub |
| App "demora a subir" após deploy | Cold start (Windows/iisnode) | Aguarde 1-2 min e teste de novo; ative **Always On** no Plan se disponível |
| Import do bacpac falha | Firewall do SQL ou storage | Libere "Allow Azure services" no SQL; confirme o bacpac no container |

> 📚 Referências: [`DEPLOY.md`](../DEPLOY.md) (3 cenários) · [`infra/README.md`](../infra/README.md) (Bicep) · `fifa2026-api/database/README.md` (banco)

---

## 📊 6. Tabela de variáveis e segredos

**No GitHub (seu fork) — Settings → Secrets and variables → Actions:**

| Tipo | Nome | Valor |
|---|---|---|
| 🔑 Secret | `AZURE_BACKEND_PUBLISH_PROFILE` | Publish profile do Web App backend |
| 🔑 Secret | `AZURE_FRONTEND_PUBLISH_PROFILE` | Publish profile do Web App frontend |
| 🔢 Variable | `BACKEND_APP_NAME` | `fifa2026-back-<suffix>` |
| 🔢 Variable | `FRONTEND_APP_NAME` | `fifa2026-web-<suffix>` |
| 🔢 Variable | `BACKEND_URL` | `https://fifa2026-back-<suffix>.azurewebsites.net` |

**No Web App `fifa2026-back-<suffix>` — Configuration → Application settings:**

`DB_SERVER` · `DB_PORT` · `DB_USER` · `DB_PASSWORD` · `DB_NAME` · `JWT_SECRET` · `JWT_EXPIRES_IN` · `FRONTEND_URL` · `WEBSITE_NODE_DEFAULT_VERSION`

> 🔒 **Regra de ouro:** segredo nunca vai para o código nem para o repositório. Aqui ficam em **App Settings** (no Azure) e **GitHub Secrets** (publish profiles). _Evolução opcional:_ mover `DB_PASSWORD`/`JWT_SECRET` para um **Key Vault** e referenciar via `@Microsoft.KeyVault(...)`.

---

> 🏁 _Documento vivo — atualizado conforme o evento se aproxima (URL do repo público, dataset do bacpac, contagens). **Bola rolando!**_ ⚽🏆
