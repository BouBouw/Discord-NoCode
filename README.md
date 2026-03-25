# DisFlow — Discord NoCode Bot Builder

DisFlow est une plateforme NoCode permettant de créer, configurer et déployer des bots Discord via une interface visuelle de type workflow (drag & drop). Chaque bot tourne dans son propre conteneur Docker isolé avec sa propre base de données.

---

## Table des matières

- [Architecture](#architecture)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
- [Configuration détaillée](#configuration-détaillée)
  - [1. Base de données MySQL](#1-base-de-données-mysql)
  - [2. Serveur backend](#2-serveur-backend)
  - [3. Application frontend](#3-application-frontend)
  - [4. Image Docker des bots](#4-image-docker-des-bots)
  - [5. Discord OAuth (optionnel)](#5-discord-oauth-optionnel)
  - [6. Stripe (optionnel)](#6-stripe-optionnel)
  - [7. OpenAI (optionnel)](#7-openai-optionnel)
- [Démarrage du projet](#démarrage-du-projet)
- [Ports utilisés](#ports-utilisés)
- [Structure du projet](#structure-du-projet)
- [Variables d'environnement](#variables-denvironnement)
- [FAQ & Dépannage](#faq--dépannage)

---

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌──────────────────────────┐
│   Frontend (web)│◄────►│  Backend (server)│◄────►│   MySQL (discord_nocode) │
│   React + Vite  │ API  │  Express + WS    │      │   Tables auto-créées     │
│   :5173         │      │  :3008           │      │   :3306                  │
└─────────────────┘      └───────┬──────────┘      └──────────────────────────┘
                                 │
                          Docker Engine
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌──────────┐┌──────────┐┌──────────┐
              │  Bot #1  ││  Bot #2  ││  Bot #N  │
              │ Node.js  ││ Node.js  ││ Node.js  │
              │ MariaDB  ││ MariaDB  ││ MariaDB  │
              │ :9000    ││ :9001    ││ :900X    │
              └──────────┘└──────────┘└──────────┘
```

Chaque bot est un conteneur Docker autonome basé sur `node:22-alpine` avec MariaDB intégré. Le backend orchestre la création, le déploiement et la supervision des conteneurs via l'API Docker.

---

## Prérequis

| Outil        | Version minimum | Vérification             |
|-------------|----------------|--------------------------|
| **Node.js** | 20+            | `node --version`         |
| **npm**     | 9+             | `npm --version`          |
| **Docker**  | 24+            | `docker --version`       |
| **MySQL**   | 8.0+ (ou MariaDB 10.6+) | `mysql --version` |

> **Docker** est **obligatoire** pour exécuter les instances de bots. Le serveur utilise directement les commandes Docker CLI (`docker build`, `docker run`, etc.).

> **MySQL** est nécessaire pour la base de données principale du serveur. Les bots utilisent leur propre MariaDB embarquée dans chaque conteneur.

---

## Installation rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/<votre-repo>/Discord-NoCode.git
cd Discord-NoCode

# 2. Installer les dépendances du serveur
cd server
npm install

# 3. Configurer l'environnement serveur
cp .env.example .env   # ou créer manuellement (voir section Configuration)

# 4. Installer les dépendances du frontend
cd ../web
npm install

# 5. Build l'image Docker des bots (optionnel — auto-build au premier déploiement)
cd ../docker/bot
docker build -t discord-nocode-bot:latest .

# 6. Démarrer MySQL, puis le serveur, puis le frontend (voir section Démarrage)
```

---

## Configuration détaillée

### 1. Base de données MySQL

Le serveur a besoin d'une instance MySQL accessible. Les **13 tables** sont créées automatiquement au démarrage.

**Option A — MySQL local :**

```bash
# S'assurer que MySQL tourne sur le port 3306
mysql -u root -e "CREATE DATABASE IF NOT EXISTS discord_nocode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

**Option B — Docker MySQL (si vous n'avez pas MySQL installé) :**

```bash
docker run -d --name discord-nocode-mysql \
  -e MYSQL_ROOT_PASSWORD="" \
  -e MYSQL_ALLOW_EMPTY_PASSWORD=yes \
  -e MYSQL_DATABASE=discord_nocode \
  -p 3306:3306 \
  mysql:8.0 --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
```

> Les tables (`users`, `workflows`, `bots`, `executions`, `subscriptions`, etc.) sont auto-créées par `server/config/database.js` au premier démarrage du serveur.

---

### 2. Serveur backend

Le serveur Express écoute sur le port **3008** (API REST + WebSocket).

Créez le fichier `server/.env` :

```env
# ── Base de données ──────────────────────────────────
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=discord_nocode

# ── Serveur ──────────────────────────────────────────
PORT=3008
WS_PORT=3008

# ── JWT (CHANGEZ en production !) ────────────────────
JWT_SECRET=changez-cette-clef-secrete
JWT_REFRESH_SECRET=changez-cette-clef-refresh
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ── Chiffrement (exactement 32 caractères) ───────────
ENCRYPTION_KEY=votre-clef-de-32-caracteres-ici!

# ── Discord OAuth ────────────────────────────────────
DISCORD_CLIENT_ID=votre-discord-client-id
DISCORD_CLIENT_SECRET=votre-discord-client-secret
DISCORD_REDIRECT_URI=http://localhost:3008/api/auth/discord/callback
FRONTEND_URL=http://localhost:5173

# ── Limites ──────────────────────────────────────────
MAX_BOTS_PER_USER=3
MAX_NODES_PER_WORKFLOW=50

# ── Stripe (optionnel) ──────────────────────────────
# STRIPE_SECRET_KEY=sk_test_...
# STRIPE_WEBHOOK_SECRET=whsec_...

# ── OpenAI (optionnel — assistant IA) ───────────────
# OPENAI_API_KEY=sk-proj-...
# OPENAI_MODEL=gpt-4o-mini
```

```bash
cd server
npm install
npm run dev   # mode développement (hot-reload)
```

---

### 3. Application frontend

L'application React/Vite écoute sur le port **5173**.

> Par défaut, le frontend pointe vers `http://localhost:3008/api`. Pour modifier, créez `web/.env` :

```env
VITE_API_URL=http://localhost:3008/api
```

```bash
cd web
npm install
npm run dev   # mode développement
```

---

### 4. Image Docker des bots

Chaque instance de bot tourne dans un conteneur Docker basé sur `docker/bot/`.

**Build manuel (optionnel) :**

```bash
cd docker/bot
docker build -t discord-nocode-bot:latest .
```

> L'image est **automatiquement construite** par le serveur lors du premier déploiement d'un bot si elle n'existe pas.

**Contenu de l'image :**
- `node:22-alpine` — runtime Node.js léger
- MariaDB embarqué — chaque bot a sa propre base de données
- `discord.js v14` — interaction avec l'API Discord
- `start.sh` — script d'initialisation (MySQL + Node.js)

**Réseau Docker :**

Le serveur crée automatiquement un réseau Docker `discord-nocode-network` partagé entre tous les conteneurs de bots.

---

### 5. Discord OAuth (optionnel)

Pour activer la connexion/inscription via Discord et la liaison de compte :

1. Allez sur le [Discord Developer Portal](https://discord.com/developers/applications)
2. Créez une application (ou utilisez une existante)
3. Dans **OAuth2 → General** :
   - Ajoutez l'URL de redirection : `http://localhost:3008/api/auth/discord/callback`
4. Copiez le **Client ID** et le **Client Secret**
5. Renseignez dans `server/.env` :

```env
DISCORD_CLIENT_ID=votre-id
DISCORD_CLIENT_SECRET=votre-secret
DISCORD_REDIRECT_URI=http://localhost:3008/api/auth/discord/callback
FRONTEND_URL=http://localhost:5173
```

> Les scopes utilisés sont `identify` et `email`. L'email Discord doit correspondre à l'email d'inscription pour lier un compte existant.

---

### 6. Stripe (optionnel)

Pour activer le système d'abonnement (Free / Pro / Business) :

1. Créez un compte [Stripe](https://stripe.com) et récupérez votre clef API test
2. Configurez un webhook pointant vers `http://localhost:3008/api/subscriptions/webhook`
3. Renseignez dans `server/.env` :

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

> Les produits et prix Stripe sont auto-créés en base à partir de la configuration des plans.

---

### 7. OpenAI (optionnel)

Pour activer l'assistant IA dans l'éditeur de workflow :

1. Créez une clef API sur [OpenAI Platform](https://platform.openai.com/api-keys)
2. Renseignez dans `server/.env` :

```env
OPENAI_API_KEY=sk-proj-...
# OPENAI_MODEL=gpt-4o-mini   # modèle par défaut
```

---

## Démarrage du projet

**1. Démarrer MySQL** (si pas déjà en cours) :

```bash
# MySQL local
sudo systemctl start mysql
# ou via Docker (voir section Configuration)
```

**2. Démarrer le serveur backend :**

```bash
cd server
npm run dev
# ✔ Server running on port 3008
# ✔ Database tables initialized
```

**3. Démarrer le frontend :**

```bash
cd web
npm run dev
# ✔ Local: http://localhost:5173
```

**4. Ouvrir le navigateur** sur `http://localhost:5173`

**5. Créer un compte**, concevoir un workflow, et déployer un bot !

---

## Ports utilisés

| Port      | Service                          | Configurable        |
|-----------|----------------------------------|---------------------|
| **3008**  | API REST + WebSocket (serveur)   | `PORT` dans `.env`  |
| **5173**  | Frontend dev server (Vite)       | `vite.config.ts`    |
| **3306**  | MySQL (base principale)          | `DB_PORT` dans `.env` |
| **9000+** | Node.js des bots (dynamique)     | Auto-attribué       |
| **13306+**| MySQL des bots (dynamique)       | Auto-attribué       |

---

## Structure du projet

```
Discord-NoCode/
├── server/                 # Backend Express (API + WebSocket)
│   ├── index.js            # Point d'entrée serveur
│   ├── package.json
│   ├── .env                # Variables d'environnement
│   ├── config/
│   │   ├── constants.js    # Plans, limites
│   │   └── database.js     # Connexion MySQL + création des tables
│   ├── routes/             # Routes Express (auth, bots, workflows...)
│   ├── controllers/        # Logique des contrôleurs
│   ├── services/           # Services métier
│   │   ├── authService.js      # Authentification (email, Discord OAuth)
│   │   ├── botService.js       # CRUD bots
│   │   ├── dockerService.js    # Gestion Docker (build, run, stop...)
│   │   └── workflowService.js  # CRUD workflows
│   ├── middleware/          # Auth JWT, gestion d'erreurs
│   ├── utils/               # Crypto, JWT, erreurs
│   └── websocket/           # Collaboration temps réel
│
├── web/                    # Frontend React + TypeScript + Vite
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/     # Composants UI (WorkflowCanvas, NodeSidebar...)
│   │   ├── pages/          # Pages (Dashboard, Settings, WorkflowEditor...)
│   │   ├── contexts/       # React Context (Auth, Onboarding, Toast...)
│   │   ├── hooks/          # Hooks custom
│   │   ├── services/       # Client API
│   │   ├── constants/      # Types de noeuds, templates, documentation
│   │   └── i18n/           # Internationalisation (32 langues)
│   ├── package.json
│   └── vite.config.ts
│
├── docker/                 # Image Docker pour les instances de bots
│   └── bot/
│       ├── Dockerfile      # node:22-alpine + MariaDB
│       ├── start.sh        # Script init (MySQL + Node.js)
│       ├── index.js        # Démarrage du bot Discord
│       ├── package.json    # discord.js, mysql2, canvas...
│       ├── handlers/       # Gestion des événements et workflows
│       └── src/            # Commandes et événements Discord
│
└── docs/                   # Documentation et plans de conception
```

---

## Variables d'environnement

### Résumé complet (`server/.env`)

| Variable               | Requis | Description                                      | Défaut                      |
|------------------------|--------|--------------------------------------------------|-----------------------------|
| `DB_HOST`              | ✅      | Hôte MySQL                                        | `localhost`                 |
| `DB_PORT`              | ✅      | Port MySQL                                         | `3306`                      |
| `DB_USER`              | ✅      | Utilisateur MySQL                                  | `root`                      |
| `DB_PASSWORD`          | ✅      | Mot de passe MySQL                                 | (vide)                      |
| `DB_NAME`              | ✅      | Nom de la base de données                          | `discord_nocode`            |
| `PORT`                 | ✅      | Port du serveur API                                | `3008`                      |
| `WS_PORT`              | ✅      | Port WebSocket                                     | `3008`                      |
| `JWT_SECRET`           | ✅      | Clef secrète JWT (accès)                           | —                           |
| `JWT_REFRESH_SECRET`   | ✅      | Clef secrète JWT (refresh)                         | —                           |
| `JWT_EXPIRES_IN`       |        | Durée de vie du token                              | `15m`                       |
| `JWT_REFRESH_EXPIRES_IN`|       | Durée de vie du refresh token                      | `7d`                        |
| `ENCRYPTION_KEY`       | ✅      | Clef de chiffrement (32 caractères)                | —                           |
| `DISCORD_CLIENT_ID`    |        | Client ID Discord OAuth                            | —                           |
| `DISCORD_CLIENT_SECRET`|        | Client Secret Discord OAuth                        | —                           |
| `DISCORD_REDIRECT_URI` |        | URL callback Discord OAuth                         | `http://localhost:3008/api/auth/discord/callback` |
| `FRONTEND_URL`         | ✅      | URL du frontend (redirections OAuth)               | `http://localhost:5173`     |
| `MAX_BOTS_PER_USER`    |        | Limite de bots par utilisateur                     | `3`                         |
| `MAX_NODES_PER_WORKFLOW`|       | Limite de nœuds par workflow                       | `50`                        |
| `STRIPE_SECRET_KEY`    |        | Clef API Stripe (abonnements)                      | —                           |
| `STRIPE_WEBHOOK_SECRET`|        | Secret du webhook Stripe                           | —                           |
| `OPENAI_API_KEY`       |        | Clef API OpenAI (assistant IA)                     | —                           |
| `OPENAI_MODEL`         |        | Modèle OpenAI                                      | `gpt-4o-mini`               |

### Frontend (`web/.env`)

| Variable       | Requis | Description             | Défaut                          |
|---------------|--------|-------------------------|---------------------------------|
| `VITE_API_URL` |        | URL de l'API backend    | `http://localhost:3008/api`     |

---

## FAQ & Dépannage

### Docker n'est pas trouvé / Permission denied

```bash
# Vérifier que Docker est installé et démarré
docker info

# Linux : ajouter votre utilisateur au groupe docker
sudo usermod -aG docker $USER
# (redémarrer la session)
```

### Le serveur ne démarre pas (port 3008 occupé)

```bash
# Le script prestart kill automatiquement le port sur Windows
npm run dev

# Linux/Mac — tuer manuellement le processus
lsof -ti :3008 | xargs kill -9
```

### Erreur de connexion MySQL

```bash
# Vérifier que MySQL tourne
mysql -u root -e "SELECT 1"

# Vérifier la base existe
mysql -u root -e "SHOW DATABASES LIKE 'discord_nocode'"
```

### L'image Docker ne se build pas

```bash
# Build manuellement depuis le dossier docker/bot
cd docker/bot
docker build -t discord-nocode-bot:latest .

# Vérifier que l'image existe
docker images | grep discord-nocode-bot
```

### Le frontend ne se connecte pas à l'API

Vérifiez que :
1. Le serveur backend tourne sur le port 3008
2. L'URL API est correcte dans `web/.env` (ou la valeur par défaut `http://localhost:3008/api`)
3. CORS est activé (par défaut dans le serveur)

### Comment reconstruire l'image des bots après modification ?

```bash
cd docker/bot
docker build -t discord-nocode-bot:latest .
```

Ou depuis l'interface : utilisez le bouton **Redéployer** sur un bot existant, qui reconstruit automatiquement l'image.

---

## Licence

Ce projet est privé. Tous droits réservés.
