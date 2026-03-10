# Discord NoCode Bot Builder - Design Document

**Date**: 2026-03-10
**Auteur**: Claude Sonnet 4.6
**Version**: 1.0

## Overview

Plateforme no-code pour créer des bots Discord via un canvas visuel interactif (style n8N).
Architecture frontend React avec backend NodeJS/Express/MySQL/WebSocket.

## Architecture Générale

**Frontend (/web)**: Application React avec routing pour Login, Register, Landing Page, Dashboard.
Palette bleu moderne (#1e3a8a, #3b82f6, #60a5fa, #93c5fd, #dbeafe).
Utilise TailwindCSS pour le styling, Motion pour les animations, Lucide Icons pour les icônes.
Librairie React Flow pour le canvas interactif (similaire à n8N).

**Backend (/server)**: API REST Express + WebSocket pour le temps réel.
MySQL2 pour la persistance des données.
Le backend exécute complètement les workflows et gère les connexions Discord via discord.js.
Architecture modulaire avec séparation claire entre authentification, gestion des workflows,
exécution des bots, et gestion WebSocket.

**Flux de données**: Les workflows sont sauvegardés en JSON dans MySQL, exécutés côté
backend via un moteur de règles. WebSocket notifie le frontend en temps réel de l'état
d'exécution, des logs et des erreurs. Chaque instance de bot tourne isolément
(1 instance = 1 bot) avec son propre contexte d'exécution.

**Authentification**: Email + Password + Discord OAuth2.

**Connexion bots**: Token Discord direct (utilisateur crée bot sur Discord, colle token).

## Frontend Architecture

**Pages**:
- **Landing Page**: Hero section moderne, features grid, CTA vers register/login
- **Auth**: Login form (email/password ou Discord OAuth), Register form avec validation
- **Dashboard**: Layout avec sidebar (navigation, workflows list), main content area
- **Workflow Editor**: Canvas interactif avec sidebar de nœuds, toolbar (save, test, deploy), properties panel

**Workflow Canvas**:
- Utilise React Flow pour drag & drop, pan, zoom, connexions
- Sidebar avec catégories: Triggers Discord, Logique, HTTP/API, Actions Discord
- Nœud principal "Core Bot" obligatoire (configuration token, prefix, status)
- Lignes de connexion SVG animées montrant le flux de données
- Gestion avancée: groupes (commentaires), undo/redo, save auto, export/import JSON

**État React**:
- Context global pour auth, workflows list, notifications
- Local state pour canvas (nœuds, connexions, sélection)
- WebSocket client pour notifications temps réel

## Backend Architecture

**Structure**:
- `server/index.js`: Point d'entrée Express + WebSocket server
- `server/routes/`: API REST (auth, workflows, bots, users)
- `server/websocket/`: Gestion WebSocket (notifications, execution logs)
- `server/services/`: Logique métier (AuthService, WorkflowService, DiscordService)
- `server/models/`: Schémas MySQL
- `server/execution/`: Moteur d'exécution des workflows

**API REST Endpoints**:
- `POST /api/auth/register` - Création utilisateur
- `POST /api/auth/login` - Connexion (JWT token)
- `POST /api/auth/discord` - Discord OAuth callback
- `GET /api/workflows` - Lister workflows user
- `POST /api/workflows` - Créer workflow
- `GET /api/workflows/:id` - Détails workflow
- `PUT /api/workflows/:id` - Modifier workflow
- `DELETE /api/workflows/:id` - Supprimer workflow
- `POST /api/workflows/:id/deploy` - Déployer workflow sur bot
- `POST /api/bots/:id/start` - Démarrer instance bot
- `POST /api/bots/:id/stop` - Arrêter instance bot

**WebSocket Events**:
- `workflow:status` - État d'exécution workflow
- `bot:log` - Logs bot en temps réel
- `notification` - Notifications utilisateur

## Base de Données MySQL

**Tables principales**:

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    discord_id VARCHAR(255) UNIQUE,
    discord_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    discord_token TEXT NOT NULL,
    status ENUM('active', 'stopped', 'errored') DEFAULT 'stopped',
    workflow_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workflow_id) REFERENCES workflows(id)
);

CREATE TABLE workflows (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    nodes JSON NOT NULL,
    connections JSON NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE executions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    workflow_id INT NOT NULL,
    bot_id INT,
    status ENUM('running', 'completed', 'failed') DEFAULT 'running',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    logs JSON,
    FOREIGN KEY (workflow_id) REFERENCES workflows(id),
    FOREIGN KEY (bot_id) REFERENCES bots(id)
);

