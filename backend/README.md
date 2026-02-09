# Nexora — Backend API

> API RESTful Node.js/Express pour la plateforme de réseau social **Nexora**

![Node.js](https://img.shields.io/badge/Node.js-20-green?logo=node.js)
![Express](https://img.shields.io/badge/Express-5.2-blue?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Zod](https://img.shields.io/badge/Validation-Zod_4-3E67B1)

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
│   ├── config/              # Configuration (DB, multer, env, mailer)
│   ├── controllers/         # Logique HTTP (req/res)
│   ├── docs/                # OpenAPI / Swagger UI
│   ├── middlewares/         # Auth, validation, rate-limit
│   ├── models/              # Schémas Mongoose (8 modèles)
│   ├── routes/              # Endpoints Express
│   ├── services/            # Logique métier
│   ├── utils/               # Helpers (asyncHandler, toPublicUser, etc.)
│   ├── validators/          # Schémas Zod
│   ├── app.js               # Configuration Express
│   └── server.js            # Point d'entrée
├── tests/                   # Tests Jest + Supertest
├── uploads/                 # Stockage des fichiers uploadés
├── Dockerfile               # Image Docker (node:20-alpine)
├── .env.example             # Template des variables d'environnement
├── .env.docker              # Variables pour Docker Compose
└── package.json
```

---

## 🛠️ Technologies

| Package | Version | Description |
|---------|---------|-------------|
| **express** | 5.2 | Framework web |
| **mongoose** | 9.1 | ODM MongoDB |
| **jsonwebtoken** | 9.x | Authentification JWT |
| **bcryptjs** | 3.x | Hashage des mots de passe |
| **zod** | 4.x | Validation de schémas |
| **multer** | 2.x | Upload de fichiers |
| **helmet** | 8.x | En-têtes de sécurité HTTP |
| **cors** | 2.x | Cross-Origin Resource Sharing |
| **hpp** | 0.2 | Protection HTTP Parameter Pollution |
| **express-mongo-sanitize** | 2.x | Sanitization NoSQL injection |
| **morgan** | 1.x | Logging HTTP |
| **express-rate-limit** | 8.x | Rate limiting |
| **nodemailer** | 8.x | Envoi d'emails (forgot-password) |
| **swagger-ui-express** | 5.x | Documentation Swagger UI |

### Dev Dependencies

| Package | Description |
|---------|-------------|
| **jest** 30 | Tests unitaires et d'intégration |
| **supertest** 7 | Tests API HTTP |
| **nodemon** | Hot reload en développement |
| **cross-env** | Variables d'env cross-platform |
| **eslint** / **prettier** | Linting et formatage |

---

## 🚀 Installation

### Prérequis
- Node.js >= 20.x
- MongoDB >= 7.x (local ou Docker)

### Installation locale

```bash
cd backend
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (MONGO_URI, JWT_SECRET, etc.)

# Lancer en développement
npm run dev
```

### Avec Docker

```bash
# Depuis la racine du projet
docker-compose up -d

# L'API sera disponible sur http://localhost:4000
# La doc Swagger sur http://localhost:4000/api/docs
```

---

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env` basé sur `.env.example` :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `NODE_ENV` | Environnement (`development` / `production` / `test`) | `development` |
| `PORT` | Port du serveur | `4000` |
| `MONGO_URI` | URI de connexion MongoDB | — |
| `MONGO_URI_TEST` | URI MongoDB pour les tests | — |
| `JWT_SECRET` | Clé secrète JWT (min 32 caractères) | — |
| `JWT_EXPIRES_IN` | Durée de validité du token | `7d` |
| `UPLOAD_DIR` | Dossier des uploads | `uploads` |
| `MAX_FILE_SIZE_MB` | Taille max fichier (Mo) | `10` |
| `ALLOWED_IMAGE_MIME` | Types MIME autorisés | `image/jpeg,image/png,image/webp` |
| `CORS_ORIGINS` | Origines CORS autorisées (séparées par `,`) | `http://localhost:5173` |
| `SMTP_HOST` | Serveur SMTP | — |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Utilisateur SMTP | — |
| `SMTP_PASS` | Mot de passe SMTP | — |
| `LOG_LEVEL` | Niveau de log | `info` |

---

## 📡 Endpoints API

Base URL : `http://localhost:4000/api`

Documentation interactive : `http://localhost:4000/api/docs` (Swagger UI)

### 🔐 Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/auth/register` | Inscription | ❌ |
| `POST` | `/auth/login` | Connexion | ❌ |
| `GET` | `/auth/me` | Profil utilisateur connecté | ✅ |
| `PATCH` | `/auth/change-password` | Changer le mot de passe | ✅ |
| `POST` | `/auth/forgot-password` | Demander un reset de mot de passe | ❌ |
| `POST` | `/auth/reset-password` | Reset du mot de passe (avec token) | ❌ |

### 👤 Utilisateurs (`/api/users`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/users/search?q=xxx&limit=10` | Rechercher des utilisateurs | ✅ |
| `GET` | `/users/suggestions?limit=5` | Utilisateurs suggérés | ✅ |
| `PATCH` | `/users/me` | Modifier son profil (username, bio) | ✅ |
| `PATCH` | `/users/me/privacy` | Modifier la confidentialité (isPrivate) | ✅ |
| `POST` | `/users/me/avatar` | Uploader un avatar | ✅ |
| `POST` | `/users/me/cover` | Uploader une photo de couverture | ✅ |
| `GET` | `/users/:userId` | Profil d'un utilisateur | ✅ |
| `GET` | `/users/:userId/threads` | Threads d'un utilisateur | ✅ |

### 📝 Threads (`/api/threads`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/threads` | Créer un thread | ✅ |
| `GET` | `/threads/trending?limit=5` | Threads tendance | ✅ |
| `GET` | `/threads/me/archived` | Mes threads archivés | ✅ |
| `GET` | `/threads/:threadId` | Thread + réponses (paginé par curseur) | ✅ |
| `POST` | `/threads/:threadId/replies` | Répondre à un thread | ✅ |
| `DELETE` | `/threads/:threadId` | Supprimer un thread | ✅ |
| `DELETE` | `/threads/replies/:replyId` | Supprimer une réponse | ✅ |
| `PATCH` | `/threads/:threadId/visibility` | Modifier la visibilité | ✅ |
| `PATCH` | `/threads/:threadId/archive` | Archiver un thread | ✅ |
| `PATCH` | `/threads/:threadId/unarchive` | Désarchiver un thread | ✅ |

### 👥 Follows (`/api/follows`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/follows/users/:userId/follow` | Suivre un utilisateur | ✅ |
| `DELETE` | `/follows/users/:userId/follow` | Ne plus suivre | ✅ |
| `GET` | `/follows/users/:userId/status` | Statut follow (NONE/PENDING/ACCEPTED) | ✅ |
| `GET` | `/follows/users/:userId/followers` | Liste des followers | ✅ |
| `GET` | `/follows/users/:userId/following` | Liste des following | ✅ |
| `GET` | `/follows/follow-requests` | Demandes de follow reçues | ✅ |
| `POST` | `/follows/follow-requests/:requestId/accept` | Accepter une demande | ✅ |
| `POST` | `/follows/follow-requests/:requestId/reject` | Rejeter une demande | ✅ |

### 👍 Réactions (`/api/reactions`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/reactions/toggle-like` | Like/unlike (thread ou reply) | ✅ |

### 📰 Feed (`/api/feed`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/feed?limit=20&cursor=...` | Fil d'actualité (paginé par curseur) | ✅ |

### 🔔 Notifications (`/api/notifications`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/notifications?limit=20&cursor=...` | Liste des notifications | ✅ |
| `GET` | `/notifications/unread-count` | Nombre de non-lues | ✅ |
| `PATCH` | `/notifications/:notificationId/read` | Marquer comme lue | ✅ |
| `PATCH` | `/notifications/read-all` | Marquer toutes comme lues | ✅ |
| `DELETE` | `/notifications` | Supprimer toutes | ✅ |

### 🔖 Sauvegardes (`/api/saves`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/saves` | Mes threads sauvegardés | ✅ |
| `POST` | `/saves/:threadId` | Sauvegarder un thread | ✅ |
| `DELETE` | `/saves/:threadId` | Retirer de la sauvegarde | ✅ |

### 🔁 Reposts (`/api/reposts`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/reposts` | Mes threads repostés | ✅ |
| `POST` | `/reposts/:threadId` | Reposter un thread | ✅ |
| `DELETE` | `/reposts/:threadId` | Retirer le repost | ✅ |

### 📤 Uploads (`/api/uploads`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/uploads/thread-media` | Uploader un média de thread | ✅ |
| `DELETE` | `/uploads/:filename` | Supprimer un fichier uploadé | ✅ |

### ⚙️ Paramètres (`/api/settings`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/settings/me` | Récupérer mes paramètres | ✅ |
| `PATCH` | `/settings/me` | Modifier mes paramètres | ✅ |

### 🚩 Signalement (`/api/report`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/report` | Signaler un problème (avec screenshot optionnel) | ✅ |

---

## 📊 Modèles de Données

### User
```javascript
{
  username: String,            // Unique, trimmed
  email: String,               // Unique, lowercase, trimmed
  passwordHash: String,        // Hashé avec bcrypt
  passwordChangedAt: Date,     // null par défaut
  resetPasswordToken: String,  // Token reset password
  resetPasswordExpires: Date,  // Expiration du token
  bio: String,                 // "" par défaut
  avatarUrl: String,           // "" par défaut
  coverUrl: String,            // "" par défaut
  isPrivate: Boolean,          // false par défaut
  defaultVisibility: String,   // enum: PUBLIC | FOLLOWERS | PRIVATE
  settings: {
    notificationsPrefs: {
      followRequest: Boolean,  // true
      followAccepted: Boolean, // true
      reply: Boolean,          // true
      likeThread: Boolean,     // true
      likeReply: Boolean,      // true
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Thread
```javascript
{
  authorId: ObjectId,      // ref User, indexé
  content: String,         // max 2000 caractères
  mediaUrls: [String],     // URLs des médias
  visibility: String,      // enum: PUBLIC | FOLLOWERS | PRIVATE
  archivedAt: Date,        // null par défaut
  createdAt: Date,
  updatedAt: Date
}
```

### Reply
```javascript
{
  threadId: ObjectId,      // ref Thread
  authorId: ObjectId,      // ref User
  content: String,         // max 2000 caractères
  createdAt: Date,
  updatedAt: Date
}
```

### Follow
```javascript
{
  followerId: ObjectId,    // Qui suit
  followingId: ObjectId,   // Qui est suivi
  status: String,          // enum: PENDING | ACCEPTED
  createdAt: Date          // Index unique: (followerId, followingId)
}
```

### Reaction
```javascript
{
  userId: ObjectId,        // ref User
  targetType: String,      // enum: THREAD | REPLY
  targetId: ObjectId,      // ID du thread ou de la reply
  type: String,            // enum: LIKE
  createdAt: Date          // Index unique: (userId, targetType, targetId, type)
}
```

### Notification
```javascript
{
  userId: ObjectId,        // Destinataire
  actorId: ObjectId,       // Qui a déclenché
  type: String,            // enum: FOLLOW_REQUEST | FOLLOW_ACCEPTED | REPLY | LIKE_THREAD | LIKE_REPLY
  entityType: String,      // enum: FOLLOW | THREAD | REPLY
  entityId: ObjectId,      // ID de l'entité concernée
  isRead: Boolean,         // false par défaut
  meta: Mixed,             // Payload flexible
  createdAt: Date
}
```

### Save
```javascript
{
  userId: ObjectId,        // ref User
  threadId: ObjectId,      // ref Thread
  createdAt: Date          // Index unique: (userId, threadId)
}
```

### Repost
```javascript
{
  userId: ObjectId,        // ref User
  threadId: ObjectId,      // ref Thread
  createdAt: Date          // Index unique: (userId, threadId)
}
```

---

## 🔒 Sécurité

| Mesure | Implémentation |
|--------|----------------|
| **Authentification** | JWT avec expiration configurable |
| **Hashage** | bcryptjs pour les mots de passe |
| **Validation** | Zod pour toutes les entrées (body, query, params) |
| **Rate Limiting** | express-rate-limit (auth, uploads, écriture) |
| **Headers** | Helmet pour les en-têtes de sécurité |
| **CORS** | Origines configurables via `CORS_ORIGINS` |
| **NoSQL Injection** | express-mongo-sanitize |
| **HPP** | Prévention de la pollution de paramètres |
| **Env Validation** | Fail-fast au démarrage si variables critiques manquantes |

---

## 🧪 Tests

```bash
# Lancer tous les tests (5 suites, 8 tests)
npm test

# Lancer les tests en mode watch
npm run test:watch
```

### Suites de tests

| Suite | Tests | Couverture |
|-------|-------|------------|
| **health** | 2 | GET /health, GET / |
| **auth** | 3 | register, login, me |
| **follows** | 1 | follow request → accept → unfollow |
| **threads** | 1 | create → reply → delete (owner + forbidden) |
| **notifications** | 1 | unread-count → read-all |

---

## 📜 Scripts NPM

| Script | Description |
|--------|-------------|
| `npm start` | Lancer en production (`node src/server.js`) |
| `npm run dev` | Lancer avec nodemon (hot reload) |
| `npm test` | Lancer les tests Jest |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:ci` | Tests pour CI (--runInBand) |

---

## 🌐 Health Check

```bash
curl http://localhost:4000/health
# → {"status":"ok","uptime":123.456}
```

---

## 👨‍💻 Auteur

**Houssam El Motaouakkel** — [@houssam-elmotaouakkel](https://github.com/houssam-elmotaouakkel)
