# Configuration des tests (Frontend, Backend & Intégration)

Ce document décrit comment les différents niveaux de tests sont organisés dans le projet et comment GitHub Actions les exécute.

## Structure des répertoires

- `tests/frontend/` : tests frontend basés sur Jest + Testing Library.
- `tests/backend/` : tests unitaires backend (helpers, modèles, services).
- `tests/integration/` : tests d’intégration API (handler Next.js + mocks d’infra).
- `.github/workflows/backend-tests.yml` : workflow GitHub Actions dédié au backend.
- `.github/workflows/frontend-tests.yml` : workflow GitHub Actions dédié au frontend.
- `.github/workflows/integration-tests.yml` : workflow GitHub Actions dédié à l’intégration API.

## Configurations Jest par couche

### Frontend
- Config : `jest.frontend.config.js` (hérite de `next/jest`, environnement JSDOM).
- Setup : `jest.setup.ts` (polyfill `fetch`, Jest DOM).
- Script : `npm run test:frontend`.

Pour exécuter les tests en local :

```bash
npm install
npm run test:frontend
```

### Backend
- Config : `jest.backend.config.js` (environnement Node).
- Setup : `jest.backend.setup.ts` (variables d’environnement, isolation Mongo).
- Script : `npm run test:backend`.

```bash
npm run test:backend
```

### Intégration API
- Config : `jest.integration.config.js` (environnement Node).
- Setup : `jest.integration.setup.ts` (variables d’environnement partagées).
- Script : `npm run test:integration`.
- Les dépendances critiques (`connectDB`, `User`, `Order`, notifications) sont mockées pour valider les enchaînements sans base de données réelle.

```bash
npm run test:integration
```

### Exécution complète
- Script agrégé : `npm run test:ci` (enchaîne backend → frontend → intégration).

## Workflows GitHub Actions

- `.github/workflows/backend-tests.yml` : exécute `npm run test:backend`.
- `.github/workflows/frontend-tests.yml` : exécute `npm run test:frontend -- --runInBand`.
- `.github/workflows/integration-tests.yml` : exécute `npm run test:integration -- --runInBand`.

Chaque workflow se déclenche sur `push` (branche `master`) et sur toutes les pull requests. Ils partagent la même configuration Node.js 20 avec cache npm.

### Ajouter des branches supplémentaires

```yaml
on:
  push:
    branches: [master, develop, votre-branche]
```

### Activer la publication de rapports de couverture

1. Activer la collecte de couverture (`collectCoverage: true` ou option CLI).
2. Ajouter une étape pour uploader le rapport (ex. `actions/upload-artifact` ou Codecov).

## Prochaines étapes recommandées

- Étendre la couverture backend (services additionnels, hooks Mongoose).
- Ajouter de nouveaux scénarios d’intégration (échecs paiement, autorisations).
- Envisager des tests E2E (Playwright/Cypress) avec un workflow dédié.

