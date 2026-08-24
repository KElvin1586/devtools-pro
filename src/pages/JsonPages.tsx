import { useMemo, useState } from 'react';
import { validateJson, formatJson, minifyJson, jsonToCsv, csvToJson } from '../lib/json';
import { ToolHeader, ErrorBanner, TextArea, CopyButton, ExportButton } from '../components/ui';
import { addHistoryEntry } from '../lib/history';
import { useEntitlement } from '../context/EntitlementContext';

function useRun(toolId: string, toolName: string) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { premium } = useEntitlement();
  const run = (fn: () => string, action: string) => {
    setError(null);
    try {
      const result = fn();
      setOutput(result);
      if (premium) {
        addHistoryEntry({ toolId, toolName, action, preview: result.slice(0, 120) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setOutput('');
    }
  };
  return { input, setInput, output, error, run };
}

// ---------------- JSON Formatter & Validator (FREE) ----------------
export function JsonFormatterPage() {
  const { input, setInput, output, error, run } = useRun('json-formatter', 'JSON Formatter');
  const validation = useMemo(() => (input.trim() ? validateJson(input) : null), [input]);
  return (
    <div>
      <ToolHeader title="JSON Formatter & Validator" description="Pretty-print JSON and check it for syntax errors — instant, offline, private." />
      <ErrorBanner message={error} />
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col">
          <TextArea label="Input JSON" value={input} onChange={setInput} placeholder='{"name":"DevTools Pro","tools":42}' />
          {validation && (
            <p className={`mt-2 text-sm ${validation.valid ? 'text-green-400' : 'text-red-400'}`} role="status">
              {validation.valid ? '✓ Valid JSON' : `✗ ${validation.error}`}
            </p>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-2 lg:self-end">
          <button className="btn btn-primary" onClick={() => run(() => formatJson(input, 2), 'Format')}>Format</button>
          <CopyButton text={output} />
          <ExportButton content={output} filename="formatted.json" />
        </div>
        <TextArea label="Formatted output" value={output} readOnly placeholder="Result appears here…" />
      </div>
    </div>
  );
}

// ---------------- JSON Minifier (PREMIUM) ----------------
export function JsonMinifierPage() {
  const { input, setInput, output, error, run } = useRun('json-minifier', 'JSON Minifier');
  return (
    <div>
      <ToolHeader title="JSON Minifier" description="Compress JSON by removing all whitespace." />
      <ErrorBanner message={error} />
      <div className="flex flex-col gap-3 lg:flex-row">
        <TextArea label="Input JSON" value={input} onChange={setInput} placeholder='{"a": 1, "b": [2, 3]}' />
        <div className="flex flex-col items-stretch gap-2 lg:self-end">
          <button className="btn btn-primary" onClick={() => run(() => minifyJson(input), 'Minify')}>Minify</button>
          <CopyButton text={output} />
          <ExportButton content={output} filename="minified.json" />
        </div>
        <TextArea label="Minified output" value={output} readOnly />
      </div>
    </div>
  );
}

// ---------------- JSON ↔ CSV (PREMIUM) ----------------
export function JsonCsvPage() {
  const { input, setInput, output, error, run } = useRun('json-csv', 'JSON ↔ CSV Converter');
  return (
    <div>
      <ToolHeader title="JSON ↔ CSV Converter" description="Convert JSON arrays to CSV and back. Nested objects are flattened with dot paths." />
      <ErrorBanner message={error} />
      <div className="flex flex-col gap-3 lg:flex-row">
        <TextArea label="Input (JSON or CSV)" value={input} onChange={setInput} placeholder='[{"id":1,"name":"Ada"}]' />
        <div className="flex flex-col items-stretch gap-2 lg:self-end">
          <button className="btn btn-primary" onClick={() => run(() => jsonToCsv(input), 'JSON → CSV')}>JSON → CSV</button>
          <button className="btn" onClick={() => run(() => csvToJson(input), 'CSV → JSON')}>CSV → JSON</button>
          <CopyButton text={output} />
          <ExportButton content={output} filename="converted.txt" />
        </div>
        <TextArea label="Output" value={output} readOnly />
      </div>
    </div>
  );
}
