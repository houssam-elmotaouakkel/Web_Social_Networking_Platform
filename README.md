# 🌐 Plateforme de Réseau Social Web

> **Projet Fédérateur Full-Stack – JobInTech Rabat 2025**

Une plateforme de réseau social web moderne et performante, développée dans le cadre du projet de fin de formation Full-Stack.

![Node.js](https://img.shields.io/badge/Node.js-18+-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-7-green?logo=mongodb)
![Express](https://img.shields.io/badge/Express-5-blue?logo=express)
![React](https://img.shields.io/badge/React-18+-blue?logo=react)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)

---

## 📋 Table des Matières

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack Technique](#-stack-technique)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Documentation](#-documentation)
- [Contribution](#-contribution)

---

## 🎯 Présentation

Cette plateforme de réseau social web permet aux utilisateurs de :
- Créer et gérer leur profil
- Publier des threads (posts)
- Interagir avec le contenu (réactions, réponses)
- Suivre d'autres utilisateurs
- Recevoir des notifications en temps réel

Le projet est conçu avec une **architecture moderne et scalable**, répondant aux standards académiques et aux attentes du monde professionnel.

---

## ✨ Fonctionnalités

### 👤 Gestion des Utilisateurs
- Inscription et authentification sécurisée (JWT)
- Profils personnalisables avec avatar
- Système de followers/following

### 📝 Threads & Publications
- Création, modification et suppression de threads
- Réponses et fils de discussion
- Système de visibilité (public/privé)

### 💬 Interactions Sociales
- Réactions (like, love, etc.)
- Système de commentaires imbriqués
- Partage de contenu

### 🔔 Notifications
- Notifications en temps réel
- Alertes pour les nouvelles interactions
- Gestion des préférences de notification

### 🔒 Sécurité
- Authentification JWT
- Rate limiting
- Protection CORS
- Validation des données (Zod)

---

## 🏗️ Architecture

```
Web_Social_Networking_Platform/
├── backend/                 # API REST Node.js/Express
│   ├── src/
│   │   ├── config/         # Configuration (DB, env, logger)
│   │   ├── models/         # Schémas Mongoose
│   │   ├── controllers/    # Logique HTTP
│   │   ├── services/       # Logique métier
│   │   ├── routes/         # Endpoints Express
│   │   ├── middlewares/    # Auth, validation, errors
│   │   ├── validators/     # Schémas Zod
│   │   └── utils/          # Helpers (JWT, pagination)
│   └── README.md           # Documentation Backend
│
├── frontend/               # Application React SPA
│   └── README.md           # Documentation Frontend
│
├── docker-compose.yml      # Orchestration des services
└── README.md               # Ce fichier
```

---

## 🛠️ Stack Technique

### Backend
| Technologie | Version | Description |
|-------------|---------|-------------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 5.x | Framework web |
| **MongoDB** | 7.x | Base de données NoSQL |
| **Mongoose** | 9.x | ODM MongoDB |
| **JWT** | - | Authentification |
| **Zod** | 4.x | Validation de schémas |
| **Multer** | 2.x | Upload de fichiers |

### Frontend
| Technologie | Description |
|-------------|-------------|
| **React** | Bibliothèque UI |
| **SPA** | Single Page Application |

### DevOps
| Outil | Description |
|-------|-------------|
| **Docker** | Conteneurisation |
| **Docker Compose** | Orchestration |

---

## 📦 Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **MongoDB** >= 7.x (ou Docker)
- **Docker & Docker Compose** (optionnel, recommandé)

---

## 🚀 Installation

### Option 1: Avec Docker (Recommandé)

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/Web_Social_Networking_Platform.git
cd Web_Social_Networking_Platform

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Lancer les services
docker-compose up -d

# L'API sera disponible sur http://localhost:4000
```

### Option 2: Installation Manuelle

```bash
# 1. Cloner le repository
git clone https://github.com/votre-username/Web_Social_Networking_Platform.git
cd Web_Social_Networking_Platform

# 2. Installer les dépendances Backend
cd backend
npm install
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Lancer le serveur de développement
npm run dev

# 4. (Dans un autre terminal) Installer et lancer le Frontend
cd ../frontend
npm install
npm run dev
```

### Variables d'Environnement

Créez un fichier `.env` à la racine et dans le dossier `backend/` :

```env
# MongoDB
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_password
MONGO_DATABASE=social
```

Voir les fichiers `.env.example` pour la liste complète des variables.

---

## 📚 Documentation

| Documentation | Lien |
|---------------|------|
| **Backend API** | [backend/README.md](./backend/README.md) |
| **Frontend** | [frontend/README.md](./frontend/README.md) |
| **API Swagger** | `/api/docs` (en développement) |

---

## 🧪 Tests

```bash
# Tests Backend
cd backend
npm test

# Tests Frontend
cd frontend
npm test
```

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

## 🤝 Auteurs

**Équipe Full-Stack JobInTech Rabat 2025**

---

<p align="center">
  Développé avec ❤️ pour le projet de fin de formation
</p>
