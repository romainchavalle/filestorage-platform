# 📁 DataShare

DataShare est une application web sécurisée permettant d'héberger, de gérer et de partager des fichiers avec (ou sans) protection par mot de passe. 

Ce projet est séparé en deux environnements distincts : un **Backend (API)** robuste et un **Frontend (UI)** moderne.

---

## 🛠️ Stack Technique

- **Frontend** : React, Vite, Zustand, Zod
- **Backend** : Node.js, NestJS, Prisma ORM, Zod
- **Base de données** : PostgreSQL
- **Stockage** : AWS S3 (ou équivalent MinIO local)

---

## 📋 Prérequis

Pour exécuter ce projet sur votre machine locale, vous aurez besoin des outils suivants installés :

- **Node.js** (v20 ou supérieur recommandé)
- **npm** (v10 ou supérieur)
- **Docker & Docker Compose** (pour faire tourner la base de données PostgreSQL localement)
- Un compte **AWS** (S3) ou une instance MinIO locale pour le stockage des fichiers.

---

## ⚙️ Configuration (Variables d'Environnement)

Le projet nécessite des fichiers `.env` pour fonctionner. Copiez les fichiers `.env.example` (s'ils existent) ou créez-les manuellement à la racine des dossiers `backend/` et `frontend/`.

### 1. Configuration du Backend (`backend/.env`)
```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/datashare?schema=public"

# Sécurité (Générer une chaîne aléatoire longue)
JWT_SECRET="votre_super_secret_jwt_tres_long_et_complexe"

# Stockage de fichiers (AWS S3)
AWS_REGION="eu-west-3"
AWS_ACCESS_KEY_ID="votre_access_key"
AWS_SECRET_ACCESS_KEY="votre_secret_key"
AWS_S3_BUCKET_NAME="datashare-bucket"
```

### 2. Configuration du Frontend (`frontend/.env`)
```env
# URL de l'API Backend
VITE_API_URL="http://localhost:3000"
```

---

## 🚀 Installation & Lancement

### Étape 1 : Démarrer la Base de Données
Si vous utilisez Docker, lancez simplement le conteneur PostgreSQL :
```bash
docker-compose up -d
```
*(Si vous n'avez pas de `docker-compose.yml`, assurez-vous d'avoir un serveur PostgreSQL local tournant sur le port 5432 avec les identifiants de votre `DATABASE_URL`)*.

### Étape 2 : Lancer le Backend (NestJS)
```bash
cd backend
npm install

# Initialiser la base de données avec Prisma
npx prisma db push
# (Optionnel) Générer le client Prisma
npx prisma generate

# Lancer le serveur (tourne sur http://localhost:3000)
npm run start:dev
```

### Étape 3 : Lancer le Frontend (React/Vite)
Dans un nouveau terminal :
```bash
cd frontend
npm install

# Lancer l'interface (tourne généralement sur http://localhost:5173)
npm run dev
```

---

## 🧪 Tests et Qualité

Ce projet possède une couverture de test stricte et des stratégies de suivi de performance. Vous pouvez exécuter les tests avec les commandes suivantes :

**Côté Backend (`/backend`) :**
- `npm run test` : Lance les tests unitaires (Jest).
- `npm run test:e2e` : Lance les tests d'intégration API (Supertest).

**Côté Frontend (`/frontend`) :**
- `npm run test` : Lance les tests unitaires et d'intégration (Vitest).
- `npm run test:e2e` : Lance les scénarios utilisateurs de bout en bout (Playwright).

---

## 📚 Documentations Annexes

Pour des détails approfondis sur l'ingénierie du projet, consultez nos documents de spécifications à la racine du dépôt :

- [TESTING.md](./TESTING.md) - Plan de test, critères d'acceptation et stratégies.
- [SECURITY.md](./SECURITY.md) - Scan de vulnérabilité et architecture de sécurité.
- [PERF.md](./PERF.md) - Rapports de stress test et budget de performances.
- [MAINTENANCE.md](./MAINTENANCE.md) - Procédures de mise à jour des dépendances.
