import { describe, it, expect } from 'vitest';
import { base64Encode, base64Decode, urlEncode, urlDecode } from '../src/lib/encoding';

describe('base64', () => {
  it('encodes ASCII', () => {
    expect(base64Encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
  });
  it('round-trips ASCII', () => {
    expect(base64Decode(base64Encode('devtools'))).toBe('devtools');
  });
  it('round-trips Unicode', () => {
    const s = '你好，世界 🌍';
    expect(base64Decode(base64Encode(s))).toBe(s);
  });
  it('tolerates whitespace in decode input', () => {
    expect(base64Decode('SGVsbG8sIFdvcmxkIQ==\n')).toBe('Hello, World!');
  });
  it('throws on invalid base64', () => {
    expect(() => base64Decode('!!!not-base64!!!')).toThrow();
  });
});

describe('url encoding', () => {
  it('encodes reserved characters', () => {
    expect(urlEncode('a b&c=d')).toBe('a%20b%26c%3Dd');
  });
  it('round-trips', () => {
    const s = 'https://my-site.dev/?q=hello world&lang=fr';
    expect(urlDecode(urlEncode(s))).toBe(s);
  });
  it('decodes percent sequences', () => {
    expect(urlDecode('%E4%BD%A0%E5%A5%BD')).toBe('你好');
  });
  it('throws on malformed percent sequences', () => {
    expect(() => urlDecode('%zz')).toThrow();
  });
});
