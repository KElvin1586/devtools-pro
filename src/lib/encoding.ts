/** Encoding utilities: Base64 and URL encoding. All operations are Unicode-safe. */

function utf8Encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function utf8Decode(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}

export function base64Encode(input: string): string {
  const bytes = utf8Encode(input);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

export function base64Decode(input: string): string {
  const cleaned = input.replace(/\s/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return utf8Decode(bytes);
}

export function urlEncode(input: string): string {
  return encodeURIComponent(input);
}

export function urlDecode(input: string): string {
  return decodeURIComponent(input);
}
