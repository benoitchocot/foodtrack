# FoodTrack - Application de Planification de Repas

Application complète de planification de repas avec génération automatique de menus, listes de courses et gestion des recettes.

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités complètes](#fonctionnalités-complètes)
- [Stack technique](#stack-technique)
- [Installation](#installation)
- [Configuration](#configuration)
- [Développement](#développement)
- [Tests](#tests)
- [Documentation API](#documentation-api)
- [Structure du projet](#structure-du-projet)
- [Déploiement](#déploiement)

## 🎯 Vue d'ensemble

FoodTrack est une application web moderne et progressive (PWA) permettant de :
- Parcourir et découvrir des recettes
- Personnaliser ses préférences alimentaires
- Générer automatiquement des plans de repas personnalisés
- Créer des listes de courses organisées par catégories
- Gérer ses recettes favorites
- Soumettre ses propres recettes
- Consulter son historique
- Fonctionner en mode offline

## ✨ Fonctionnalités complètes

### 🔐 Authentification & Utilisateurs
- ✅ Inscription et connexion avec JWT
- ✅ Gestion du profil utilisateur
- ✅ Onboarding multi-étapes pour nouveaux utilisateurs
- ✅ Préférences personnalisables (nombre de personnes, régimes, outils, difficultés)
- ✅ Page de paramètres pour modifier ses préférences

### 🍳 Gestion des Recettes
- ✅ Catalogue de 40+ recettes variées
- ✅ Recherche et filtrage avancés
- ✅ Détails complets avec ingrédients et instructions
- ✅ Ajustement automatique des quantités selon le nombre de personnes
- ✅ Images pour chaque recette
- ✅ Système de favoris avec bouton cœur
- ✅ Page dédiée aux recettes favorites
- ✅ Historique des recettes consultées
- ✅ Soumission de nouvelles recettes par les utilisateurs
- ✅ Upload d'images (fichier ou URL)
- ✅ Système d'approbation par email avec lien unique

### 📅 Plans de Repas
- ✅ Génération intelligente basée sur les préférences
- ✅ Prévisualisation des recettes avant validation
- ✅ Possibilité de régénérer un plan si non satisfait
- ✅ Filtrage par temps de préparation max
- ✅ Respect des régimes alimentaires
- ✅ Prise en compte des outils disponibles
- ✅ Historique des plans générés

### 🛒 Listes de Courses
- ✅ Génération automatique depuis un plan de repas
- ✅ Organisation par catégories (Viandes, Légumes, Fruits, etc.)
- ✅ Filtres pour afficher/masquer les catégories
- ✅ Cases à cocher pour suivre ses achats
- ✅ Agrégation intelligente des ingrédients
- ✅ Statuts : En cours, Finalisée, Complétée

### 🎨 Interface Utilisateur
- ✅ Landing page moderne et attractive
- ✅ Dashboard centralisé
- ✅ Design responsive (mobile, tablette, desktop)
- ✅ Mode sombre/clair avec Tailwind CSS
- ✅ Animations et transitions fluides
- ✅ Notifications en bandeau (non intrusives)
- ✅ Guide utilisateur pour les nouveaux
- ✅ Indicateurs de progression

### 🌍 Internationalisation
- ✅ Support Français et Anglais
- ✅ Détection automatique de la langue du navigateur
- ✅ Sélecteur manuel avec drapeaux FR/EN
- ✅ Traductions complètes de l'interface

### 📱 PWA & Offline
- ✅ Application installable (mobile + desktop)
- ✅ Service Worker pour mise en cache
- ✅ Mode offline pour consulter les recettes
- ✅ Indicateur de statut de connexion
- ✅ Synchronisation automatique

### 📊 Historique & Statistiques
- ✅ Historique des plans de repas
- ✅ Recettes récemment consultées
- ✅ Recettes favorites avec gestion dynamique
- ✅ Statistiques d'utilisation

### 🔔 Notifications & Emails
- ✅ Système de notifications en bandeau
- ✅ Envoi d'emails pour approbation de recettes
- ✅ Configuration SMTP flexible
- ✅ Templates HTML pour emails

## 🛠 Stack technique

### Backend
- **Framework** : NestJS 10
- **Base de données** : PostgreSQL 16
- **ORM** : Prisma
- **Authentification** : JWT (Passport)
- **Validation** : class-validator
- **Documentation** : Swagger/OpenAPI
- **Email** : Nodemailer
- **Upload** : Multer
- **Tests** : Jest

### Frontend
- **Framework** : Nuxt 3.14
- **UI** : Tailwind CSS 3
- **State Management** : Pinia + Composables
- **Internationalisation** : @nuxtjs/i18n (FR/EN)
- **PWA** : @vite-pwa/nuxt avec Workbox
- **Icons** : Nuxt Icon (Material Design Icons)
- **Tests** : Vitest (unitaires), Playwright (e2e)

### Infrastructure
- **Containerisation** : Docker & Docker Compose
- **Base de données** : PostgreSQL (via Docker)
- **Serveur de développement** : Hot-reload pour backend et frontend

## 🚀 Installation

### Prérequis

- Node.js 20+
- Docker & Docker Compose
- npm ou yarn

### Installation rapide avec Docker Compose

1. **Cloner le repository**
   ```bash
   git clone <repository-url>
   cd Jow
   ```

2. **Configurer les variables d'environnement**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   # Éditez backend/.env avec vos valeurs
   ```

3. **Démarrer tous les services**
   ```bash
   docker compose up --build
   ```

   Cette commande démarre automatiquement :
   - PostgreSQL sur le port 5432
   - Backend (API) sur le port 3000
   - Frontend sur le port 3001

4. **Initialiser la base de données** (première fois uniquement)
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npx prisma db seed
   ```

5. **Accéder à l'application**
   - Frontend : http://localhost:3001
   - Backend API : http://localhost:3000
   - Documentation Swagger : http://localhost:3000/api

### Installation manuelle (sans Docker)

#### 1. Base de données PostgreSQL

Installez PostgreSQL localement ou utilisez Docker :
```bash
docker compose up -d postgres
```

#### 2. Backend

```bash
cd backend
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos valeurs

# Migrations et seed
npx prisma migrate deploy
npx prisma generate
npx prisma db seed

# Démarrer
npm run start:dev
```

#### 3. Frontend

```bash
cd frontend
npm install

# Démarrer
npm run dev
```

## ⚙️ Configuration

### Variables d'environnement Backend

Créez un fichier `backend/.env` avec les variables suivantes :

```env
# Base de données
DATABASE_URL="postgresql://jow_user:jow_password@localhost:5432/jow_db?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3001"

# Port
PORT=3000

# Email (optionnel - pour approbation de recettes)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
SMTP_FROM="noreply@foodtrack.com"

# Admin
ADMIN_EMAIL="admin@yourcompany.com"

# Frontend URL (pour les liens dans les emails)
FRONTEND_URL="http://localhost:3001"
```

#### Configuration SMTP pour Gmail

1. Activez la validation en 2 étapes sur votre compte Google
2. Générez un mot de passe d'application : https://myaccount.google.com/apppasswords
3. Utilisez ce mot de passe dans `SMTP_PASS`

⚠️ **Note** : Si SMTP n'est pas configuré, les URLs d'approbation seront affichées dans les logs backend.

### Variables d'environnement Frontend

Le frontend utilise `nuxt.config.ts` pour sa configuration. Les variables sont définies via `docker-compose.yml` ou directement dans le fichier :

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000'
    }
  }
})
```

Pour Docker, ces variables sont dans `docker-compose.yml` :
```yaml
environment:
  NODE_ENV: development
  NUXT_PUBLIC_API_BASE: http://localhost:3000
```

## 💻 Développement

### Démarrer tous les services avec Docker

```bash
docker compose up
```

Ou en mode détaché :
```bash
docker compose up -d
```

### Démarrer uniquement certains services

```bash
# Base de données seulement
docker compose up -d postgres

# Backend seulement
docker compose up -d postgres backend

# Tous sauf frontend
docker compose up -d postgres backend
```

### Développement sans Docker

#### Terminal 1 - Backend
```bash
cd backend
npm run start:dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

### Commandes utiles

```bash
# Voir les logs
docker compose logs -f

# Voir les logs d'un service spécifique
docker compose logs -f backend
docker compose logs -f frontend

# Arrêter tous les services
docker compose down

# Arrêter et supprimer les volumes
docker compose down -v

# Reconstruire les images
docker compose build

# Reconstruire et démarrer
docker compose up --build

# Accéder au shell d'un conteneur
docker compose exec backend sh
docker compose exec frontend sh

# Exécuter une commande dans un conteneur
docker compose exec backend npx prisma studio
docker compose exec backend npx prisma migrate dev
```

### Base de données

#### Prisma Studio (Interface graphique)
```bash
cd backend
npx prisma studio
# Ou avec Docker
docker compose exec backend npx prisma studio
```

Accessible sur http://localhost:5555

#### Migrations
```bash
# Créer une nouvelle migration
npx prisma migrate dev --name nom_de_la_migration

# Appliquer les migrations
npx prisma migrate deploy

# Réinitialiser la base
npx prisma migrate reset
```

#### Seed (données de test)
```bash
# Peupler la base avec 40+ recettes
cd backend
npm run prisma:seed

# Ou avec Docker
docker compose exec backend npm run prisma:seed
```

## 🧪 Tests

### Tests Backend

```bash
cd backend

# Tests unitaires
npm test

# Tests avec couverture
npm run test:cov

# Tests e2e
npm run test:e2e

# Tests en mode watch
npm run test:watch
```

### Tests Frontend

```bash
cd frontend

# Tests unitaires (Vitest)
npm test

# Tests en mode watch
npm run test:watch

# Tests e2e (Playwright)
npm run test:e2e

# Tests e2e avec interface UI
npm run test:e2e:ui

# Tests e2e en mode headless
npm run test:e2e:headless
```

## 📚 Documentation API

Une fois le backend démarré, la documentation Swagger est disponible à :
- **URL** : http://localhost:3000/api
- **Format** : OpenAPI 3.0
- **Authentification** : JWT Bearer Token

### Endpoints principaux

#### 🔐 Authentification
- `POST /auth/register` - Inscription
- `POST /auth/login` - Connexion
- `GET /auth/profile` - Profil utilisateur (protégé)

#### 👤 Utilisateurs
- `GET /users/me` - Informations utilisateur (protégé)
- `PATCH /users/me` - Mettre à jour le profil (protégé)
- `GET /users/me/settings` - Récupérer les préférences (protégé)
- `PUT /users/me/settings` - Mettre à jour les préférences (protégé)

#### 🍳 Recettes
- `GET /recipes` - Liste des recettes (avec filtres)
- `GET /recipes/:id` - Détail d'une recette
- `POST /recipes` - Créer une recette (protégé)
- `PATCH /recipes/:id` - Modifier une recette (protégé)
- `DELETE /recipes/:id` - Supprimer une recette (protégé)

#### 📝 Soumission de Recettes
- `POST /recipe-submissions` - Soumettre une recette (protégé)
- `GET /recipe-submissions/approve/:token` - Voir une soumission (public)
- `PATCH /recipe-submissions/approve/:token/approve` - Approuver (public)
- `PATCH /recipe-submissions/approve/:token/reject` - Rejeter (public)

#### 📤 Upload
- `POST /upload/image` - Upload une image (max 5MB, formats: JPEG, PNG, GIF, WebP)

#### 🥕 Ingrédients
- `GET /ingredients` - Liste des ingrédients
- `POST /ingredients` - Créer un ingrédient (protégé)

#### 📅 Plans de repas
- `GET /meal-plans` - Liste des plans de repas (protégé)
- `POST /meal-plans/generate` - Générer un plan de repas (protégé)
- `GET /meal-plans/:id` - Détail d'un plan de repas (protégé)
- `DELETE /meal-plans/:id` - Supprimer un plan (protégé)

#### 🛒 Listes de courses
- `GET /shopping-lists` - Liste des listes de courses (protégé)
- `POST /shopping-lists/from-meal-plan` - Générer depuis un plan de repas (protégé)
- `GET /shopping-lists/:id` - Détail d'une liste (protégé)
- `GET /shopping-lists/:id/grouped` - Liste groupée par catégories (protégé)
- `PATCH /shopping-lists/:id/items/:itemId` - Cocher/décocher un item (protégé)
- `PATCH /shopping-lists/:id/status` - Changer le statut (protégé)

#### 📊 Historique & Favoris
- `POST /history/recipes/:id/view` - Enregistrer une consultation (protégé)
- `GET /history` - Récupérer l'historique complet (protégé)
- `POST /history/recipes/:id/favorite` - Ajouter aux favoris (protégé)
- `DELETE /history/recipes/:id/favorite` - Retirer des favoris (protégé)
- `GET /history/recipes/:id/favorite` - Vérifier si favori (protégé)
- `GET /history/favorites` - Liste des IDs de favoris (protégé)

## 🗄️ Schéma de base de données

Le schéma complet de la base de données est documenté dans [`DATABASE_SCHEMA.md`](./DATABASE_SCHEMA.md).

### Modèles principaux

- **User** : Utilisateurs de l'application
- **UserSettings** : Préférences utilisateur (taille du foyer, régimes, outils, etc.)
- **Recipe** : Recettes avec ingrédients et étapes
- **RecipeSubmission** : Soumissions de recettes en attente d'approbation
- **Ingredient** : Ingrédients avec catégories
- **MealPlan** : Plans de repas générés
- **ShoppingList** : Listes de courses avec items groupés par catégories
- **Favorite** : Recettes favorites des utilisateurs
- **RecipeView** : Historique de consultation des recettes

### Visualiser le diagramme ERD

1. Ouvrez [dbdiagram.io](https://dbdiagram.io/)
2. Cliquez sur "Import" → "From DBML"
3. Collez le contenu de [`database/schema.dbml`](./database/schema.dbml)
4. Le diagramme sera généré automatiquement avec toutes les relations

### Régénérer le schéma DBML

Pour mettre à jour le fichier DBML après modification du schéma Prisma :

```bash
cd backend
npx prisma generate
```

Le fichier `database/schema.dbml` sera automatiquement mis à jour.

## 📁 Structure du projet

```
Foodtrack/
├── backend/                    # API NestJS
│   ├── src/
│   │   ├── auth/              # Authentification (JWT)
│   │   ├── users/             # Gestion des utilisateurs
│   │   ├── recipes/           # CRUD recettes
│   │   ├── recipe-submissions/# Soumission de recettes
│   │   ├── ingredients/       # Gestion des ingrédients
│   │   ├── meal-plans/        # Génération de plans
│   │   ├── shopping-lists/    # Listes de courses
│   │   ├── history/           # Historique & favoris
│   │   ├── upload/            # Upload de fichiers
│   │   ├── prisma/            # Service Prisma
│   │   └── main.ts            # Point d'entrée
│   ├── prisma/
│   │   ├── schema.prisma      # Schéma de base de données
│   │   ├── migrations/        # Migrations
│   │   └── seed.ts            # Données de test (40+ recettes)
│   ├── uploads/               # Images uploadées
│   ├── test/                  # Tests e2e
│   ├── .env.example           # Variables d'environnement (template)
│   ├── .env                   # Variables d'environnement (à créer)
│   └── Dockerfile.dev         # Image Docker développement
│
├── frontend/                   # Application Nuxt 3
│   ├── components/            # Composants réutilisables
│   │   ├── AppHeader.vue      # Header avec navigation
│   │   ├── RecipeCard.vue     # Carte de recette avec favoris
│   │   ├── LanguageSwitcher.vue # Sélecteur de langue
│   │   ├── OfflineIndicator.vue # Indicateur offline
│   │   ├── NotificationBanner.vue # Bandeau de notification
│   │   ├── NotificationContainer.vue # Conteneur notifications
│   │   └── UserGuide.vue      # Guide pour nouveaux utilisateurs
│   ├── composables/           # Composables Vue
│   │   ├── useApi.ts          # API client avec cache
│   │   ├── useAuth.ts         # Authentification
│   │   ├── useOffline.ts      # Détection offline
│   │   ├── useUserSettings.ts # Préférences utilisateur
│   │   ├── useFavorites.ts    # Gestion des favoris
│   │   ├── useUserJourney.ts  # Progression utilisateur
│   │   ├── useNotification.ts # Système de notifications
│   │   ├── useTranslations.ts # Traductions dynamiques
│   │   └── useClickOutside.ts # Détection clic extérieur
│   ├── pages/                 # Pages de l'application
│   │   ├── index.vue          # Landing page
│   │   ├── login.vue          # Connexion
│   │   ├── register.vue       # Inscription
│   │   ├── onboarding.vue     # Onboarding multi-étapes
│   │   ├── dashboard.vue      # Tableau de bord
│   │   ├── settings.vue       # Paramètres utilisateur
│   │   ├── recipes/
│   │   │   ├── index.vue      # Liste des recettes
│   │   │   ├── [id].vue       # Détail d'une recette
│   │   │   └── submit.vue     # Soumettre une recette
│   │   ├── recipe-submissions/
│   │   │   └── approve/
│   │   │       └── [token].vue # Page d'approbation
│   │   ├── meal-plans/
│   │   │   ├── index.vue      # Liste des plans
│   │   │   ├── [id].vue       # Détail d'un plan
│   │   │   └── generate.vue   # Génération avec preview
│   │   ├── shopping-lists/
│   │   │   ├── index.vue      # Liste des listes
│   │   │   └── [id].vue       # Détail avec filtres
│   │   ├── history.vue        # Historique complet
│   │   └── favorites.vue      # Page des favoris
│   ├── middleware/            # Middlewares Nuxt
│   │   ├── auth.ts            # Protection des routes
│   │   └── onboarding.ts      # Redirection onboarding
│   ├── i18n/                  # Internationalisation
│   │   └── locales/
│   │       ├── fr.json        # Traductions françaises
│   │       └── en.json        # Traductions anglaises
│   ├── e2e/                   # Tests e2e Playwright
│   │   ├── auth.spec.ts
│   │   └── recipes.spec.ts
│   ├── tests/                 # Tests unitaires Vitest
│   │   ├── setup.ts
│   │   ├── composables/
│   │   └── components/
│   ├── public/                # Fichiers statiques
│   │   ├── icon-192.png       # Icône PWA
│   │   └── icon-512.png       # Icône PWA
│   ├── assets/
│   │   └── css/
│   │       └── main.css       # Styles Tailwind
│   ├── nuxt.config.ts         # Configuration Nuxt
│   ├── i18n.config.ts         # Configuration i18n
│   ├── tailwind.config.js     # Configuration Tailwind
│   └── Dockerfile.dev         # Image Docker développement
│
├── docker-compose.yml          # Orchestration Docker
├── .gitignore                 # Fichiers ignorés par Git
├── README.md                  # Ce fichier
└── INSTRUCTIONS.md            # Instructions détaillées
```

## 🌍 Internationalisation

L'application supporte deux langues :
- **Français** (par défaut)
- **English**

### Fonctionnement

1. **Détection automatique** : La langue du navigateur est détectée au premier accès
2. **Sélecteur manuel** : Drapeaux FR/EN dans la navbar pour changer de langue
3. **Persistance** : Le choix est sauvegardé dans un cookie

### Ajouter une traduction

1. Ajouter la clé dans `frontend/i18n/locales/fr.json`
2. Ajouter la traduction dans `frontend/i18n/locales/en.json`
3. Utiliser dans le code : `{{ $t('cle.traduction') }}`

## 📱 PWA (Progressive Web App)

L'application est une PWA complète :

### Fonctionnalités
- ✅ Installable sur mobile et desktop
- ✅ Mode offline pour consulter les recettes
- ✅ Service Worker avec stratégie de cache NetworkFirst
- ✅ Icônes adaptatives (192x192 et 512x512)
- ✅ Mise à jour automatique
- ✅ Synchronisation en arrière-plan

### Installation

**Sur mobile (Android/iOS) :**
1. Ouvrez l'application dans votre navigateur
2. Cliquez sur "Ajouter à l'écran d'accueil"
3. L'application s'installe comme une app native

**Sur desktop (Chrome/Edge) :**
1. Cliquez sur l'icône d'installation dans la barre d'adresse
2. Confirmez l'installation

### Cache

Le Service Worker met en cache :
- Les routes principales
- Les recettes consultées
- Les assets statiques (CSS, JS, images)

Stratégie : NetworkFirst avec fallback sur le cache en cas d'offline.

## 🚢 Déploiement

### Guide complet

Consultez le guide de déploiement détaillé : [`DEPLOYMENT.md`](./DEPLOYMENT.md)

### Déploiement rapide avec Traefik

Le projet est configuré pour fonctionner avec Traefik comme reverse proxy. Les services ont été ajoutés au fichier `swag.yml` :

- **Frontend** : `food.chocot.be` → Port 3000
- **Backend API** : `apifood.chocot.be` → Port 3000
- **Base de données** : PostgreSQL interne

### Étapes rapides

1. **Cloner sur le serveur**
   ```bash
   cd ~
   git clone <votre-repo> Jow
   ```

2. **Configurer les variables**
   ```bash
   cp .env.production.example .env.production
   nano .env.production
   # Remplir JOW_DB_PASSWORD, JOW_JWT_SECRET, SMTP_*, etc.
   ```

3. **Charger les variables**
   ```bash
   export $(cat .env.production | xargs)
   ```

4. **Démarrer avec docker-compose**
   ```bash
   docker-compose -f swag.yml up -d jow-postgres jow-backend jow-frontend
   ```

5. **Initialiser la base**
   ```bash
   docker exec jow-backend npx prisma migrate deploy
   docker exec jow-backend npm run prisma:seed
   ```

6. **Accéder à l'application**
   - Frontend : https://food.chocot.be
   - API : https://apifood.chocot.be
   - Swagger : https://apifood.chocot.be/api

### Variables d'environnement production

Voir `.env.production.example` pour la liste complète des variables requises.

**Variables critiques** :
- `JOW_DB_PASSWORD` : Mot de passe PostgreSQL (32+ caractères recommandés)
- `JOW_JWT_SECRET` : Secret JWT (générer avec `openssl rand -base64 64`)
- `JOW_SMTP_*` : Credentials pour l'envoi d'emails
- `JOW_ADMIN_EMAIL` : Email pour recevoir les notifications de soumission

### Sauvegardes

```bash
# Sauvegarde manuelle
docker exec jow-postgres pg_dump -U jow_user jow_db > backup.sql

# Sauvegarde automatique (cron quotidien)
0 3 * * * docker exec jow-postgres pg_dump -U jow_user jow_db > ~/backups/jow_$(date +\%Y\%m\%d).sql
```

### Mise à jour

```bash
cd ~/Foodtrack
git pull
docker-compose -f ~/swag.yml build jow-backend jow-frontend
docker-compose -f ~/swag.yml up -d jow-backend jow-frontend
docker exec jow-backend npx prisma migrate deploy
```

## 📝 Scripts disponibles

### Backend

| Commande | Description |
|----------|-------------|
| `npm run start` | Démarrer (production) |
| `npm run start:dev` | Développement avec hot-reload |
| `npm run start:debug` | Mode debug |
| `npm run build` | Build production |
| `npm test` | Tests unitaires |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:cov` | Tests avec couverture |
| `npm run test:e2e` | Tests e2e |
| `npm run lint` | Linter le code |
| `npm run format` | Formater avec Prettier |
| `npx prisma studio` | Interface graphique DB |
| `npx prisma migrate dev` | Créer une migration |
| `npx prisma migrate deploy` | Appliquer les migrations |
| `npx prisma generate` | Générer le client Prisma |
| `npm run prisma:seed` | Peupler la base |

### Frontend

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement |
| `npm run build` | Build production |
| `npm run preview` | Preview production |
| `npm run generate` | Génération statique |
| `npm test` | Tests unitaires (Vitest) |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:e2e` | Tests e2e (Playwright) |
| `npm run test:e2e:ui` | Tests e2e avec UI |
| `npm run lint` | Linter le code |
| `npm run format` | Formater avec Prettier |

## 🐛 Dépannage

### Le backend ne démarre pas

1. Vérifiez que PostgreSQL est démarré : `docker compose ps`
2. Vérifiez les logs : `docker compose logs backend`
3. Vérifiez les variables d'environnement dans `backend/.env`
4. Vérifiez la connexion DB : `docker compose exec backend npx prisma studio`

### Le frontend ne se connecte pas au backend

1. Vérifiez que le backend est démarré et accessible sur http://localhost:3000
2. Vérifiez `NUXT_PUBLIC_API_BASE` dans `docker-compose.yml` ou `.env`
3. Vérifiez les CORS dans `backend/.env` : `CORS_ORIGIN=http://localhost:3001`
4. Ouvrez la console du navigateur (F12) pour voir les erreurs

### Les emails ne partent pas

1. Vérifiez la configuration SMTP dans `backend/.env`
2. Pour Gmail, activez la validation 2 étapes et générez un mot de passe d'application
3. Si SMTP n'est pas configuré, les URLs d'approbation s'affichent dans les logs backend
4. Vérifiez les logs : `docker compose logs backend | grep -i "email\|smtp"`

### Erreurs de migration Prisma

```bash
# Réinitialiser complètement la base
docker compose exec backend npx prisma migrate reset

# Régénérer le client Prisma
docker compose exec backend npx prisma generate

# Appliquer les migrations
docker compose exec backend npx prisma migrate deploy
```

### Le lien d'approbation ne fonctionne pas depuis Gmail

C'est normal ! Gmail bloque les URLs `localhost` par sécurité.

**Solution en développement** : Copiez-collez l'URL depuis l'email dans votre navigateur.

**En production** : Le problème n'existe pas avec un vrai nom de domaine.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche : `git checkout -b feature/ma-fonctionnalite`
3. Commit : `git commit -am 'Ajout de ma fonctionnalité'`
4. Push : `git push origin feature/ma-fonctionnalite`
5. Créer une Pull Request

### Standards de code

- **Backend** : ESLint + Prettier avec les règles NestJS
- **Frontend** : ESLint + Prettier avec les règles Vue/Nuxt
- **Commits** : Messages clairs et descriptifs
- **Tests** : Ajouter des tests pour toute nouvelle fonctionnalité

## 📄 Licence

MIT

## 👥 Auteurs

Développé avec ❤️ pour simplifier la planification de repas.

## 📞 Support

Pour toute question ou problème :
- Ouvrir une issue sur GitHub
- Consulter la documentation Swagger : http://localhost:3000/api
- Vérifier les logs : `docker compose logs -f`

---

**Version** : 1.0.0  
**Dernière mise à jour** : Novembre 2025
