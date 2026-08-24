# Changelog

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

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
