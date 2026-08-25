/** JSON utilities: format, validate, minify, and CSV conversion. */

export interface JsonValidationResult {
  valid: boolean;
  error?: string;
  /** 1-based line/col info when available from the parser message. */
  position?: string;
}

export function validateJson(input: string): JsonValidationResult {
  if (!input.trim()) return { valid: false, error: 'Input is empty' };
  try {
    JSON.parse(input);
    return { valid: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { valid: false, error: message };
  }
}

export function formatJson(input: string, indent = 2): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed, null, indent);
}

export function minifyJson(input: string): string {
  const parsed = JSON.parse(input);
  return JSON.stringify(parsed);
}

type CsvRow = Record<string, unknown>;

function flattenObject(input: unknown, prefix = ''): CsvRow {
  const out: CsvRow = {};
  if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
    for (const [key, value] of Object.entries(input)) {
      const path = prefix ? `${prefix}.${key}` : key;
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(out, flattenObject(value, path));
      } else {
        out[path] = value;
      }
    }
  } else {
    out[prefix || 'value'] = input;
  }
  return out;
}

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  let str: string;
  if (typeof value === 'object') str = JSON.stringify(value);
  else str = String(value);
  if (/[",\n\r]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

/** Convert a JSON array (or single object) into CSV. */
export function jsonToCsv(input: string): string {
  const parsed = JSON.parse(input) as unknown;
  const items = Array.isArray(parsed) ? parsed : [parsed];
  const flattened = items.map((item) => flattenObject(item));
  const headers: string[] = [];
  for (const row of flattened) {
    for (const key of Object.keys(row)) {
      if (!headers.includes(key)) headers.push(key);
    }
  }
  const lines = [headers.map(csvEscape).join(',')];
  for (const row of flattened) {
    lines.push(headers.map((h) => csvEscape(row[h])).join(','));
  }
  return lines.join('\n');
}

function parseCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ',') {
      cells.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  cells.push(current);
  return cells;
}

/** Convert CSV into a JSON array of objects. */
export function csvToJson(input: string): string {
  const lines = input.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return '[]';
  const headers = parseCsvLine(lines[0]);
  const records: Record<string, string>[] = [];
  for (const line of lines.slice(1)) {
    const cells = parseCsvLine(line);
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = cells[idx] ?? '';
    });
    records.push(record);
  }
  return JSON.stringify(records, null, 2);
}
