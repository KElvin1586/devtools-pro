import { describe, it, expect } from 'vitest';
import {
  generateUUID,
  generateUUIDs,
  hashText,
  timestampToDate,
  dateToTimestamp,
  convertColor,
  hexToRgb,
  rgbToHex,
  decodeJwt,
  testRegex,
  generateLorem,
} from '../src/lib/developer';
import { md5 } from '../src/lib/md5';

describe('UUID', () => {
  it('generates valid v4 UUIDs', () => {
    const id = generateUUID();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });
  it('generates unique values in bulk', () => {
    const ids = generateUUIDs(50);
    expect(new Set(ids).size).toBe(50);
  });
  it('clamps count to 1..1000', () => {
    expect(generateUUIDs(0)).toHaveLength(1);
    expect(generateUUIDs(5000)).toHaveLength(1000);
  });
});

describe('hash', () => {
  it('md5 matches known vectors', () => {
    expect(md5('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5('The quick brown fox jumps over the lazy dog')).toBe('9e107d9d372bb6826bd81d3542a419d6');
  });
  it('sha-256 matches known vector', async () => {
    expect(await hashText('abc', 'SHA-256')).toBe('ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  });
  it('sha-1 matches known vector', async () => {
    expect(await hashText('abc', 'SHA-1')).toBe('a9993e364706816aba3e25717850c26c9cd0d89d');
  });
  it('sha-512 matches known vector', async () => {
    expect(await hashText('abc', 'SHA-512')).toBe(
      'ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f'
    );
  });
});

describe('timestamp', () => {
  it('treats large values as milliseconds', () => {
    const info = timestampToDate(1700000000000);
    expect(info.isUnixMillis).toBe(true);
    expect(info.unixSeconds).toBe(1700000000);
  });
  it('treats small values as seconds', () => {
    const info = timestampToDate(1700000000);
    expect(info.isUnixMillis).toBe(false);
    expect(info.iso).toBe('2023-11-14T22:13:20.000Z');
  });
  it('converts ISO back to timestamps', () => {
    const r = dateToTimestamp('2023-11-14T22:13:20.000Z');
    expect(r).not.toBeNull();
    expect(r!.unixSeconds).toBe(1700000000);
  });
  it('returns null for invalid dates', () => {
    expect(dateToTimestamp('not a date')).toBeNull();
  });
});

describe('color', () => {
  it('hex → rgb', () => {
    expect(hexToRgb('#4C8DFF')).toEqual({ r: 76, g: 141, b: 255 });
    expect(hexToRgb('fff')).toEqual({ r: 255, g: 255, b: 255 });
  });
  it('rgb → hex', () => {
    expect(rgbToHex(76, 141, 255)).toBe('#4C8DFF');
    expect(rgbToHex(0, 0, 0)).toBe('#000000');
  });
  it('rejects invalid hex', () => {
    expect(hexToRgb('#12')).toBeNull();
    expect(hexToRgb('nope')).toBeNull();
  });
  it('converts rgb() string input', () => {
    const c = convertColor('rgb(255, 0, 0)');
    expect(c?.hex).toBe('#FF0000');
    expect(c?.hsl).toEqual({ h: 0, s: 100, l: 50 });
  });
  it('converts to hsv', () => {
    const c = convertColor('#00FF00');
    expect(c?.hsv).toEqual({ h: 120, s: 100, v: 100 });
  });
  it('returns null for garbage', () => {
    expect(convertColor('purple-ish')).toBeNull();
  });
});

describe('jwt', () => {
  // {"alg":"HS256","typ":"JWT"}.{"sub":"1234","exp":2000000000}.sig
  const token =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0IiwiZXhwIjoyMDAwMDAwMDAwfQ.signature';
  it('decodes header and payload', () => {
    const r = decodeJwt(token);
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.decoded.header.alg).toBe('HS256');
      expect(r.decoded.payload.sub).toBe('1234');
      expect(r.decoded.expired).toBe(false);
      expect(r.decoded.expiresAt).toBe('2033-05-18T03:33:20.000Z');
    }
  });
  it('rejects tokens without 3 parts', () => {
    const r = decodeJwt('a.b');
    expect(r.ok).toBe(false);
  });
  it('rejects non-JSON payloads', () => {
    const r = decodeJwt('bm90anNvbg.bm90anNvbg.c2ln');
    expect(r.ok).toBe(false);
  });
});

describe('regex', () => {
  it('finds matches with indices', () => {
    const r = testRegex('\\d+', 'g', 'a1 b22 c333');
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.matches.map((m) => m.match)).toEqual(['1', '22', '333']);
      expect(r.matches[1].index).toBe(4);
    }
  });
  it('exposes capture groups', () => {
    const r = testRegex('(\\w+)@(\\w+)', 'g', 'ada@lovelace');
    expect(r.ok && r.matches[0].groups).toEqual(['ada', 'lovelace']);
  });
  it('adds the g flag when missing', () => {
    const r = testRegex('\\d', '', '1 2 3');
    expect(r.ok && r.matches.length).toBe(3);
  });
  it('handles empty-match patterns without hanging', () => {
    const r = testRegex('a*', 'g', 'bbb');
    expect(r.ok).toBe(true);
  });
  it('reports invalid patterns', () => {
    const r = testRegex('(', 'g', 'x');
    expect(r.ok).toBe(false);
  });
});

describe('lorem', () => {
  it('generates the requested paragraph count', () => {
    expect(generateLorem(3).split('\n\n')).toHaveLength(3);
  });
  it('clamps between 1 and 20 paragraphs', () => {
    expect(generateLorem(0).split('\n\n')).toHaveLength(1);
    expect(generateLorem(99).split('\n\n')).toHaveLength(20);
  });
  it('starts sentences with capitals and ends with periods', () => {
    const text = generateLorem(1);
    expect(/^[A-Z]/.test(text)).toBe(true);
    expect(text.endsWith('.')).toBe(true);
  });
});
