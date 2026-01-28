# 🚀 Backend API - Plateforme de Réseau Social

> API RESTful Node.js/Express pour la plateforme de réseau social web

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.x-blue?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)

---

## 📋 Table des Matières

- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Endpoints API](#-endpoints-api)
- [Modèles de Données](#-modèles-de-données)
- [Sécurité](#-sécurité)
- [Tests](#-tests)

---

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/              # Configuration (DB, multer, env)
│   ├── constants/           # Constantes et enums
│   ├── controllers/         # Logique HTTP (req/res)
│   ├── middlewares/         # Auth, validation, rate-limit
│   ├── models/              # Schémas Mongoose
│   ├── repositories/        # Accès DB centralisé
│   ├── routes/              # Endpoints Express
│   ├── services/            # Logique métier
│   ├── utils/               # Helpers (asyncHandler, etc.)
│   ├── validators/          # Schémas Zod
│   ├── app.js               # Configuration Express
│   └── server.js            # Point d'entrée
├── tests/                   # Tests Jest
├── uploads/                 # Stockage des fichiers uploadés
├── Dockerfile               # Image Docker
└── package.json
```

---

## 🛠️ Technologies

| Package | Version | Description |
|---------|---------|-------------|
| **express** | 5.x | Framework web |
| **mongoose** | 9.x | ODM MongoDB |
| **jsonwebtoken** | 9.x | Authentification JWT |
| **bcryptjs** | 3.x | Hashage des mots de passe |
| **zod** | 4.x | Validation de schémas |
| **multer** | 2.x | Upload de fichiers |
| **helmet** | 8.x | Sécurité HTTP headers |
| **cors** | 2.x | Cross-Origin Resource Sharing |
| **morgan** | 1.x | Logging HTTP |
| **express-rate-limit** | 8.x | Rate limiting |

### Dev Dependencies
- **jest** - Tests unitaires
- **supertest** - Tests API
- **nodemon** - Hot reload
- **eslint** / **prettier** - Linting et formatage

---

## 🚀 Installation

### Prérequis
- Node.js >= 20.x
- MongoDB >= 7.x (local ou Docker)

### Installation locale

```bash
# Cloner et accéder au dossier
cd backend

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Lancer en développement
npm run dev
```

### Avec Docker

```bash
# Depuis la racine du projet
docker-compose up -d

# L'API sera disponible sur http://localhost:4000
```

---

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env` basé sur `.env.example` :

```env
# Server
NODE_ENV=development
PORT=4000

# Database
MONGO_URI=mongodb://127.0.0.1:27017/social
# Ou avec Docker: mongodb://root:rootpass@mongo:27017/social?authSource=admin

# JWT
JWT_SECRET=votre_secret_tres_long_et_aleatoire
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=10
ALLOWED_IMAGE_MIME=image/jpeg,image/png,image/webp

# CORS
CORS_ORIGIN=http://localhost:5173

# Logging
LOG_LEVEL=info
```

---

## 📡 Endpoints API

Base URL: `http://localhost:4000/api`

### 🔐 Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/auth/register` | Inscription | ❌ |
| `POST` | `/auth/login` | Connexion | ❌ |
| `GET` | `/auth/me` | Profil utilisateur connecté | ✅ |

### 👤 Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/users/:userId` | Profil d'un utilisateur | ✅ |
| `PATCH` | `/users/me` | Modifier son profil | ✅ |
| `PATCH` | `/users/me/privacy` | Modifier ses paramètres de confidentialité | ✅ |
| `POST` | `/users/me/avatar` | Uploader un avatar | ✅ |

### 📝 Threads (`/api/threads`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/threads` | Créer un thread | ✅ |
| `GET` | `/threads/:threadId` | Récupérer un thread avec ses réponses | ✅ |
| `POST` | `/threads/:threadId/replies` | Répondre à un thread | ✅ |
| `DELETE` | `/threads/:threadId` | Supprimer un thread | ✅ |

### 👥 Follows (`/api/`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/users/:userId/follow` | Suivre un utilisateur | ✅ |
| `DELETE` | `/users/:userId/follow` | Ne plus suivre | ✅ |
| `GET` | `/users/:userId/followers` | Liste des followers | ✅ |
| `GET` | `/users/:userId/following` | Liste des following | ✅ |
| `GET` | `/follow-requests` | Demandes de follow reçues | ✅ |
| `POST` | `/follow-requests/:requestId/accept` | Accepter une demande | ✅ |
| `POST` | `/follow-requests/:requestId/reject` | Rejeter une demande | ✅ |

### 👍 Réactions (`/api/`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/threads/:threadId/reactions` | Réagir à un thread | ✅ |
| `DELETE` | `/threads/:threadId/reactions` | Supprimer sa réaction | ✅ |

### 📰 Feed (`/api/`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/feed` | Fil d'actualité | ✅ |

### 🔔 Notifications (`/api/`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/notifications` | Liste des notifications | ✅ |
| `PATCH` | `/notifications/:notificationId/read` | Marquer comme lue | ✅ |
| `PATCH` | `/notifications/read-all` | Marquer toutes comme lues | ✅ |

### 📤 Uploads (`/api/`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/upload` | Uploader un fichier | ✅ |

### ⚙️ Paramètres (`/api/`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/settings` | Récupérer les paramètres | ✅ |
| `PATCH` | `/settings` | Modifier les paramètres | ✅ |

---

## 📊 Modèles de Données

### User
```javascript
{
  username: String,       // Unique
  email: String,          // Unique
  password: String,       // Hashé avec bcrypt
  displayName: String,
  bio: String,
  avatar: String,         // URL de l'image
  isPrivate: Boolean,     // Compte privé
  createdAt: Date,
  updatedAt: Date
}
```

### Thread
```javascript
{
  author: ObjectId,       // Référence User
  content: String,
  visibility: String,     // 'public' | 'private'
  createdAt: Date,
  updatedAt: Date
}
```

### Reply
```javascript
{
  thread: ObjectId,       // Référence Thread
  author: ObjectId,       // Référence User
  content: String,
  createdAt: Date
}
```

### Follow
```javascript
{
  follower: ObjectId,     // Qui suit
  following: ObjectId,    // Qui est suivi
  status: String,         // 'pending' | 'accepted'
  createdAt: Date
}
```

### Reaction
```javascript
{
  thread: ObjectId,       // Référence Thread
  user: ObjectId,         // Référence User
  type: String,           // 'like' | 'love' | etc.
  createdAt: Date
}
```

### Notification
```javascript
{
  recipient: ObjectId,    // Destinataire
  sender: ObjectId,       // Expéditeur
  type: String,           // 'follow' | 'like' | 'reply' | etc.
  thread: ObjectId,       // Optionnel
  isRead: Boolean,
  createdAt: Date
}
```

---

## 🔒 Sécurité

| Mesure | Implémentation |
|--------|----------------|
| **Authentification** | JWT avec expiration configurable |
| **Hashage** | bcryptjs pour les mots de passe |
| **Validation** | Zod pour toutes les entrées |
| **Rate Limiting** | 300 requêtes / 15 min |
| **Headers** | Helmet pour les headers de sécurité |
| **CORS** | Configuré pour le frontend |

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch
npm run test:watch

# Couverture de code
npm run test:coverage
```

---

## 📜 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm start` | Lancer en production |
| `npm run dev` | Lancer avec nodemon (hot reload) |
| `npm test` | Lancer les tests Jest |

---

## 🌐 Health Check

```bash
# Vérifier que l'API fonctionne
curl http://localhost:4000/health

# Réponse attendue
{"status":"ok","uptime":123.456}
```

---

## 👨‍💻 Auteur

**Houssam El Motaouakkel** - [@houssam-elmotaouakkel](https://github.com/houssam-elmotaouakkel)
