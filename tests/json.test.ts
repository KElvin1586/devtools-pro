import { describe, it, expect } from 'vitest';
import { validateJson, formatJson, minifyJson, jsonToCsv, csvToJson } from '../src/lib/json';

describe('validateJson', () => {
  it('accepts valid JSON', () => {
    expect(validateJson('{"a":1}').valid).toBe(true);
    expect(validateJson('[1,2,3]').valid).toBe(true);
    expect(validateJson('"hello"').valid).toBe(true);
  });
  it('rejects invalid JSON with an error message', () => {
    const r = validateJson('{a:1}');
    expect(r.valid).toBe(false);
    expect(r.error).toBeTruthy();
  });
  it('rejects empty input', () => {
    expect(validateJson('   ').valid).toBe(false);
  });
});

describe('formatJson', () => {
  it('pretty-prints with 2-space indent', () => {
    expect(formatJson('{"a":1,"b":[2,3]}')).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}');
  });
  it('supports custom indent', () => {
    expect(formatJson('{"a":1}', 4)).toBe('{\n    "a": 1\n}');
  });
  it('throws on invalid input', () => {
    expect(() => formatJson('nope{')).toThrow();
  });
});

describe('minifyJson', () => {
  it('removes whitespace', () => {
    expect(minifyJson('{ "a": 1, "b": [ 2, 3 ] }')).toBe('{"a":1,"b":[2,3]}');
  });
});

describe('jsonToCsv', () => {
  it('converts an array of objects to CSV', () => {
    const csv = jsonToCsv('[{"id":1,"name":"Ada"},{"id":2,"name":"Grace"}]');
    expect(csv).toBe('id,name\n1,Ada\n2,Grace');
  });
  it('handles a single object', () => {
    expect(jsonToCsv('{"a":1}')).toBe('a\n1');
  });
  it('escapes commas and quotes', () => {
    const csv = jsonToCsv('[{"v":"a,b"},{"v":"say \\"hi\\""}]');
    expect(csv).toContain('"a,b"');
    expect(csv).toContain('"say ""hi"""');
  });
  it('flattens nested objects with dot paths', () => {
    const csv = jsonToCsv('[{"user":{"name":"Ada"}}]');
    expect(csv.split('\n')[0]).toBe('user.name');
  });
});

describe('csvToJson', () => {
  it('parses CSV into objects', () => {
    const json = csvToJson('id,name\n1,Ada\n2,Grace');
    expect(JSON.parse(json)).toEqual([
      { id: '1', name: 'Ada' },
      { id: '2', name: 'Grace' },
    ]);
  });
  it('handles quoted cells with commas', () => {
    const json = csvToJson('v\n"a,b"');
    expect(JSON.parse(json)).toEqual([{ v: 'a,b' }]);
  });
  it('round-trips with jsonToCsv', () => {
    const original = '[{"id":"1","name":"Ada, Lovelace"}]';
    const back = JSON.parse(csvToJson(jsonToCsv(original)));
    expect(back).toEqual(JSON.parse(original));
  });
  it('returns empty array for empty input', () => {
    expect(csvToJson('')).toBe('[]');
  });
});
