/**
 * Pure-TypeScript MD5 (RFC 1321). Web Crypto doesn't expose MD5,
 * so this small implementation keeps the hash tool fully offline.
 */

function leftRotate(x: number, n: number): number {
  return (x << n) | (x >>> (32 - n));
}

export function md5(input: string): string {
  const bytes = new TextEncoder().encode(input);
  const bitLenLow = (bytes.length * 8) >>> 0;
  const bitLenHigh = Math.floor((bytes.length * 8) / 0x100000000) >>> 0;

  const paddedLen = (((bytes.length + 8) >>> 6) + 1) * 64;
  const buf = new Uint8Array(paddedLen);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(paddedLen - 8, bitLenLow, true);
  view.setUint32(paddedLen - 4, bitLenHigh, true);

  let a0 = 0x67452301 | 0;
  let b0 = 0xefcdab89 | 0;
  let c0 = 0x98badcfe | 0;
  let d0 = 0x10325476 | 0;

  const K: number[] = [];
  for (let i = 0; i < 64; i++) K.push(Math.floor(Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0);

  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  const M = new Uint32Array(16);
  for (let offset = 0; offset < paddedLen; offset += 64) {
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(offset + j * 4, true);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) {
        f = (b & c) | (~b & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | (~d & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * i) % 16;
      }
      const tmp = d;
      d = c;
      c = b;
      b = (b + leftRotate((a + f + K[i] + M[g]) | 0, S[i])) | 0;
      a = tmp;
    }
    a0 = (a0 + a) | 0;
    b0 = (b0 + b) | 0;
    c0 = (c0 + c) | 0;
    d0 = (d0 + d) | 0;
  }

  const words = [a0, b0, c0, d0];
  let hex = '';
  for (const w of words) {
    for (let byte = 0; byte < 4; byte++) {
      hex += ((w >>> (byte * 8)) & 0xff).toString(16).padStart(2, '0');
    }
  }
  return hex;
}
