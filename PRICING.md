# Pricing & Checkout Configuration

DevTools Pro uses a simple freemium model:

| Plan | Price | What you get |
| --- | --- | --- |
| **Free** | $0, forever | JSON formatter/validator, Base64, URL encoder, UUID generator, case converter, all text tools, timestamp converter, basic color tools |
| **Premium** | One-time payment (default **$9.99**) | Advanced formatters/minifiers, batch processing, regex tester, JWT tools, hash tools, advanced converters, history, saved tools/settings, export features |

There is intentionally **no payment processing inside this app** — no card
forms, no license server, no fake checkout. The app only needs one thing from
you to sell Premium: a **real public checkout URL** operated by your payment
provider.

## Connecting a real checkout (required to sell Premium)

1. **Create the product** in your chosen payment provider
   (e.g. Stripe, Lemon Squeezy, Gumroad, Paddle — any provider that gives you
   a shareable checkout or payment link).
2. **Create the checkout/payment link** for that product in the provider's
   dashboard. This is a public `https://` URL hosted by the provider.
3. **Set `VITE_UPGRADE_URL` to that URL.** Either copy `.env.example` to
   `.env` and fill it in, or set the variable in your hosting provider's
   build environment:

   ```bash
   VITE_UPGRADE_URL=https://YOUR_REAL_CHECKOUT_URL
   ```

   (Replace the value with the link from step 2 — do not ship the placeholder.)
4. **Rebuild the application** (`npm run build`) and redeploy `dist/`.
   `VITE_*` variables are inlined at build time, so changing them requires
   a rebuild.
5. **Test the checkout.** Open the deployed app as a free user, click any
   🔒 PREMIUM tool, then *Upgrade now* — it must open your real checkout
   page. Complete a test purchase using your provider's test/sandbox mode.
6. **Never put private API or payment secrets in `VITE_*` frontend
   variables.** Everything prefixed with `VITE_` is shipped publicly in the
   JavaScript bundle to every visitor. Secret keys, signing secrets, and
   webhook secrets belong only in your payment provider's dashboard or your
   own backend — never in this frontend.

Optional build-time overrides (also documented in `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_UPGRADE_URL` | internal `#/checkout` page | Public checkout/payment link from your provider |
| `VITE_PREMIUM_PRICE` | `9.99` | One-time price shown in the upgrade UI |
| `VITE_PREMIUM_CURRENCY` | `USD` | ISO 4217 currency code |

The same three values can also be overridden per-browser at runtime on the
**Settings** page (stored in `localStorage`, useful for demos and support).

Until `VITE_UPGRADE_URL` is set to a real checkout, the upgrade button opens
the app's internal `#/checkout` page, which **states clearly that no payment
is processed there**. Do not claim payments work until a real checkout URL
is configured and tested.

## Premium activation after purchase

After a customer pays on your external checkout, Premium is activated locally
in their browser (**⚙ Settings → Activate Premium**). The entitlement is a
flag in `localStorage` with source `provider` — it contains no credentials
and is never transmitted anywhere. How you deliver the activation
instruction after purchase is up to your provider's post-purchase flow
(e.g. a "return to merchant" URL or a thank-you page).

## Development test mode ≠ real customer payment

The **🧪 Development test mode** toggle (visible on the Settings and checkout
pages in `npm run dev` only) exists so developers can verify Free/Premium
gating without paying. It is fundamentally different from a real purchase:

| | Development test mode | Real customer payment |
| --- | --- | --- |
| Where it exists | Development builds only (`vite dev`) | Production builds |
| Money moved | None — nothing is charged | Handled entirely by your payment provider |
| Entitlement source | `dev-test` in `localStorage` | `provider` in `localStorage` |
| Honored in production | **No** — a `dev-test` entitlement is ignored by production builds | Yes |
| In the production bundle | **No** — the toggle is dead-code-eliminated at build time (`import.meta.env.DEV`) | n/a |

Rules that are enforced by the code, not just by convention:

- The test-mode toggle cannot appear in production builds — it is guarded by
  `import.meta.env.DEV` (see `src/lib/devmode.ts`) and removed by the bundler.
- A `dev-test` premium flag left in `localStorage` is treated as **Free** by
  production builds (see `src/lib/entitlements.ts`).
- The test mode never processes or claims a real payment and never stores
  credentials or secrets.

## Where this is implemented

- `src/config/commercial.ts` — single source of truth: price, currency,
  upgrade URL resolution (runtime override → `VITE_*` env → internal page),
  and checkout-URL safety validation (only `https:`/`http:`/app-internal
  URLs are accepted; `javascript:`/`data:` etc. are rejected).
- `src/lib/entitlements.ts` — FREE | PREMIUM entitlement state.
- `src/lib/devmode.ts` — development-only test-mode flag.
- `src/components/UpgradeModal.tsx`, `src/pages/CheckoutPage.tsx`,
  `src/pages/SystemPages.tsx` — upgrade UI.
