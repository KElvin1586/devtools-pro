# Installation

## Prerequisites

- **Node.js 18+** (Node 20+ recommended) and npm 9+

No other services are required — there is no database, backend, or API key.

## Setup

```bash
git clone https://github.com/KElvin1586/devtools-pro.git
cd devtools-pro
npm install
```

## Run in development

```bash
npm run dev
```

Vite serves the app at <http://localhost:5173> with hot-module reloading.

## Verify

```bash
npm run typecheck   # TypeScript project build, zero errors
npm test            # vitest — 88 unit tests
npm run build       # typecheck + production bundle → dist/
```

## Production build

```bash
npm run build
npm run preview     # serve dist/ locally on http://localhost:4173
```

The `dist/` folder is a fully static site — copy it to any static host (see [DEPLOYMENT.md](DEPLOYMENT.md)).

## Configuration

| What | Where | Default |
| --- | --- | --- |
| Premium price | Settings page or `src/config/pricing.ts` | `$9.99` one-time |
| Upgrade checkout URL | Settings page or `src/config/pricing.ts` | `https://example.com/checkout/devtools-pro` |

Settings-page overrides persist in `localStorage` under the key `devtools.pricing`.
