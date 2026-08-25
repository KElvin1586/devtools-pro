# 🛠️ DevTools Pro

An **offline-first developer toolkit** — 20 fast, private utilities that run entirely in your browser. No server, no database, no analytics, no data ever leaves your machine.

**Stack:** React 18 · TypeScript · Vite · Tailwind CSS · Vitest

## Features

### JSON
- **Formatter & Validator** — pretty-print with live syntax checking
- **Minifier** ✨ — compress JSON to its smallest valid form
- **JSON ↔ CSV** ✨ — bidirectional conversion with dot-path flattening

### Text
- **Case Converter** — lower, UPPER, Title, Sentence, camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE
- **Word & Character Counter** — live words / characters / sentences / paragraphs / lines
- **Remove Duplicate Lines** — order-preserving dedupe
- **Sort Lines** — A→Z, Z→A, natural (item2 < item10), by length

### Encoding
- **Base64 Encoder / Decoder** — Unicode-safe, with per-line batch mode ✨
- **URL Encoder / Decoder** — percent-encoding for URL components

### Web
- **HTML Formatter & Minifier** ✨
- **CSS Formatter & Minifier** ✨
- **JavaScript Formatter & Minifier** ✨

### Developer
- **UUID Generator** — bulk v4 UUIDs via Web Crypto
- **Hash Generator** ✨ — MD5 (pure TS) + SHA-1/256/384/512 via Web Crypto
- **Timestamp Converter** — Unix seconds/ms ↔ ISO, UTC, local
- **Color Converter** — HEX ↔ RGB free, HSL/HSV ✨
- **Regex Tester** ✨ — match highlighting + capture groups
- **JWT Decoder** ✨ — header/payload inspection + expiry check
- **Lorem Ipsum Generator** ✨

✨ = Premium feature

## Freemium model

| Plan | Price | Includes |
| --- | --- | --- |
| **Free** | $0 | JSON format/validate, Base64, URL encoding, UUID, case converter, all text tools, timestamps, HEX↔RGB colors |
| **Premium** | KES 1,299 one-time (≈ $10.04, configurable) | Everything in Free + advanced formatters/minifiers, JSON↔CSV, hash tools, regex tester, JWT decoder, batch processing, tool history, saved favorites, export-to-file |

- Centralized entitlement system (`src/lib/entitlements.ts`) — one source of truth.
- Locked tools are **always visible** and marked 🔒 PREMIUM; clicking opens an upgrade modal — nothing is hidden.
- **Real payment integration.** The upgrade button opens the Lemon Squeezy checkout; Premium is unlocked by a real Lemon Squeezy license key verified against Lemon Squeezy's servers (see `PRICING.md`). No fake payment, no trusted local flag.
- Premium price & upgrade URL are configurable via `VITE_*` build-time variables (see `.env.example` and [PRICING.md](PRICING.md)) or per-browser in **Settings**.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # 88 unit tests
npm run build      # production bundle in dist/
npm run preview    # serve the production build
```

See [INSTALLATION.md](INSTALLATION.md), [USER-GUIDE.md](USER-GUIDE.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for details.

## Privacy

Every transformation is pure client-side TypeScript. History, favorites and settings are stored in `localStorage` on your device only. The app makes **zero network requests** during normal use. The only outbound calls are: the Lemon Squeezy checkout when you click Upgrade, and — only if you purchased Premium — license activation/re-validation against Lemon Squeezy's License API.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus tool search |
| `Enter` (in search) | Open first matching tool |
| `Esc` | Close modal / clear search |
| `Tab` / `Shift+Tab` | Full keyboard navigation |

## License

MIT — see [LICENSE](LICENSE).
