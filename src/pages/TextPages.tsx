import { useMemo, useState } from 'react';
import { convertCase, analyzeText, removeDuplicateLines, sortLines, type CaseType, type SortMode } from '../lib/text';
import { ToolHeader, TextArea, CopyButton, ExportButton } from '../components/ui';
import { addHistoryEntry } from '../lib/history';
import { useEntitlement } from '../context/EntitlementContext';

function useTextRun(toolId: string, toolName: string) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { premium } = useEntitlement();
  const apply = (fn: (v: string) => string, action: string) => {
    const result = fn(input);
    setOutput(result);
    if (premium) addHistoryEntry({ toolId, toolName, action, preview: result.slice(0, 120) });
  };
  return { input, setInput, output, apply };
}

// ---------------- Case Converter (FREE) ----------------
const CASES: { id: CaseType; label: string }[] = [
  { id: 'lower', label: 'lowercase' },
  { id: 'upper', label: 'UPPERCASE' },
  { id: 'title', label: 'Title Case' },
  { id: 'sentence', label: 'Sentence case' },
  { id: 'camel', label: 'camelCase' },
  { id: 'pascal', label: 'PascalCase' },
  { id: 'snake', label: 'snake_case' },
  { id: 'kebab', label: 'kebab-case' },
  { id: 'constant', label: 'CONSTANT_CASE' },
];

export function CaseConverterPage() {
  const { input, setInput, output, apply } = useTextRun('case-converter', 'Case Converter');
  return (
    <div>
      <ToolHeader title="Case Converter" description="Convert text between lowercase, UPPERCASE, camelCase, snake_case and more." />
      <div className="grid gap-3 lg:grid-cols-2">
        <TextArea label="Input text" value={input} onChange={setInput} placeholder="Type or paste text…" />
        <TextArea label="Output" value={output} readOnly />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Case options">
        {CASES.map((c) => (
          <button key={c.id} className="btn" onClick={() => apply((v) => convertCase(v, c.id), c.label)}>
            {c.label}
          </button>
        ))}
        <span className="mx-1 border-l border-surface-600" aria-hidden="true" />
        <CopyButton text={output} />
        <ExportButton content={output} filename="case-converted.txt" />
      </div>
    </div>
  );
}

// ---------------- Word Counter (FREE) ----------------
export function WordCounterPage() {
  const [input, setInput] = useState('');
  const stats = useMemo(() => analyzeText(input), [input]);
  const items: { label: string; value: number }[] = [
    { label: 'Characters', value: stats.characters },
    { label: 'Characters (no spaces)', value: stats.charactersNoSpaces },
    { label: 'Words', value: stats.words },
    { label: 'Sentences', value: stats.sentences },
    { label: 'Paragraphs', value: stats.paragraphs },
    { label: 'Lines', value: stats.lines },
  ];
  return (
    <div>
      <ToolHeader title="Word & Character Counter" description="Live statistics for your text, computed locally as you type." />
      <TextArea label="Text" value={input} onChange={setInput} placeholder="Start typing…" />
      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6" aria-live="polite">
        {items.map((item) => (
          <div key={item.label} className="panel p-3 text-center">
            <dt className="text-xs uppercase tracking-wide text-gray-400">{item.label}</dt>
            <dd className="mt-1 text-2xl font-bold text-accent-500">{item.value.toLocaleString()}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

// ---------------- Duplicate Line Remover (FREE) ----------------
export function DedupeLinesPage() {
  const { input, setInput, output, apply } = useTextRun('dedupe-lines', 'Remove Duplicate Lines');
  return (
    <div>
      <ToolHeader title="Remove Duplicate Lines" description="Strip repeated lines while preserving original order." />
      <div className="grid gap-3 lg:grid-cols-2">
        <TextArea label="Input (one entry per line)" value={input} onChange={setInput} placeholder={'apple\nbanana\napple'} />
        <TextArea label="Output" value={output} readOnly />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={() => apply(removeDuplicateLines, 'Remove duplicates')}>Remove duplicates</button>
        <CopyButton text={output} />
        <ExportButton content={output} filename="deduped.txt" />
      </div>
    </div>
  );
}

// ---------------- Sort Lines (FREE) ----------------
const SORT_MODES: { id: SortMode; label: string }[] = [
  { id: 'asc', label: 'A → Z' },
  { id: 'desc', label: 'Z → A' },
  { id: 'natural', label: 'Natural (item2 < item10)' },
  { id: 'lengthAsc', label: 'Shortest first' },
  { id: 'lengthDesc', label: 'Longest first' },
];

export function SortLinesPage() {
  const { input, setInput, output, apply } = useTextRun('sort-lines', 'Sort Lines');
  return (
    <div>
      <ToolHeader title="Sort Lines" description="Sort lines alphabetically, naturally, or by length." />
      <div className="grid gap-3 lg:grid-cols-2">
        <TextArea label="Input" value={input} onChange={setInput} placeholder={'pear\napple\nfig'} />
        <TextArea label="Output" value={output} readOnly />
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Sort modes">
        {SORT_MODES.map((m) => (
          <button key={m.id} className="btn" onClick={() => apply((v) => sortLines(v, m.id), m.label)}>
            {m.label}
          </button>
        ))}
        <span className="mx-1 border-l border-surface-600" aria-hidden="true" />
        <CopyButton text={output} />
        <ExportButton content={output} filename="sorted.txt" />
      </div>
    </div>
  );
}
