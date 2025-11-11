# Configuration des tests frontend (GitHub Actions)

Ce document décrit comment les tests frontend sont organisés dans le projet et comment GitHub Actions les exécute.

## Structure des répertoires

- `githubworkflow/frontend/` : contient les tests frontend basés sur Jest.
- `githubworkflow/backend/` : dossier réservé pour les futurs tests backend (placeholder `.gitkeep`).
- `.github/workflows/frontend-tests.yml` : workflow GitHub Actions qui déclenche les tests frontend.

## Configuration Jest

- `jest.frontend.config.js` : configuration basée sur `next/jest`, adaptée à Next.js 15.
- `jest.setup.ts` : enregistre les extensions `@testing-library/jest-dom`.
- Script npm : `npm run test:frontend`.

Pour exécuter les tests en local :

```bash
npm install
npm run test:frontend
```

## Workflow GitHub Actions

Le fichier `.github/workflows/frontend-tests.yml` :

- Se déclenche sur `push` vers `main` et `develop`, ainsi que sur toutes les pull requests.
- Utilise Node.js 20 et le cache npm intégré à `actions/setup-node`.
- Exécute `npm ci` puis `npm run test:frontend -- --runInBand`.

### Ajouter des branches supplémentaires

```yaml
on:
  push:
    branches: [main, develop, votre-branche]
```

### Activer la publication de rapports de couverture

1. Activer la collecte de couverture (`collectCoverage: true` ou option CLI).
2. Ajouter une étape pour uploader le rapport (ex. `actions/upload-artifact` ou Codecov).

## Prochaines étapes recommandées

- Remplir `githubworkflow/backend/` avec les tests Jest/Vitest côté API.
- Ajouter un job GitHub Actions dédié au backend (`backend-tests.yml`).
- Envisager des tests E2E (Playwright/Cypress) avec un workflow dédié.

