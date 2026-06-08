# 🛡️ Garanti de Sécurité (DataShare)

Ce document résume l'analyse de sécurité et les décisions architecturales prises pour protéger l'application DataShare, ses utilisateurs et les fichiers hébergés.

---

## 1. Scan de Sécurité Basique (Dépendances)

Un scan de vulnérabilité a été exécuté sur les dépendances du projet (`frontend/` et `backend/`) en utilisant l'outil natif `npm audit`.

### 📊 Analyse des résultats du scan
Lors de l'audit initial, quelques vulnérabilités liées aux dépendances tierces ont été détectées :
- **Frontend** : 4 Vulnérabilités (modérées et hautes) sur `axios`, `react-router` et `brace-expansion`. Celles-ci présentaient des risques théoriques de déni de service (DoS) par expansion de chemin, et de "Prototype Pollution" via la gestion des requêtes.
- **Backend** : 3 Vulnérabilités (modérées et hautes) sur `fast-uri` et `qs`. Risques identifiés : *Path Traversal* (Traversée de répertoire) et manipulation d'URL.

### 🛠️ Résolution
Toutes les vulnérabilités ont été corrigées en appliquant une mise à jour mineure/patch des librairies via `npm audit fix`. **Le rapport actuel indique 0 vulnérabilité connue.**

---

## 2. Analyse des Décisions Architecturales (Mappage OWASP)

L'architecture du projet DataShare a été pensée pour mitiger les risques de sécurité majeurs (OWASP Top 10) :

### ✅ 2.1. Contrôle d'Accès (Broken Access Control)
- **JWT (JSON Web Tokens)** : Les sessions sont gérées de manière *stateless*. Toute route API critique est protégée par un `JwtAuthGuard` qui valide cryptographiquement la signature du token.
- **Protection des Fichiers S3** : Les fichiers binaires ne traversent jamais notre serveur Node.js. L'API génère des **URLs Pré-signées** temporaires (Presigned URLs). Sans autorisation préalable du backend, il est impossible de lire ou d'écrire dans le bucket AWS S3.

### ✅ 2.2. Défaillances Cryptographiques (Cryptographic Failures)
- **Hachage Fort** : Les mots de passe utilisateurs ET les mots de passe de protection des fichiers sont hachés avec **Bcrypt** avant toute persistance en base de données. Ils ne sont jamais stockés en clair ou journalisés.

### ✅ 2.3. Injections (Injection)
- **Validation Stricte (Zod)** : Les données d'entrée (Payloads HTTP) sont validées par des schémas `Zod` sur le frontend et le backend (via des `Pipes` NestJS). Toute propriété inattendue est rejetée, prévenant ainsi les injections NoSQL/SQL et les attaques XSS de base.

---

## 3. Limites Actuelles & Recommandations (Améliorations Futures)

Bien que la base de l'application soit sécurisée, une analyse critique révèle des axes d'amélioration nécessaires avant une mise en production massive :

1. **Absence de Rate Limiting (Limitation de taux)** :
   - *Risque* : Attaque par force brute sur le endpoint de vérification du mot de passe de fichier (`/download/:id/link`) ou sur le login.
   - *Solution recommandée* : Ajouter `@nestjs/throttler` pour limiter le nombre de tentatives de mots de passe par adresse IP.

2. **Politique CORS Trop Permissive** :
   - *Risque* : Dans `main.ts`, `app.enableCors()` est activé sans paramètres, ce qui autorise les requêtes de n'importe quelle origine (`*`).
   - *Solution recommandée* : Restreindre l'origine CORS strictement au nom de domaine du frontend en production (ex: `origin: 'https://datashare.app'`).

3. **En-têtes HTTP de Sécurité Manquants** :
   - *Risque* : Clickjacking, XSS avancées, Sniffing de type MIME.
   - *Solution recommandée* : Installer le middleware `helmet` dans NestJS pour appliquer automatiquement les en-têtes de sécurité standard (HSTS, X-Frame-Options, etc.).

4. **Taille et Type de Fichiers sur S3** :
   - Bien que le front limite à 1 Go, un attaquant interceptant l'URL pré-signée d'upload pourrait envoyer un payload différent. Il faudra inclure des conditions restrictives (`Conditions` policy) lors de la génération de l'URL pré-signée côté serveur.