CREATE TABLE nodes_catalog (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    config_schema JSON NOT NULL,
    icon VARCHAR(255),
    description TEXT
);
```

**Schéma relationnel**:
- user → bots (1:N)
- user → workflows (1:N)
- workflow → bot (1:1 via workflow_id)
- workflow → executions (1:N)
- execution → bot (N:1 via bot_id)

**Index**: email unique, discord_id unique, user_id indexes sur bots/workflows

## Types de Nœuds et Triggers

### Triggers Discord
- `messageCreate`: Message reçu dans un channel
- `messageUpdate`: Message modifié
- `messageDelete`: Message supprimé
- `reactionAdd`: Réaction ajoutée
- `reactionRemove`: Réaction supprimée
- `guildMemberAdd`: Membre rejoint serveur
- `guildMemberRemove`: Membre quitté serveur
- `voiceStateUpdate`: Utilisateur rejoint/quitte vocal
- `interactionCreate`: Commande slash, bouton, select menu

### Logique de base
- `condition`: If/Else avec conditions
- `switch`: Multiple conditions
- `delay`: Attendre X secondes/millisecondes
- `loop`: Boucle sur array
- `variable`: Stocker/récupérer variable
- `random`: Générer nombre/aléatoire

### Actions HTTP/API
- `httpRequest`: GET/POST/PUT/DELETE
- `webhook`: Envoyer payload à URL
- `parseJson`: Parser réponse JSON

### Actions Discord (DiscordJS v14/v15)
- `sendMessage`: Envoyer message (text, embed, components)
- `editMessage`: Modifier message
- `deleteMessage`: Supprimer message
- `createRole`: Créer/modifier/supprimer rôle
- `addRole`: Ajouter rôle à membre
- `removeRole`: Retirer rôle
- `kickMember`: Kick membre
- `banMember`: Ban membre
- `createChannel`: Créer channel
- `deleteChannel`: Supprimer channel
- Toutes les autres actions DiscordJS disponibles

**Nœud Core Bot**: Configuration obligatoire avec token, prefix, status, intents

## Moteur d'Exécution Workflows

**Architecture exécution**:
- Un Worker Node.js par instance de bot (1:1)
- Queue d'exécution des workflows via Bull/Redis (optionnel pour MVP)
- Moteur de règles traverse les nœuds suivant les connexions
- Contexte d'exécution isolé par bot avec variables persistantes

**Cycle de vie**:
1. User déploye workflow → Backend valide → Crée/Update instance bot
2. Worker démarre bot DiscordJS avec token
3. Bot écoute triggers Discord → Event reçu → Déclenche workflow
4. Moteur traverse nœuds séquentiellement selon connexions
5. WebSocket envoie logs/progression au frontend
6. Exécution terminée → Sauvegarde logs dans MySQL
7. User peut voir exécutions historiques et détails

**Gestion erreurs**:
- Try/catch sur chaque nœud avec fallback
- Log erreur dans execution record
- Notification WebSocket à l'utilisateur
- Arrêt gracieux du bot sur erreur critique

**Gestion variables**:
- Variables globales par bot (persistantes)
- Variables locales par exécution
- Accessibles dans tous les nœuds via `${variableName}`

## Couleurs et Style Moderne

**Palette Bleu**:
- Primary: `#1e3a8a` (Dark Blue) - Headers, boutons principaux
- Secondary: `#3b82f6` (Blue) - Actions secondaires, liens
- Accent: `#60a5fa` (Light Blue) - Highlights, active states
- Background: `#dbeafe` (Very Light Blue) - Subtle backgrounds
- Success: `#10b981` (Green) - Success messages
- Warning: `#f59e0b` (Amber) - Warnings
- Error: `#ef4444` (Red) - Errors
- Text: `#1e293b` (Slate) - Primary text
- Text-muted: `#64748b` (Slate Light) - Secondary text

**Style**:
- Rounded corners: `md` (8px) pour cards, `lg` (16px) pour buttons
- Shadows: Subtle `shadow-sm` pour depth
- Typography: Inter ou system font
- Spacing: Tailwind spacing scale

**Canvas colors**:
- Nodes: White background with colored borders par catégorie
- Connections: Animated SVG lines, blue color
- Grid: Subtle light blue background pattern

## Sécurité et Configuration

**Sécurité**:
- Passwords: bcrypt hash (10 rounds)
- JWT: Access tokens (15min) + Refresh tokens (7d)
- Discord tokens: Encrypted AES-256 dans MySQL
- Rate limiting: Express-rate-limit sur API
- CORS: Configuration stricte
- Input validation: Zod sur tous les payloads
- SQL injection: Prepared statements via MySQL2

**Configuration**:
- `.env`: DB_URL, JWT_SECRET, ENCRYPTION_KEY, PORT, WS_PORT
- Discord bot intents: Configurables dans nœud Core
- Maximum bots par user: Configurable (défaut: 3)
- Maximum nodes par workflow: Configurable (défaut: 50)

**Développement**:
- Vite dev server (http://localhost:5173)
- Express backend (http://localhost:3000)
- WebSocket (ws://localhost:3000/ws)
- MySQL (localhost:3306)

## Dépendances

### Frontend
- React 19.2.0
- React Router 7.13.1
- TailwindCSS 4.2.1
- Motion 12.35.2
- Lucide React 0.577.0
- React Flow (à installer)

### Backend
- Express
- ws (WebSocket)
- MySQL2
- bcrypt
- jsonwebtoken
- discord.js v14/v15
- dotenv
- cors
- express-rate-limit
- zod

## Prochaines Étapes

1. Initialiser le backend NodeJS dans /server
2. Créer la structure de base du frontend
3. Implémenter l'authentification
4. Créer le canvas de workflows
5. Implémenter le moteur d'exécution
6. Connecter WebSocket pour temps réel
7. Tests et déploiement
