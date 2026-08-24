# Deployment

DevTools Pro builds to a static bundle (`dist/`) with relative asset paths (`base: './'`), so it can be hosted from any directory or sub-path on any static host.

## Build

```bash
npm install
npm run build
```

Upload the contents of `dist/`.

## Static hosts

| Host | Notes |
| --- | --- |
| **GitHub Pages** | Push `dist/` to a `gh-pages` branch or use an Actions workflow. Relative paths + hash routing work out of the box, including in project sub-paths like `user.github.io/devtools-pro/`. |
| **Netlify / Vercel** | Build command `npm run build`, output directory `dist`. No redirects config needed (hash-based routing). |
| **Cloudflare Pages** | Same as above. |
| **S3 + CloudFront / nginx** | Serve `dist/` as static files; no SPA fallback required because routing uses `#/…` hashes. |

## GitHub Pages example workflow

```yaml
name: deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment: github-pages
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci && npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
      - uses: actions/deploy-pages@v4
```

## Offline / air-gapped use

The app requires **zero network access at runtime**. You can:

1. `npm run build` on a connected machine.
2. Copy `dist/` to the offline machine.
3. Open `dist/index.html` with any static file server (e.g. `npx serve dist` or `python3 -m http.server -d dist`).

## Upgrade URL & pricing

Point the checkout button at your real store by editing `src/config/pricing.ts` before building, or at runtime via the Settings page (stored per-browser).
