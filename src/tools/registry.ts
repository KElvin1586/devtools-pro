import type { ComponentType } from 'react';
import { JsonFormatterPage, JsonMinifierPage, JsonCsvPage } from '../pages/JsonPages';
import { CaseConverterPage, WordCounterPage, DedupeLinesPage, SortLinesPage } from '../pages/TextPages';
import { Base64Page, UrlEncoderPage } from '../pages/EncodingPages';
import { HtmlToolPage, CssToolPage, JsToolPage } from '../pages/WebPages';
import { UuidPage, HashPage, TimestampPage, ColorPage, RegexPage, JwtPage, LoremPage } from '../pages/DeveloperPages';
import { HistoryPage } from '../pages/SystemPages';

export const CATEGORIES = ['JSON', 'Text', 'Encoding', 'Web', 'Developer', 'Premium'] as const;
export type Category = (typeof CATEGORIES)[number];

export interface ToolDefinition {
  id: string;
  path: string;
  name: string;
  description: string;
  category: Category;
  /** true = requires the Premium plan. Free users see 🔒 PREMIUM + upgrade modal. */
  premium: boolean;
  keywords: string[];
  component: ComponentType;
}

export const TOOLS: ToolDefinition[] = [
  // ---- JSON ----
  {
    id: 'json-formatter',
    path: '/json/formatter',
    name: 'JSON Formatter & Validator',
    description: 'Pretty-print JSON with live syntax validation.',
    category: 'JSON',
    premium: false,
    keywords: ['json', 'format', 'pretty', 'validate', 'lint'],
    component: JsonFormatterPage,
  },
  {
    id: 'json-minifier',
    path: '/json/minifier',
    name: 'JSON Minifier',
    description: 'Compress JSON into its smallest valid form.',
    category: 'JSON',
    premium: true,
    keywords: ['json', 'minify', 'compress', 'shrink'],
    component: JsonMinifierPage,
  },
  {
    id: 'json-csv',
    path: '/json/csv',
    name: 'JSON ↔ CSV Converter',
    description: 'Convert JSON arrays to CSV and back.',
    category: 'JSON',
    premium: true,
    keywords: ['json', 'csv', 'convert', 'spreadsheet'],
    component: JsonCsvPage,
  },
  // ---- Text ----
  {
    id: 'case-converter',
    path: '/text/case',
    name: 'Case Converter',
    description: 'lowercase, UPPERCASE, camelCase, snake_case and more.',
    category: 'Text',
    premium: false,
    keywords: ['case', 'camel', 'snake', 'kebab', 'title', 'upper', 'lower'],
    component: CaseConverterPage,
  },
  {
    id: 'word-counter',
    path: '/text/counter',
    name: 'Word & Character Counter',
    description: 'Live counts of words, characters, sentences, paragraphs.',
    category: 'Text',
    premium: false,
    keywords: ['count', 'words', 'characters', 'stats'],
    component: WordCounterPage,
  },
  {
    id: 'dedupe-lines',
    path: '/text/dedupe',
    name: 'Remove Duplicate Lines',
    description: 'Strip repeated lines, preserving order.',
    category: 'Text',
    premium: false,
    keywords: ['duplicate', 'unique', 'dedupe', 'lines'],
    component: DedupeLinesPage,
  },
  {
    id: 'sort-lines',
    path: '/text/sort',
    name: 'Sort Lines',
    description: 'Alphabetical, natural, or length-based line sorting.',
    category: 'Text',
    premium: false,
    keywords: ['sort', 'order', 'lines', 'alphabetical'],
    component: SortLinesPage,
  },
  // ---- Encoding ----
  {
    id: 'base64',
    path: '/encoding/base64',
    name: 'Base64 Encoder / Decoder',
    description: 'Unicode-safe Base64 encode and decode.',
    category: 'Encoding',
    premium: false,
    keywords: ['base64', 'encode', 'decode', 'b64'],
    component: Base64Page,
  },
  {
    id: 'url-encoder',
    path: '/encoding/url',
    name: 'URL Encoder / Decoder',
    description: 'Percent-encode or decode URL components.',
    category: 'Encoding',
    premium: false,
    keywords: ['url', 'uri', 'percent', 'encode', 'decode'],
    component: UrlEncoderPage,
  },
  // ---- Web ----
  {
    id: 'html-tool',
    path: '/web/html',
    name: 'HTML Formatter & Minifier',
    description: 'Beautify or compress HTML markup.',
    category: 'Web',
    premium: true,
    keywords: ['html', 'markup', 'beautify', 'minify'],
    component: HtmlToolPage,
  },
  {
    id: 'css-tool',
    path: '/web/css',
    name: 'CSS Formatter & Minifier',
    description: 'Reformat or compress stylesheets.',
    category: 'Web',
    premium: true,
    keywords: ['css', 'style', 'beautify', 'minify'],
    component: CssToolPage,
  },
  {
    id: 'js-tool',
    path: '/web/js',
    name: 'JavaScript Formatter & Minifier',
    description: 'Pretty-print or collapse JS snippets.',
    category: 'Web',
    premium: true,
    keywords: ['javascript', 'js', 'beautify', 'minify', 'uglify'],
    component: JsToolPage,
  },
  // ---- Developer ----
  {
    id: 'uuid',
    path: '/developer/uuid',
    name: 'UUID Generator',
    description: 'Random v4 UUIDs from the Web Crypto API.',
    category: 'Developer',
    premium: false,
    keywords: ['uuid', 'guid', 'random', 'id'],
    component: UuidPage,
  },
  {
    id: 'hash',
    path: '/developer/hash',
    name: 'Hash Generator',
    description: 'MD5, SHA-1, SHA-256, SHA-384, SHA-512 digests.',
    category: 'Developer',
    premium: true,
    keywords: ['hash', 'md5', 'sha', 'digest', 'checksum'],
    component: HashPage,
  },
  {
    id: 'timestamp',
    path: '/developer/timestamp',
    name: 'Timestamp Converter',
    description: 'Unix timestamps ↔ ISO / UTC / local dates.',
    category: 'Developer',
    premium: false,
    keywords: ['timestamp', 'unix', 'epoch', 'date', 'time'],
    component: TimestampPage,
  },
  {
    id: 'color',
    path: '/developer/color',
    name: 'Color Converter',
    description: 'HEX ↔ RGB free; HSL/HSV for Premium.',
    category: 'Developer',
    premium: false,
    keywords: ['color', 'hex', 'rgb', 'hsl', 'hsv'],
    component: ColorPage,
  },
  {
    id: 'regex',
    path: '/developer/regex',
    name: 'Regex Tester',
    description: 'Match highlighting and capture-group inspection.',
    category: 'Developer',
    premium: true,
    keywords: ['regex', 'regexp', 'pattern', 'match', 'test'],
    component: RegexPage,
  },
  {
    id: 'jwt',
    path: '/developer/jwt',
    name: 'JWT Decoder',
    description: 'Decode JWT header and payload locally.',
    category: 'Developer',
    premium: true,
    keywords: ['jwt', 'token', 'decode', 'auth'],
    component: JwtPage,
  },
  {
    id: 'lorem',
    path: '/developer/lorem',
    name: 'Lorem Ipsum Generator',
    description: 'Placeholder text for mockups.',
    category: 'Developer',
    premium: true,
    keywords: ['lorem', 'ipsum', 'placeholder', 'text'],
    component: LoremPage,
  },
  // ---- Premium utilities ----
  {
    id: 'history',
    path: '/premium/history',
    name: 'Tool History',
    description: 'Review and clear your local tool-run history.',
    category: 'Premium',
    premium: true,
    keywords: ['history', 'recent', 'log'],
    component: HistoryPage,
  },
];
