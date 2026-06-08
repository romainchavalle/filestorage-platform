# 🧪 Guide Complet des Tests (Fullstack DataShare)

Ce document récapitule l'ensemble de la stratégie de tests mise en place sur le projet DataShare, couvrant à la fois le Backend (NestJS) et le Frontend (React). Notre approche suit les principes de la **Pyramide des Tests**.

---

## 🏗️ 1. BACKEND (NestJS)

Le Backend est testé de manière isolée pour s'assurer que toute la logique métier, la sécurité et la communication avec les services tiers (comme AWS S3) sont fiables.

### Stratégie Backend
- **Outil :** `Jest`
- **Couverture Actuelle :** **~99%**
- **Objectif :** Tester les `Services` (Auth, Upload, Download, S3, Files) de manière unitaire. Chaque méthode est testée avec ses cas de succès et ses cas d'erreurs (fichiers inexistants, mots de passe erronés, S3 down, etc.).

### Commandes Backend
Toutes ces commandes doivent être exécutées depuis le dossier `backend/` :

| Commande | Action |
| :--- | :--- |
| `npm run test` | Lance tous les tests unitaires classiques. |
| `npm run test:watch` | Lance Jest en mode interactif (relance à chaque modification). |
| `npm run test:cov` | Génère le rapport de couverture pour voir le % de code testé. |
| `npm run test:e2e` | Lance les tests d'intégration API complets via Supertest (frappe les Endpoints réels : Auth, Upload, Download, etc.). |

**Rapport de couverture :** Disponible dans `backend/coverage/index.html` (pour les tests unitaires) et `backend/coverage/e2e/index.html` (pour E2E).

---

## 🎨 2. FRONTEND (React)

Le Frontend dispose de sa propre stratégie à deux niveaux pour garantir une interface sans bug et une excellente expérience utilisateur.

### Stratégie Frontend (Niveau 1) : Unit/Integration
- **Outil :** `Vitest` + `React Testing Library`
- **Couverture Actuelle :** **~93%**
- **Objectif :** Tester les composants isolés, les hooks métier (`useUpload`, `useDashboard`), et simuler tous les cas d'erreurs de l'API (erreurs réseau, validation Zod, etc.). C'est extrêmement rapide.

### Stratégie Frontend (Niveau 2) : End-to-End (E2E)
- **Outil :** `Playwright` + plugin Istanbul/nyc
- **Couverture Actuelle :** **~79%**
- **Objectif :** Tester les parcours utilisateurs (*Happy Paths*) de A à Z en naviguant dans un vrai navigateur automatisé (Chromium). Le but n'est pas d'atteindre 100%, mais de vérifier que les flux vitaux (Login, Upload, Dashboard, Download) s'enchaînent parfaitement.

### Commandes Frontend
Toutes ces commandes doivent être exécutées depuis le dossier `frontend/` :

| Commande | Action |
| :--- | :--- |
| `npm run test` | Lance Vitest (Unit/Intégration). |
| `npm run test:cov` | Génère le rapport de couverture unitaire Vitest (dossier `coverage/`). |
| `npm run test:e2e` | Lance les 5 scénarios Playwright (E2E) en arrière-plan. |
| `npm run test:e2e:ui` | Ouvre l'interface Playwright pour visualiser les tests en direct. |
| `npm run report:e2e` | Génère le rapport de couverture E2E (dossier `coverage-e2e/`). |

### Rapports de couverture (Frontend)
- 📊 **Unit/Integration (Vitest) :** `frontend/coverage/index.html`
- 🤖 **E2E (Playwright) :** `frontend/coverage-e2e/index.html`

---

## 💡 Résumé
L'application est **blindée** de part et d'autre. 
- Les erreurs de logique serveur sont arrêtées par **Jest**.
- Les erreurs d'interface et d'état sont arrêtées par **Vitest**.
- Les bugs de parcours globaux sont bloqués par **Playwright**.
