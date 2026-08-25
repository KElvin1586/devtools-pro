# Deployment

DevTools Pro builds to a static bundle (`dist/`). The Vite `base` is `/devtools-pro/` for GitHub Pages project hosting at `https://kelvin1586.github.io/devtools-pro/`; change `base` in `vite.config.ts` if you deploy to a different path or domain. Hash-based routing (`#/…`) means no SPA fallback or redirects config is needed anywhere.

## Build

```bash
npm install
npm run build
```

Upload the contents of `dist/`.

## Static hosts

| Host | Notes |
| --- | --- |
| **GitHub Pages** | Automated via `.github/workflows/deploy.yml` (build → test → deploy on every push to `main`, or manually via *Actions → Deploy to GitHub Pages → Run workflow*). Requires repo Settings → Pages → Source = "GitHub Actions". |
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

## Upgrade URL & pricing (connecting a real checkout)

The app contains **no payment processing**. To sell Premium you point the
upgrade button at a real public checkout/payment link from your payment
provider (Stripe Payment Link, Lemon Squeezy, Gumroad, Paddle, …):

1. Create the product in your chosen payment provider.
2. Create the checkout/payment link for it (a public `https://` URL).
3. Set `VITE_UPGRADE_URL` to that URL (copy `.env.example` to `.env`, or set
   it in your host's build environment). Optionally set `VITE_PREMIUM_PRICE`
   and `VITE_PREMIUM_CURRENCY`.
4. Rebuild (`npm run build`) and redeploy — `VITE_*` values are inlined at
   build time.
5. Test the checkout end-to-end with your provider's test/sandbox mode.
6. Never put private API/payment secrets in `VITE_*` frontend variables —
   they are shipped publicly in the bundle.

Until `VITE_UPGRADE_URL` is configured, the upgrade button falls back to the
app's internal `#/checkout` page, which states clearly that no payment is
processed there. See [PRICING.md](PRICING.md) for the full guide, including
how Premium activation works and why the development test mode is not a real
payment. Runtime overrides for demos/support are available on the Settings
page (stored per-browser in `localStorage`).
