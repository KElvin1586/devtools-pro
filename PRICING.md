# Pricing & Checkout Configuration

DevTools Pro uses a simple freemium model:

| Plan | Price | What you get |
| --- | --- | --- |
| **Free** | $0, forever | JSON formatter/validator, Base64, URL encoder, UUID generator, case converter, all text tools, timestamp converter, basic color tools |
| **Premium** | One-time payment (default **$9.99**) | Advanced formatters/minifiers, batch processing, regex tester, JWT tools, hash tools, advanced converters, history, saved tools/settings, export features |

There is intentionally **no payment processing inside this app** — no card
forms, no fake checkout. Payments are handled by the real **Lemon Squeezy**
checkout, and Premium is unlocked by a **real license key** verified against
Lemon Squeezy's servers.

## Production checkout (live)

The production upgrade button opens:

```
https://kelvindigitaltools.lemonsqueezy.com/checkout/buy/5a9a0680-dbb4-4c1b-b38c-02c8bbd20fe1
```

It is set as the default `UPGRADE_URL` in `src/config/commercial.ts` and is
also passed explicitly as `VITE_UPGRADE_URL` in the GitHub Pages deploy
workflow (`.github/workflows/deploy.yml`).

## How purchase → activation works (Lemon Squeezy License API)

1. The customer clicks **Upgrade** → the Lemon Squeezy checkout above opens.
2. The customer pays at Lemon Squeezy. Lemon Squeezy emails them a
   **license key** (requires *license key generation* enabled on the product
   — see "Seller setup" below).
3. The customer opens **#/activate** in the app (or *Upgrade modal →
   "Already purchased? Enter license key"*) and pastes the key.
4. The app calls `POST https://api.lemonsqueezy.com/v1/licenses/activate`
   and stores the returned activation **instance id** together with the key.
5. Premium unlocks **only** when Lemon Squeezy confirms the key is valid and
   active. Invalid, expired, revoked (refunded), or over-limit keys show a
   clear error and the user stays on Free.
6. On every app load the stored license is **re-validated** against
   `POST /v1/licenses/validate`. A license that was refunded or disabled
   stops working automatically. If the license server is unreachable
   (offline), the last verified state is kept as a grace period.
7. "Deactivate on this device" calls `POST /v1/licenses/deactivate` to free
   the activation seat.

The License API endpoints are public by design (no API key required,
CORS-enabled) — this is Lemon Squeezy's official mechanism for client-side
apps. **No Lemon Squeezy API key, webhook secret, or any other credential is
ever placed in `VITE_*` variables or shipped in the bundle.**

## Anti-tamper model (honest scope)

- Premium is **not** stored as a trusted `premium: true` flag. localStorage
  holds the license key + instance id, which are worthless without a matching
  server-side activation: a forged record fails the next validation and is
  discarded.
- URL parameters and in-app toggles cannot grant Premium; the only
  production source is a server-verified license.
- Patching the shipped JavaScript itself can bypass any client-side gate
  (true of every purely static app); the license API ensures only paying
  customers can activate *without* modifying code, and gives the seller
  revocation control.

## Seller setup (one-time, in the Lemon Squeezy dashboard)

For the full flow to work, the product behind the checkout link must issue
license keys:

1. Lemon Squeezy dashboard → **Store → Products** → open the DevTools Pro
   product.
2. Enable **"Generate license keys"** (License keys section) so every order
   creates a key the customer receives by email.
3. Make sure the store is **live** (not test mode) when selling for real;
   use test mode for end-to-end testing with the test card.
4. Optional: set the product's **activation limit** (default is fine for
   per-device activation).

## Build-time configuration

Optional overrides (also documented in `.env.example`):

| Variable | Default | Purpose |
| --- | --- | --- |
| `VITE_UPGRADE_URL` | the Lemon Squeezy checkout above | Public checkout/payment link |
| `VITE_PREMIUM_PRICE` | `9.99` | One-time price shown in the upgrade UI |
| `VITE_PREMIUM_CURRENCY` | `USD` | ISO 4217 currency code |

The same values can also be overridden per-browser at runtime on the
**Settings** page (stored in `localStorage`, useful for self-hosters).

## Development test mode ≠ real customer payment

The **🧪 Development test mode** toggle (visible on the Settings page in
`npm run dev` only) exists so developers can verify Free/Premium gating
without paying. It is fundamentally different from a real purchase:

| | Development test mode | Real customer payment |
| --- | --- | --- |
| Where it exists | Development builds only (`vite dev`) | Production builds |
| Money moved | None — nothing is charged | Handled entirely by Lemon Squeezy |
| Entitlement source | `dev-test` flag in `localStorage` | Server-verified license record |
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
  upgrade URL resolution (runtime override → `VITE_*` env → Lemon Squeezy
  default), and checkout-URL safety validation (only `https:`/`http:`/
  app-internal URLs are accepted; `javascript:`/`data:` etc. are rejected).
- `src/lib/license.ts` — Lemon Squeezy License API client (activate /
  validate / deactivate) with error mapping.
- `src/lib/entitlements.ts` — FREE | PREMIUM entitlement state.
- `src/context/EntitlementContext.tsx` — activation, deactivation, and
  on-load server re-validation.
- `src/lib/devmode.ts` — development-only test-mode flag.
- `src/components/UpgradeModal.tsx`, `src/pages/ActivatePage.tsx`,
  `src/pages/CheckoutPage.tsx`, `src/pages/SystemPages.tsx` — upgrade,
  activation and settings UI.
