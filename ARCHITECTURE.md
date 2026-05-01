# Architecture DataShare

Ce document est la source de vérité unique (Single Source of Truth) pour l'architecture technique, les règles et les conventions du projet DataShare.

## 1. Stack Technique Globale
- **Architecture** : Monorepo (npm workspaces)
- **Frontend** : React SPA, Vite, TypeScript, Zustand (State), Axios (API), TailwindCSS (Style)
- **Backend** : NestJS, TypeScript, REST API
- **Base de Données** : PostgreSQL (avec Prisma ORM)
- **Stockage Fichiers** : AWS S3 (via Presigned URLs)
- **Validation** : Zod (Isomorphe via le dossier `/shared`)

## 2. Structure du Monorepo
- `/frontend` : Application React (Port 5173 par défaut)
- `/backend` : API NestJS (Port 3000 par défaut)
- `/shared` : Typages et schémas Zod partagés entre le front et le back

## 3. Flux Clés de l'Architecture
### Le paradigme "Direct-to-S3" (Upload)
Afin de préserver la bande passante du serveur lors de l'envoi de fichiers lourds (jusqu'à 1 Go), le flux suivant est imposé :
1. React appelle NestJS pour déclarer l'upload (`POST /api/upload/init`).
2. NestJS vérifie les droits et signe localement une URL Amazon S3.
3. React utilise cette URL pour envoyer directement le fichier binaire massif à AWS S3 en HTTP `PUT`. **Le fichier ne transite jamais par le serveur NestJS.**
4. React notifie NestJS du succès (`PATCH /api/upload/complete/:id`).

### La Suppression Orchestrée (Delete)
Contrairement à l'upload, la suppression (`DELETE /api/files/:id`) passe obligatoirement par le backend. NestJS supprime la ligne dans PostgreSQL, puis exécute la commande `DeleteObject` via le SDK AWS pour garantir la cohérence des données.

### L'Automatisation Cloud (US10)
Les fichiers expirent automatiquement (par défaut à 7 jours). Aucune tâche CRON n'est implémentée côté serveur. C'est une **S3 Lifecycle Rule** configurée sur le bucket AWS qui s'occupe de détruire les fichiers expirés.

## 4. Règles de Développement
- **TypeScript Strict** : Typage obligatoire.
- **Isomorphisme** : Tout payload (DTO) qui transite entre Front et Back DOIT être validé par un schéma Zod défini dans `/shared`.
- **Commits** : Respect strict de la convention "Conventional Commits" (ex: `feat: ajout du login`, `fix: erreur S3`).
- **Linter** : La configuration par défaut de Vite (ESLint) et NestJS sera utilisée, sans surcouche complexe (Husky optionnel pour la rapidité d'exécution).

## 5. Résumé du Contrat d'Interface (API REST)
Toutes les requêtes nécessitent l'entête `Authorization: Bearer <jwt_token>` à l'exception des routes publiques (`/api/auth/*` et téléchargement).

| Méthode | Endpoint | Description (US) |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Création de compte (US03) |
| `POST` | `/api/auth/login` | Connexion & récupération JWT (US04) |
| `POST` | `/api/upload/init` | Initialisation et signature d'URL S3 (US01, 07-10) |
| `PATCH` | `/api/upload/complete/:id` | Validation d'un upload réussi (US01, 07) |
| `GET` | `/api/files` | Liste de l'historique utilisateur (US05) |
| `DELETE`| `/api/files/:id` | Suppression BDD + S3 (US06) |
| `POST` | `/api/files/:id/download` | Récupération d'une Presigned URL GET, avec mot de passe optionnel (US02, 09) |
