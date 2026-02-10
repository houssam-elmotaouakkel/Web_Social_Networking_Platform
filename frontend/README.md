# Nexora — Frontend

> Interface utilisateur React pour la plateforme de réseau social **Nexora**

![React](https://img.shields.io/badge/React-19.2-blue?logo=react)
![Vite](https://img.shields.io/badge/Vite-7_(rolldown)-purple?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)
![i18n](https://img.shields.io/badge/i18n-FR_EN_AR-orange)

---

## 📋 Table des Matières

- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Pages & Fonctionnalités](#-pages--fonctionnalités)
- [Composants](#-composants)
- [Internationalisation](#-internationalisation)
- [Scripts](#-scripts)

---

## 🏗️ Architecture

```
frontend/
+-- public/
|   +-- nexora-icon.png       # Favicon
|   +-- vite.svg
+-- src/
|   +-- api/                  # Clients Axios par resource (13 fichiers)
|   |   +-- client.js         # Instance Axios de base (/api)
|   |   +-- auth.api.js       # Register, login, me, change-password
|   |   +-- feed.api.js       # Fil d'actualité
|   |   +-- follows.api.js    # Follow/unfollow, requests
|   |   +-- notifications.api.js
|   |   +-- reactions.api.js  # Like/unlike
|   |   +-- report.api.js     # Signalement de problème
|   |   +-- reposts.api.js    # Reposts
|   |   +-- saves.api.js      # Sauvegardes (bookmarks)
|   |   +-- settings.api.js   # Paramètres utilisateur
|   |   +-- threads.api.js    # CRUD threads, replies, visibility, archive
|   |   +-- uploads.api.js    # Upload/suppression de médias
|   |   +-- users.api.js      # Profil, avatar, couverture, recherche
|   +-- components/
|   |   +-- auth/             # ProtectedRoute
|   |   +-- feed/             # FeedItem, FeedList
|   |   +-- follows/          # FollowButton, FollowList
|   |   +-- layout/           # Sidebar, MobileNav, MainLayout
|   |   +-- notifications/    # NotificationItem, NotificationList
|   |   +-- panel/            # RightPanel, TrendingThreads, SuggestedUsers
|   |   +-- profile/          # ProfileHeader, ProfileStats
|   |   +-- reactions/        # LikeButton, RepostButton, SaveButton
|   |   +-- threads/          # CreateThread, ComposeModal
|   |   +-- ui/               # Avatar, Button, Input, Spinner, Toggle, etc.
|   +-- contexts/
|   |   +-- AuthContext.jsx    # Authentification & état utilisateur
|   |   +-- ThemeContext.jsx   # Thème clair / sombre / auto
|   |   +-- ComposeContext.jsx # Modal de composition global
|   |   +-- PanelContext.jsx   # Panneau latéral droit
|   |   +-- BadgeContext.jsx   # Badges de notifications
|   +-- hooks/
|   |   +-- useConfirm.js     # Boîte de confirmation
|   |   +-- useDocumentTitle.js
|   |   +-- useFeed.js        # Logique du fil d'actualité (pagination curseur)
|   |   +-- useFocusTrap.js   # Accessibilité modal
|   |   +-- useThreadComposer.js # Logique partagée CreateThread/ComposeModal
|   |   +-- useUsers.js       # Recherche d'utilisateurs
|   +-- i18n/                 # Traductions
|   |   +-- en.json           # English
|   |   +-- fr.json           # Français
|   |   +-- ar.json           # العربية
|   |   +-- index.js          # Config i18next
|   +-- pages/
|   |   +-- FeedPage.jsx      # Fil d'actualité (page d'accueil)
|   |   +-- LoginPage.jsx     # Connexion
|   |   +-- RegisterPage.jsx  # Inscription
|   |   +-- ProfilePage.jsx   # Profil utilisateur
|   |   +-- EditProfilePage.jsx
|   |   +-- ThreadDetailPage.jsx
|   |   +-- NotificationsPage.jsx
|   |   +-- SearchPage.jsx    # Recherche d'utilisateurs
|   |   +-- FollowersPage.jsx
|   |   +-- FollowingPage.jsx
|   |   +-- FollowRequestsPage.jsx
|   |   +-- SavedThreadsPage.jsx   # Threads sauvegardés
|   |   +-- RepostedThreadsPage.jsx # Threads repostés
|   |   +-- settings/         # Pages de paramètres
|   |   |   +-- SettingsLayout.jsx
|   |   |   +-- AccountSettingsPage.jsx
|   |   |   +-- PrivacySettingsPage.jsx
|   |   |   +-- NotificationSettingsPage.jsx
|   |   |   +-- DisplaySettingsPage.jsx
|   |   |   +-- ArchivedThreadsPage.jsx
|   |   +-- legal/            # Pages légales
|   |       +-- LegalLayout.jsx
|   |       +-- TermsOfServicePage.jsx
|   |       +-- PrivacyPolicyPage.jsx
|   |       +-- CookiePolicyPage.jsx
|   |       +-- AccessibilityPage.jsx
|   +-- utils/
|   |   +-- constants.js      # API_URL, limites, intervalles
|   |   +-- formatDate.js     # timeAgo, fullDateTime (date-fns)
|   |   +-- sanitizeUrl.js    # Sanitization des URLs médias
|   |   +-- storage.js        # Abstraction localStorage (token)
|   +-- App.jsx               # Routage principal
|   +-- main.jsx              # Point d'entrée React
|   +-- index.css             # Styles globaux + Tailwind
+-- index.html                # Template HTML (meta tags, favicon, anti-flash)
+-- vite.config.js            # Proxy /api → localhost:4000
+-- eslint.config.js
+-- package.json
```

---

## 🛠️ Technologies

| Package | Version | Description |
|---------|---------|-------------|
| **React** | 19.2 | Bibliothèque UI |
| **React DOM** | 19.2 | Rendu DOM |
| **React Router DOM** | 7.13 | Routage SPA |
| **Vite** | 7.2 (rolldown) | Bundler / dev server |
| **Tailwind CSS** | 4.1 | Framework CSS utility-first |
| **@tailwindcss/vite** | 4.1 | Plugin Tailwind pour Vite |
| **Axios** | 1.13 | Client HTTP |
| **Lucide React** | 0.563 | Bibliothèque d'icônes |
| **react-i18next** | 16.5 | Internationalisation |
| **i18next** | 25.8 | Core i18n |
| **react-hot-toast** | 2.6 | Notifications toast |
| **date-fns** | 4.1 | Formatage de dates |

### Dev Dependencies

| Package | Description |
|---------|-------------|
| **@vitejs/plugin-react** | Plugin React pour Vite (HMR) |
| **ESLint** 9 | Linting |
| **eslint-plugin-react-hooks** | Règles hooks React |
| **eslint-plugin-react-refresh** | Règles React Refresh |

---

## 🚀 Installation

### Prérequis

- Node.js >= 20.x
- Backend Nexora en cours d'exécution sur le port 4000

### Installation

```bash
cd frontend
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:5173`.

---

## ⚙️ Configuration

### Proxy Vite

Le dev server Vite est configuré pour proxier automatiquement les requêtes API vers le backend :

| Chemin | Destination |
|--------|-------------|
| `/api/*` | `http://localhost:4000` |

Cette configuration est définie dans `vite.config.js`.

### Variables d'environnement (optionnel)

En production ou pour pointer vers un backend distant, créez un fichier `.env` :

```env
VITE_API_URL=https://web-social-networking-platform-backend.onrender.com/api
```

> **Note** : En développement, l'API utilise le chemin relatif `/api` (via le proxy Vite), aucune configuration supplémentaire n'est requise.

### Stockage d'images

Les images (avatars, couvertures, médias) sont stockées sur **Cloudinary**. Les URLs retournées par l'API sont des URLs absolues `https://res.cloudinary.com/...` qui fonctionnent directement sans proxy.

---

## 📄 Pages & Fonctionnalités

| Page | Route | Description |
|------|-------|-------------|
| Feed | `/` | Fil d'actualité avec pagination par curseur |
| Login | `/login` | Connexion |
| Register | `/register` | Inscription |
| Search | `/search` | Recherche d'utilisateurs en temps réel |
| Profile | `/user/:userId` ou `/profile` | Profil utilisateur (propre ou autre) |
| Edit Profile | `/edit-profile` | Modifier username / bio |
| Thread Detail | `/thread/:threadId` | Thread + réponses paginées |
| Notifications | `/notifications` | Liste des notifications |
| Followers | `/user/:userId/followers` | Liste des followers |
| Following | `/user/:userId/following` | Liste des following |
| Follow Requests | `/follow-requests` | Demandes d'abonnement reçues |
| Saved Threads | `/saved` | Threads sauvegardés (bookmarks) |
| Reposted Threads | `/reposts` | Threads repostés |
| Settings | `/settings/*` | Paramètres (compte, confidentialité, notifications, affichage, archives) |
| Legal | `/terms`, `/privacy`, `/cookies`, `/accessibility` | Pages légales |

### Fonctionnalités clés

- **Thème** : Clair / Sombre / Auto (suit le système)
- **Composition** : Créer un thread depuis le feed ou via la modale globale (bouton +)
- **Visibilité** : Menu déroulant avec 3 niveaux (Public, Abonnés, Privé)
- **Interactions** : Like, Repost, Save, Reply, Delete
- **Archivage** : Archiver / désarchiver ses propres threads
- **Recherche** : Recherche d'utilisateurs en temps réel (debounced)
- **Lightbox** : Visualisation plein écran des images (ImageViewerModal)
- **Panneau latéral** : Threads tendance + Utilisateurs suggérés
- **Accessibilité** : Focus trap dans les modales, labels ARIA
- **Anti-flash** : Thème et direction appliqués avant le premier rendu

---

## 🧩 Composants

### UI réutilisables (`components/ui/`)

| Composant | Description |
|-----------|-------------|
| `Avatar` | Avatar avec initiale en fallback |
| `Button` | Bouton stylisé avec variantes |
| `Input` | Champ de saisie avec label |
| `Spinner` | Indicateur de chargement |
| `Toggle` | Interrupteur on/off |
| `ConfirmDialog` | Boîte de confirmation modale |
| `ErrorBoundary` | Capture d'erreurs React |
| `ImageViewerModal` | Visualisation plein écran des images (lightbox) |
| `ReportProblemModal` | Formulaire de signalement de problème |
| `GridBackground` | Fond animé pour les pages auth |

---

## 🌍 Internationalisation

3 langues supportées, sélectionnables dans Paramètres > Affichage :

| Langue | Code | Direction |
|--------|------|-----------|
| Français | `fr` | LTR |
| English | `en` | LTR |
| العربية | `ar` | RTL |

Les fichiers de traduction sont dans `src/i18n/` (en.json, fr.json, ar.json).

---

## 📜 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement Vite (port 5173) |
| `npm run build` | Build de production (dist/) |
| `npm run preview` | Prévisualiser le build de production |
| `npm run lint` | Lancer ESLint |

---

## 👨‍💻 Auteur

**Houssam El Motaouakkel** — [@houssam-elmotaouakkel](https://github.com/houssam-elmotaouakkel)