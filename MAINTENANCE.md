# 🛠️ Documentation de Maintenance (DataShare)

Ce document décrit les procédures, la fréquence et l'analyse des risques concernant le maintien en condition opérationnelle du projet DataShare, avec un focus particulier sur la gestion des dépendances.

---

## 1. Procédures de Mise à Jour des Dépendances

Afin de garder le projet sécurisé et performant (aussi bien côté Frontend React que Backend NestJS), le cycle de mise à jour des dépendances NPM s'articule autour des étapes suivantes :

### 📋 Procédure Manuelle
1. **Vérification de l'état actuel** : Exécuter la commande `npm outdated` dans les dossiers `frontend/` et `backend/` pour lister les paquets obsolètes.
2. **Audit de sécurité préalable** : Lancer `npm audit` pour vérifier si une mise à jour d'urgence est requise suite à une faille critique (Zero-Day).
3. **Mise à jour mineure (Safe)** : Utiliser `npm update` pour appliquer les patchs et les versions mineures (qui respectent le SemVer `^` ou `~` du `package.json`) sans introduire de *Breaking Changes*.
4. **Mise à jour majeure (Risquée)** : Utiliser `npm-check-updates` (via `npx npm-check-updates -u`) pour forcer la montée de version majeure.
5. **Validation par les Tests** : 
   - Lancer la suite de tests unitaires (`npm run test`).
   - Lancer la suite de tests E2E Playwright/Supertest (`npm run test:e2e`).
6. **Commit & Déploiement** : Si tous les tests passent au vert, pousser les modifications et laisser la CI/CD générer la nouvelle release.

### 🤖 Procédure Automatisée (Recommandée)
- **Dependabot / Renovate** : Configuration recommandée sur le dépôt Git (ex: GitHub). L'outil ouvre automatiquement des Pull Requests (PR) lorsqu'une nouvelle version d'une librairie est disponible. Si la CI/CD (les tests) passe au vert sur cette PR, elle peut être fusionnée avec confiance.

---

## 2. Fréquence des Mises à Jour

La maintenance ne doit pas être une corvée annuelle, mais une habitude régulière pour éviter la dette technique :

- **Mises à jour de Sécurité (Critiques) : Immédiate**
  - Dès réception d'une alerte (via GitHub Security Advisories ou `npm audit`), le patch doit être appliqué dans les 24h/48h.
- **Mises à jour Mineures et Patchs : Mensuelle**
  - Une revue manuelle le 1er de chaque mois pour bénéficier des optimisations et corrections de bugs des librairies.
- **Mises à jour Majeures (Breaking Changes) : Trimestrielle / Semestrielle**
  - Nécessite une lecture approfondie des *Changelogs* (ex: passage de NestJS v10 à v11, ou React Router v6 à v7). Planifiée lors de sprints spécifiques de "Tech Debt".

---

## 3. Analyse des Risques et Mitigations

Mettre à jour des dépendances n'est jamais anodin. Voici les risques identifiés et comment le projet DataShare s'en prémunit :

### ⚠️ Risque 1 : Régressions Fonctionnelles (Breaking Changes)
Mettre à jour une dépendance majeure peut casser l'API interne d'une librairie ou modifier son comportement, entraînant des bugs invisibles au moment de la compilation.
- **Mitigation** : C'est ici que notre stratégie de tests (Pyramide des tests) brille. Avec **99% de couverture sur le Backend** et des **tests E2E Playwright sur les parcours vitaux**, toute régression sera immédiatement détectée avant même le déploiement.

### ⚠️ Risque 2 : Attaque par la Chaîne Logistique (Supply Chain Attack)
Un pirate prend le contrôle d'une petite librairie NPM très populaire et y injecte un code malveillant (vol de variables d'environnement, minage de cryptomonnaie). Une mise à jour aveugle importerait ce virus dans DataShare.
- **Mitigation** : 
  - Ne jamais utiliser le symbole `*` ou `latest` dans le `package.json`. Les versions doivent être verrouillées via le `package-lock.json`.
  - Attendre quelques jours avant d'appliquer une mise à jour mineure (laisser la communauté essuyer les plâtres et détecter d'éventuelles compromissions).

### ⚠️ Risque 3 : Incompatibilité entre Dépendances (Peer Dependencies)
Une mise à jour d'un outil (ex: Vite ou TypeScript) rend une autre sous-dépendance incompatible, bloquant complètement le pipeline de Build.
- **Mitigation** : Mettre à jour par petits incréments (un paquet à la fois) plutôt que de tout mettre à jour d'un coup. Les tests d'intégration vérifieront la bonne cohésion de l'ensemble.
