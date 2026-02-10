# Nexora — Plateforme de Réseau Social Web

> **Projet Fédérateur Full-Stack – JobInTech Rabat 2025**

Une plateforme de réseau social web moderne et performante, développée dans le cadre du projet de fin de formation Full-Stack.

![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-5.2-blue?logo=express)
![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Media_Storage-3448C5?logo=cloudinary)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?logo=render)

---

## 📋 Table des Matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Déploiement](#-déploiement)
- [Variables d'Environnement](#-variables-denvironnement)
- [Documentation API](#-documentation-api)
- [Tests](#-tests)
- [Internationalisation](#-internationalisation)
- [Contribution](#-contribution)

---

## 🎯 Présentation

**Nexora** est une plateforme de réseau social web qui permet aux utilisateurs de :
- Créer et gérer leur profil (avatar, couverture, bio)
- Publier des threads avec médias (images stockées sur Cloudinary)
- Interagir avec le contenu (likes, réponses, reposts, sauvegardes)
- Gérer la visibilité de leurs publications (public, abonnés, privé)
- Suivre d'autres utilisateurs (avec système de demandes pour les profils privés)
- Recevoir des notifications (likes, réponses, follows, reposts)
- Rechercher des utilisateurs
- Archiver leurs propres threads
- Naviguer dans une interface multilingue (Français, English, العربية)

Le projet est conçu avec une **architecture moderne et scalable**, répondant aux standards professionnels.

---

## ✨ Fonctionnalités

### 👤 Gestion des Utilisateurs
- Inscription et authentification sécurisée (JWT)
- Profils personnalisables : avatar, photo de couverture et bio
- Comptes publics ou privés
- Système de followers/following avec demandes d'abonnement
- Utilisateurs suggérés & recherche d'utilisateurs en temps réel

### 📝 Threads & Publications
- Création de threads avec texte et médias (images)
- Stockage des médias sur **Cloudinary** (persistant, CDN global)
- Réponses paginées par curseur
- Système de visibilité à 3 niveaux : Public, Abonnés, Privé
- Visibilité par défaut configurable dans les paramètres
- Archivage / désarchivage de threads
- Threads tendance (trending)

### 💬 Interactions Sociales
- Likes (threads & réponses)
- Reposts
- Sauvegardes (bookmarks)
- Fil d'actualité personnalisé (feed)

### 🔔 Notifications
- Notifications pour les likes, réponses, follows, demandes de follow et reposts
- Notification `NEW_FOLLOWER` pour les comptes publics
- Notification `FOLLOW_REQUEST` pour les comptes privés
- Compteur de non-lues & marquage lu

### 🔍 Recherche
- Recherche d'utilisateurs en temps réel (debounced)
- Résultats avec avatar, username et bio

### ⚙️ Paramètres
- Modification du profil (username, bio)
- Gestion de la confidentialité (compte privé)
- Visibilité par défaut des threads
- Préférences de notifications
- Thème clair / sombre
- Langue : Français, English, العربية

### 🔒 Sécurité
- Authentification JWT (access token)
- Rate limiting (express-rate-limit)
- Protection CORS configurable
- Helmet (en-têtes de sécurité)
- Validation et sanitization des données (Zod 4)
- Protection HPP (HTTP Parameter Pollution)
- Sanitization MongoDB personnalisée (compatible Express 5)

---

## 🏗️ Architecture

```
Web_Social_Networking_Platform/
├── backend/                 # API REST Express 5
│   ├── src/
│   │   ├── config/          # DB, multer, cloudinary, mailer
│   │   ├── controllers/     # Logique HTTP
│   │   ├── docs/            # OpenAPI / Swagger
│   │   ├── middlewares/     # Auth, validation, rate-limit
│   │   ├── models/          # Schémas Mongoose
│   │   ├── routes/          # Définition des routes (12 groupes)
│   │   ├── services/        # Logique métier
│   │   ├── utils/           # Helpers
│   │   └── validators/      # Schémas Zod
│   ├── tests/               # Tests Jest + Supertest
│   └── Dockerfile
├── frontend/                # SPA React 19
│   ├── src/
│   │   ├── api/             # Clients Axios par resource
│   │   ├── components/      # Composants UI réutilisables
│   │   ├── contexts/        # Auth, Theme, Compose, Panel, Badge
│   │   ├── hooks/           # Hooks personnalisés
│   │   ├── i18n/            # Traductions (en, fr, ar)
│   │   ├── pages/           # Pages de l'application
│   │   └── utils/           # Helpers front
│   └── vite.config.js
├── docker-compose.yml       # MongoDB + API (développement)
├── render.yaml              # Déploiement Render (frontend Static Site)
└── README.md
```

---

## 🛠️ Stack Technique

### Backend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **Node.js** | 20+ | Runtime JavaScript |
| **Express** | 5.2 | Framework web |
| **MongoDB** | 7 | Base de données NoSQL |
| **Mongoose** | 9.1 | ODM MongoDB |
| **Cloudinary** | 2.9 | Stockage et CDN d'images |
| **JWT** | — | Authentification |
| **Zod** | 4 | Validation de schémas |
| **Multer** | 2 | Upload de fichiers (memoryStorage → Cloudinary) |
| **Helmet** | 8 | En-têtes de sécurité |
| **Morgan** | 1.10 | Logging HTTP |
| **Nodemailer** | 8 | Envoi d'emails |
| **Jest** | 30 | Framework de tests |
| **Supertest** | 7 | Tests HTTP |

### Frontend

| Technologie | Version | Description |
|-------------|---------|-------------|
| **React** | 19.2 | Bibliothèque UI |
| **Vite** | 7 (rolldown) | Bundler |
| **React Router** | 7.13 | Routage SPA |
| **Tailwind CSS** | 4 | Framework CSS utility-first |
| **Axios** | 1.13 | Client HTTP |
| **Lucide React** | 0.563 | Icônes |
| **react-i18next** | 16 | Internationalisation |
| **react-hot-toast** | 2.6 | Notifications toast |
| **date-fns** | 4 | Formatage de dates |

### Infrastructure

| Outil | Description |
|-------|-------------|
| **Docker** | Conteneurisation (développement) |
| **Docker Compose** | Orchestration (MongoDB + API) |
| **Cloudinary** | Stockage cloud d'images (CDN) |
| **Render** | Hébergement production (Web Service + Static Site) |

---

## 📦 Prérequis

- **Node.js** >= 20.x
- **npm** >= 9.x
- **MongoDB** >= 7.x (ou via Docker)
- **Docker & Docker Compose** (optionnel, recommandé pour le développement)
- **Compte Cloudinary** (gratuit — 25 GB stockage + 25 GB bande passante/mois)

---

## 🚀 Installation

### Option 1 : Avec Docker (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/houssam-elmotaouakkel/Web_Social_Networking_Platform.git
cd Web_Social_Networking_Platform

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (MongoDB root user / password)

# 3. Configurer le backend pour Docker
# Éditer backend/.env.docker (JWT_SECRET, SMTP, Cloudinary)

# 4. Lancer les services
docker-compose up -d

# L'API sera disponible sur http://localhost:4000
# La doc Swagger sur http://localhost:4000/api/docs
```

### Option 2 : Installation Manuelle

```bash
# 1. Cloner le repository
git clone https://github.com/houssam-elmotaouakkel/Web_Social_Networking_Platform.git
cd Web_Social_Networking_Platform

# 2. Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs (MONGO_URI, JWT_SECRET, Cloudinary, etc.)
npm run dev

# 3. Frontend (dans un autre terminal)
cd frontend
npm install
npm run dev
```

Le frontend sera disponible sur `http://localhost:5173` et proxie automatiquement `/api` vers le backend sur le port `4000`.

---

## 🌐 Déploiement

Le projet est déployé sur **Render** :

| Service | Type | URL |
|---------|------|-----|
| **Backend API** | Web Service | `https://web-social-networking-platform-backend.onrender.com` |
| **Frontend** | Static Site | `https://nexora-frontend-2b3b.onrender.com` |

### Configuration Render

- **Backend** : déployé comme Web Service Node.js
  - Variables d'environnement : `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_*`, `CORS_ORIGIN`, etc.
- **Frontend** : déployé comme Static Site via `render.yaml`
  - Build command : `npm install && npm run build`
  - Publish directory : `./dist`
  - Variable : `VITE_API_URL` pointant vers l'URL du backend

### Stockage d'images

Les images (avatars, couvertures, médias de threads) sont stockées sur **Cloudinary** :
- Avatars → dossier `nexora/avatars` (crop 400×400, gravité face)
- Couvertures → dossier `nexora/covers` (crop 1200×400)
- Médias de threads → dossier `nexora/threads`

---

## 🔐 Variables d'Environnement

### Racine (`.env`) — utilisé par Docker Compose

| Variable | Description | Défaut |
|----------|-------------|--------|
| `MONGO_ROOT_USER` | Utilisateur root MongoDB | — |
| `MONGO_ROOT_PASSWORD` | Mot de passe root MongoDB | — |
| `MONGO_DATABASE` | Nom de la base de données | `social` |

### Backend (`backend/.env`)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement (development/production/test) | `development` |
| `PORT` | Port du serveur | `4000` |
| `MONGO_URI` | URI de connexion MongoDB | — |
| `MONGO_URI_TEST` | URI MongoDB pour les tests | — |
| `JWT_SECRET` | Clé secrète JWT (min 32 caractères) | — |
| `JWT_EXPIRES_IN` | Durée de validité du token | `7d` |
| `MAX_FILE_SIZE_MB` | Taille max fichier (Mo) | `10` |
| `ALLOWED_IMAGE_MIME` | Types MIME autorisés | `image/jpeg,image/png,image/webp` |
| `CORS_ORIGIN` | Origines CORS autorisées (séparées par `,`) | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` | Nom du cloud Cloudinary | — |
| `CLOUDINARY_API_KEY` | Clé API Cloudinary | — |
| `CLOUDINARY_API_SECRET` | Secret API Cloudinary | — |
| `SMTP_HOST` | Serveur SMTP | — |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | — |
| `SMTP_PASS` | Mot de passe SMTP | — |
| `LOG_LEVEL` | Niveau de log | `info` |

### Frontend (`frontend/.env` — optionnel)

| Variable | Description | Défaut |
|----------|-------------|--------|
| `VITE_API_URL` | URL de base de l'API backend | `/api` (via proxy Vite) |

---

## 📚 Documentation API

| Documentation | URL |
|---------------|-----|
| **Swagger UI** | `http://localhost:4000/api/docs` |
| **OpenAPI JSON** | `http://localhost:4000/api/openapi.json` |
| **Backend README** | [backend/README.md](./backend/README.md) |

### Endpoints principaux

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Inscription |
| `POST` | `/api/auth/login` | Connexion |
| `GET` | `/api/auth/me` | Profil connecté |
| `GET` | `/api/feed` | Fil d'actualité |
| `POST` | `/api/threads` | Créer un thread |
| `GET` | `/api/threads/:id` | Détail + réponses |
| `GET` | `/api/threads/trending` | Threads tendance |
| `POST` | `/api/follows/users/:id/follow` | Suivre un utilisateur |
| `GET` | `/api/notifications` | Liste des notifications |
| `GET` | `/api/users/search?q=xxx` | Rechercher des utilisateurs |
| `GET` | `/api/users/:id` | Profil utilisateur |
| `GET` | `/api/saves` | Threads sauvegardés |
| `GET` | `/api/reposts` | Threads repostés |
| `PATCH` | `/api/settings/me` | Modifier ses paramètres |

---

## 🧪 Tests

```bash
# Tests Backend (Jest + Supertest)
cd backend
npm test

# 5 suites — 8 tests : auth, follows, threads, notifications, health
```

---

## 🌍 Internationalisation

L'interface est disponible en 3 langues, sélectionnables dans les paramètres :

| Langue | Code | Direction |
|--------|------|-----------|
| Français | `fr` | LTR |
| English | `en` | LTR |
| العربية | `ar` | RTL |

---

## 👥 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add: AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

---

## 📄 Licence

Ce projet est réalisé dans le cadre de la formation **JobInTech Rabat 2025**.

---

## 👨‍💻 Auteur

**Houssam El Motaouakkel** — [@houssam-elmotaouakkel](https://github.com/houssam-elmotaouakkel)
