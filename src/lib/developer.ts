/** Developer utilities: UUID, hash, timestamp, color, JWT, regex helpers. */
import { md5 } from './md5';

// ---------- UUID ----------
export function generateUUID(): string {
  return crypto.randomUUID();
}

export function generateUUIDs(count: number): string[] {
  const clamped = Math.min(Math.max(1, count), 1000);
  return Array.from({ length: clamped }, () => generateUUID());
}

// ---------- Hash ----------
export type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

export async function hashText(input: string, algorithm: HashAlgorithm): Promise<string> {
  if (algorithm === 'MD5') return md5(input);
  const data = new TextEncoder().encode(input);
  // HashAlgorithm values already match the Web Crypto standard names ('SHA-256', …)
  const digest = await crypto.subtle.digest(algorithm, data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ---------- Timestamp ----------
export interface TimestampInfo {
  unixSeconds: number;
  unixMilliseconds: number;
  iso: string;
  utc: string;
  local: string;
  isUnixMillis: boolean;
}

export function timestampToDate(ts: number): TimestampInfo {
  // Heuristic: values >= 1e12 are treated as milliseconds.
  const isMillis = Math.abs(ts) >= 1e12;
  const ms = isMillis ? ts : ts * 1000;
  const d = new Date(ms);
  return {
    unixSeconds: Math.floor(ms / 1000),
    unixMilliseconds: ms,
    iso: d.toISOString(),
    utc: d.toUTCString(),
    local: d.toString(),
    isUnixMillis: isMillis,
  };
}

export function dateToTimestamp(iso: string): { unixSeconds: number; unixMilliseconds: number } | null {
  const ms = Date.parse(iso);
  if (isNaN(ms)) return null;
  return { unixSeconds: Math.floor(ms / 1000), unixMilliseconds: ms };
}

// ---------- Color ----------
export interface ColorConversions {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  hsv: { h: number; s: number; v: number };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace(/^#/, '');
  const norm = cleaned.length === 3 ? cleaned.split('').map((c) => c + c).join('') : cleaned;
  if (!/^[0-9a-fA-F]{6}$/.test(norm)) return null;
  return {
    r: parseInt(norm.slice(0, 2), 16),
    g: parseInt(norm.slice(2, 4), 16),
    b: parseInt(norm.slice(4, 6), 16),
  };
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const v = max;
  const d = max - min;
  const s = max === 0 ? 0 : d / max;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) * 60;
    else if (max === gn) h = ((bn - rn) / d + 2) * 60;
    else h = ((rn - gn) / d + 4) * 60;
  }
  return { h: Math.round(h), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export function convertColor(input: string): ColorConversions | null {
  let rgb = hexToRgb(input.trim());
  if (!rgb) {
    const m = input.trim().match(/^rgba?\(([^)]+)\)$/i);
    if (m) {
      const parts = m[1].split(',').map((p) => parseFloat(p));
      if (parts.length >= 3 && parts.slice(0, 3).every((n) => !isNaN(n))) {
        rgb = { r: parts[0], g: parts[1], b: parts[2] };
      }
    }
  }
  if (!rgb) return null;
  return {
    hex: rgbToHex(rgb.r, rgb.g, rgb.b),
    rgb,
    hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
    hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
  };
}

// ---------- JWT ----------
export interface DecodedJwt {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
  expired?: boolean;
  expiresAt?: string;
}

function base64UrlDecode(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 2 ? '==' : padded.length % 4 === 3 ? '=' : '';
  return decodeURIComponent(
    Array.from(atob(padded + pad))
      .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
  );
}

export function decodeJwt(token: string): { ok: true; decoded: DecodedJwt } | { ok: false; error: string } {
  const parts = token.trim().split('.');
  if (parts.length !== 3) return { ok: false, error: 'A JWT must have exactly 3 segments separated by dots.' };
  try {
    const header = JSON.parse(base64UrlDecode(parts[0])) as Record<string, unknown>;
    const payload = JSON.parse(base64UrlDecode(parts[1])) as Record<string, unknown>;
    const decoded: DecodedJwt = { header, payload, signature: parts[2] };
    if (typeof payload.exp === 'number') {
      const expiresAt = new Date(payload.exp * 1000);
      decoded.expiresAt = expiresAt.toISOString();
      decoded.expired = expiresAt.getTime() < Date.now();
    }
    return { ok: true, decoded };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Unable to decode token.' };
  }
}

// ---------- Regex ----------
export interface RegexMatch {
  index: number;
  match: string;
  groups: string[];
}

export function testRegex(pattern: string, flags: string, input: string): { ok: true; matches: RegexMatch[] } | { ok: false; error: string } {
  try {
    const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g');
    const matches: RegexMatch[] = [];
    let m: RegExpExecArray | null;
    let guard = 0;
    while ((m = re.exec(input)) !== null && guard < 1000) {
      matches.push({ index: m.index, match: m[0], groups: m.slice(1) });
      if (m[0] === '') re.lastIndex++;
      guard++;
    }
    return { ok: true, matches };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid regular expression.' };
  }
}

// ---------- Lorem ----------
const WORD_POOL = (
  'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ' +
  'enim ad minim veniam quis nostrud exercitation ullamco laboris nisi aliquip ex ea commodo consequat duis aute irure ' +
  'in reprehenderit voluptate velit esse cillum eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident ' +
  'sunt culpa qui officia deserunt mollit anim id est laborum'
).split(' ');

let loremState = 42;
function loremRandom(): number {
  loremState = (loremState * 1664525 + 1013904223) % 4294967296;
  return loremState / 4294967296;
}

export function generateLorem(paragraphs: number): string {
  const count = Math.min(Math.max(1, paragraphs), 20);
  const out: string[] = [];
  for (let p = 0; p < count; p++) {
    const sentences: string[] = [];
    const sentenceCount = 3 + Math.floor(loremRandom() * 3);
    for (let s = 0; s < sentenceCount; s++) {
      const wordCount = 6 + Math.floor(loremRandom() * 10);
      const ws: string[] = [];
      for (let w = 0; w < wordCount; w++) {
        ws.push(WORD_POOL[Math.floor(loremRandom() * WORD_POOL.length)]);
      }
      sentences.push(ws.join(' ').replace(/^./, (c) => c.toUpperCase()) + '.');
    }
    out.push(sentences.join(' '));
  }
  return out.join('\n\n');
}
