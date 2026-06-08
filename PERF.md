# 🚀 Suivi de Performance (DataShare)

Ce document valide le respect des exigences de performance du projet, incluant le budget de performance Frontend (tailles de bundles) et la résilience du Backend face à la charge.

---

## 1. Budget de Performance Frontend (React / Vite)

Afin d'assurer une expérience utilisateur fluide (notamment sur mobile et réseaux lents), nous avons fixé un budget strict de performance pour les ressources statiques. L'objectif est de réduire le *Time To Interactive (TTI)* et le *First Contentful Paint (FCP)*.

### 📦 Résultats du Build (Vite / Rollup)
Lors de la compilation pour la production (`npm run build`), les tailles de fichiers ont été optimisées, minifiées et compressées avec Gzip.

| Type de Ressource | Poids Brut | Poids Compressé (Gzip) | Budget Alloué | Statut |
| :--- | :--- | :--- | :--- | :--- |
| **JavaScript (App)** | 453.28 kB | **138.75 kB** | < 500 kB | ✅ Validé |
| **CSS (Styles)** | 26.41 kB | **5.54 kB** | < 50 kB | ✅ Validé |
| **HTML (Index)** | 0.45 kB | **0.29 kB** | < 5 kB | ✅ Validé |

**Interprétation :**
Le budget de performance est largement respecté. Avec un payload JavaScript initial compressé à seulement **~138 Ko**, l'application se charge de manière instantanée, même sur une connexion 3G (temps de téléchargement réseau estimé à ~200ms).

---

## 2. Test de Performance Backend (API)

Pour s'assurer que le backend NestJS ne s'écroule pas face à un trafic intense, un test de montée en charge (Stress Test) a été réalisé sur un endpoint critique : **Consultation de fichier public**.

### ⚙️ Configuration du Test
- **Outil Utilisé :** `Autocannon` (équivalent Node.js de k6)
- **Cible :** `GET /download/123/public` (Vérification d'existence de fichier dans PostgreSQL)
- **Charge :** 100 utilisateurs virtuels (connexions) simultanés
- **Durée :** 10 secondes

### 📊 Captures des Métriques
```text
Running 10s test @ http://localhost:3000/download/123/public
100 connections

┌─────────┬────────┬────────┬────────┬────────┬───────────┬──────────┬────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev    │ Max    │
├─────────┼────────┼────────┼────────┼────────┼───────────┼──────────┼────────┤
│ Latency │ 116 ms │ 153 ms │ 278 ms │ 402 ms │ 165.35 ms │ 47.49 ms │ 472 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴──────────┴────────┘

┌───────────┬────────┬────────┬────────┬────────┬────────┬─────────┬────────┐
│ Stat      │ 1%     │ 2.5%   │ 50%    │ 97.5%  │ Avg    │ Stdev   │ Min    │
├───────────┼────────┼────────┼────────┼────────┼────────┼─────────┼────────┤
│ Req/Sec   │ 300    │ 300    │ 600    │ 793    │ 602,8  │ 126,63  │ 300    │
└───────────┴────────┴────────┴────────┴────────┴────────┴─────────┴────────┘

6k requests in 10.12s, 2.25 MB read
```

### 🧠 Interprétation des Résultats

1. **Requêtes Par Seconde (RPS) :** Le backend a traité en moyenne **602 requêtes par seconde**, encaissant plus de 6000 requêtes en 10 secondes sans le moindre crash. C'est une excellente performance pour un serveur Node.js unique non "scalé" horizontalement.
2. **Temps de Réponse (Latence) :** 
   - **Moyenne :** 165 ms. 
   - **Médiane (50%) :** 153 ms. 
   - **Pire cas (99%) :** 402 ms.
   - *Analyse :* Même soumis à 100 requêtes concurrentes lourdes, 99% des utilisateurs obtiennent une réponse en moins d'une demi-seconde. La latence médiane (153 ms) garantit que le ressenti reste parfaitement fluide pour la majorité des utilisateurs. L'architecture NestJS / Prisma se révèle extrêmement robuste.
