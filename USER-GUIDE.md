# DevTools Pro — User Guide

## Getting around

- The **dashboard** (home) lists all tools grouped by category. Click a card to open a tool.
- The **sidebar** mirrors the same list and stays visible on desktop. On mobile, use the ☰ button.
- **Search**: press `/` anywhere (or click the search box) and type — e.g. `json`, `hash`, `color`. Press `Enter` to jump straight to the first match.
- Everything is keyboard-navigable with `Tab` / `Shift+Tab`; visible focus rings show where you are.

## Free vs Premium

Free tools work immediately, forever, for $0. Premium tools are marked with a **🔒 PREMIUM** badge in the sidebar and on dashboard cards. Clicking a locked tool opens the upgrade dialog showing the current one-time price.

**Buying Premium:** click *Upgrade now* to open the secure Lemon Squeezy checkout. After paying, Lemon Squeezy emails you a **license key**.

**Activating Premium:** open the **#/activate** page (or click *"Already purchased? Enter license key"* in the upgrade dialog) and paste your license key. The app verifies it directly with Lemon Squeezy's servers — Premium unlocks only after the server confirms the key. Clear errors are shown for invalid, expired, revoked, or over-limit keys.

**Persistence:** your activation is stored locally and re-verified with Lemon Squeezy on every app load, so Premium survives page reloads. If a license is refunded or revoked, Premium deactivates automatically. You can deactivate on the current device from the activation page to free the seat for another device.

## Tool notes

### JSON Formatter & Validator (free)
Paste JSON on the left. A live status line shows ✓ Valid JSON or the parser error. Click **Format** to pretty-print (2-space indent).

### JSON Minifier / JSON ↔ CSV (premium)
- Minifier strips all insignificant whitespace.
- JSON → CSV: arrays of objects become rows; nested objects flatten to `dot.paths`; commas/quotes/newlines are escaped per RFC 4180.
- CSV → JSON: the first row is treated as the header.

### Text tools (free)
- **Case Converter** — pick any of the 9 case styles; camel/pascal/snake/kebab split on non-alphanumeric word boundaries.
- **Word & Character Counter** — updates live as you type.
- **Remove Duplicate Lines** — exact-line matching, first occurrence wins.
- **Sort Lines** — "Natural" compares embedded numbers numerically (`item2` sorts before `item10`).

### Encoding (free)
- **Base64** handles full Unicode (emoji included) via UTF-8. Premium adds per-line batch encode/decode.
- **URL Encoder** uses strict `encodeURIComponent` semantics — encode individual components, not whole URLs.

### Web formatters (premium)
- HTML formatter understands void elements (`<br>`, `<img>`, …); minifier strips comments and collapses whitespace.
- CSS/JS formatters are token-based (not full parsers) — they preserve strings and comments/regexes while re-indenting.

### Developer tools
- **UUID** (free) — up to 1,000 v4 UUIDs per click.
- **Hash** (premium) — MD5 is a pure-TS implementation; SHA-* uses the Web Crypto API.
- **Timestamp** (free) — values ≥ 1e12 are auto-detected as milliseconds.
- **Color** (free/premium) — accepts `#RGB`, `#RRGGBB` and `rgb(r, g, b)`. HSL/HSV conversions are premium.
- **Regex Tester** (premium) — JavaScript `RegExp` semantics, custom flags, capture-group display, protection against empty-match loops.
- **JWT Decoder** (premium) — decodes header + payload and flags expired tokens. The signature is displayed but **not verified** (no keys are available client-side).
- **Lorem Ipsum** (premium) — 1–20 paragraphs.

### History & favorites (premium)
Every tool run is logged locally (last 100 entries) — see **Premium → Tool History**. Pin tools from **Settings → Favorite tools** and they appear at the top of the sidebar.

### Export (premium)
Most tools have an **Export** button that downloads the output as a file.

## Privacy

All processing happens in your browser. Nothing you type is transmitted anywhere. History, favorites and settings live in your browser's `localStorage` and can be wiped at any time (browser settings or the Clear history button).
