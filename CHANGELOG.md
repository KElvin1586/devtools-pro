# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [1.0.2] - 2026-08-24

### Added
- `PRICING.md` — step-by-step guide for connecting a real payment provider: create the product, create the checkout/payment link, set `VITE_UPGRADE_URL`, rebuild, test, and never put private payment secrets in `VITE_*` frontend variables
- `.env.example` — documented build-time commercial configuration (`VITE_UPGRADE_URL`, `VITE_PREMIUM_PRICE`, `VITE_PREMIUM_CURRENCY`)

### Changed
- `DEPLOYMENT.md`, `INSTALLATION.md`, `README.md` — configuration docs now point at the `VITE_*` variables / `src/config/commercial.ts` instead of the removed `src/config/pricing.ts`; the last placeholder-domain references were removed from docs and test fixtures

## [1.0.1] - 2026-08-24

### Fixed
- Color converter premium teaser now shows the real computed HSL/HSV values (blurred) instead of a hardcoded sample with an incorrect HSV saturation
- Removed the placeholder external upgrade URL — premium upgrade now opens a real in-app checkout page (#/checkout) with a local activation code, driven by centralized config (`src/config/commercial.ts`: `UPGRADE_URL`/`PRICE`/`CURRENCY`)
- Dev/QA premium toggle moved behind `import.meta.env.DEV` so it cannot ship in production bundles

### Changed
- `src/config/pricing.ts` replaced by `src/config/commercial.ts` (single source of truth for price, currency, upgrade URL and feature lists)

## [1.0.0] - 2026-08-24

### Added
- 20 offline-first developer tools:
  - JSON: Formatter & Validator, Minifier, JSON ↔ CSV converter
  - Text: Case converter (9 styles), word/character counter, duplicate-line remover, line sorter (A→Z, Z→A, natural, by length)
  - Encoding: Unicode-safe Base64 encoder/decoder (with premium batch mode), URL encoder/decoder
  - Web: HTML, CSS and JavaScript formatters & minifiers (pure TypeScript, token-based)
  - Developer: UUID v4 generator, hash generator (pure-TS MD5 + Web Crypto SHA-1/256/384/512), timestamp converter, color converter (HEX/RGB/HSL/HSV), regex tester, JWT decoder with expiry detection, lorem ipsum generator
- Centralized FREE | PREMIUM entitlement system (`src/lib/entitlements.ts`)
  - Locked premium tools stay visible with 🔒 PREMIUM badges and open an upgrade modal
  - Configurable one-time premium price (default $9.99) and external upgrade URL
  - No fake payment or license server — local activation after external checkout
- Premium extras: tool history (last 100 runs, local), favorite/pinned tools, export-to-file
- Search/filter across all tools with `/` keyboard shortcut and Enter-to-open
- Responsive layout with mobile sidebar drawer, focus rings and ARIA labelling
- 88 unit tests covering all transformation logic (vitest)
- Documentation: README, USER-GUIDE, INSTALLATION, DEPLOYMENT, LICENSE, CHANGELOG
