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
| Premium price | `VITE_PREMIUM_PRICE` at build time, or the Settings page at runtime | `KES 1,299` one-time (≈ `$10.04`) |
| Premium currency | `VITE_PREMIUM_CURRENCY` at build time, or the Settings page at runtime | `KES` |
| Upgrade checkout URL | `VITE_UPGRADE_URL` at build time, or the Settings page at runtime | Internal `#/checkout` page (no payment processed) until you set a real checkout link — see [PRICING.md](PRICING.md) |

Copy `.env.example` to `.env` to configure the build-time values. Settings-page overrides persist in `localStorage` under the key `devtools.pricing`.
