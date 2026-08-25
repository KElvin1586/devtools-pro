/** Text transformation utilities. */

export type CaseType =
  | 'lower'
  | 'upper'
  | 'title'
  | 'sentence'
  | 'camel'
  | 'pascal'
  | 'snake'
  | 'kebab'
  | 'constant';

const WORD_RE = /[a-zA-Z0-9]+/g;

function words(input: string): string[] {
  return input.match(WORD_RE) ?? [];
}

export function convertCase(input: string, type: CaseType): string {
  switch (type) {
    case 'lower':
      return input.toLowerCase();
    case 'upper':
      return input.toUpperCase();
    case 'title':
      return input.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case 'sentence':
      return input
        .toLowerCase()
        .replace(/(^\s*\w|[.!?]\s*\w)/g, (w) => w.toUpperCase());
    case 'camel': {
      const [first, ...rest] = words(input.toLowerCase());
      return first + rest.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    }
    case 'pascal':
      return words(input.toLowerCase())
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');
    case 'snake':
      return words(input.toLowerCase()).join('_');
    case 'kebab':
      return words(input.toLowerCase()).join('-');
    case 'constant':
      return words(input.toUpperCase()).join('_');
  }
}

export interface TextStats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
}

export function analyzeText(input: string): TextStats {
  const lines = input.split(/\r?\n/);
  return {
    characters: input.length,
    charactersNoSpaces: input.replace(/\s/g, '').length,
    words: (input.match(/\S+/g) ?? []).length,
    sentences: (input.match(/[.!?]+(?=\s|$)/g) ?? []).length || (input.trim() ? 1 : 0),
    paragraphs: input.split(/\r?\n\s*\r?\n/).filter((p) => p.trim()).length || (input.trim() ? 1 : 0),
    lines: input ? lines.length : 0,
  };
}

export function removeDuplicateLines(input: string): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const line of input.split(/\r?\n/)) {
    if (!seen.has(line)) {
      seen.add(line);
      out.push(line);
    }
  }
  return out.join('\n');
}

export type SortMode = 'asc' | 'desc' | 'lengthAsc' | 'lengthDesc' | 'natural';

function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g;
  const aParts = a.match(re) ?? [];
  const bParts = b.match(re) ?? [];
  const len = Math.min(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const ap = aParts[i];
    const bp = bParts[i];
    const an = Number(ap);
    const bn = Number(bp);
    const bothNumeric = !isNaN(an) && !isNaN(bn);
    const cmp = bothNumeric ? an - bn : ap.localeCompare(bp);
    if (cmp !== 0) return cmp;
  }
  return aParts.length - bParts.length;
}

export function sortLines(input: string, mode: SortMode = 'asc'): string {
  const lines = input.split(/\r?\n/);
  const sorted = [...lines].sort((a, b) => {
    switch (mode) {
      case 'asc':
        return a.localeCompare(b);
      case 'desc':
        return b.localeCompare(a);
      case 'lengthAsc':
        return a.length - b.length || a.localeCompare(b);
      case 'lengthDesc':
        return b.length - a.length || a.localeCompare(b);
      case 'natural':
        return naturalCompare(a, b);
    }
  });
  return sorted.join('\n');
}
