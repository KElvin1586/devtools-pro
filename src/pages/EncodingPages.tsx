import { useState } from 'react';
import { base64Encode, base64Decode, urlEncode, urlDecode } from '../lib/encoding';
import { ToolHeader, ErrorBanner, TextArea, CopyButton, ExportButton } from '../components/ui';
import { PremiumGate } from '../components/PremiumGate';
import { addHistoryEntry } from '../lib/history';
import { useEntitlement } from '../context/EntitlementContext';

function useEncoding(toolId: string, toolName: string) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { premium } = useEntitlement();
  const apply = (fn: (v: string) => string, action: string) => {
    try {
      const result = fn(input);
      setOutput(result);
      setError(null);
      if (premium) addHistoryEntry({ toolId, toolName, action, preview: result.slice(0, 120) });
    } catch (err) {
      setError(err instanceof Error ? `Invalid input: ${err.message}` : 'Invalid input');
      setOutput('');
    }
  };
  return { input, setInput, output, error, apply };
}

// ---------------- Base64 (FREE, batch = PREMIUM) ----------------
export function Base64Page() {
  const { input, setInput, output, error, apply } = useEncoding('base64', 'Base64');
  const batch = (mode: 'encode' | 'decode') => {
    const fn = mode === 'encode' ? base64Encode : base64Decode;
    apply((v) => v.split(/\r?\n/).map((line) => (line.trim() ? fn(line) : line)).join('\n'), `Batch ${mode}`);
  };
  return (
    <div>
      <ToolHeader title="Base64 Encoder / Decoder" description="Unicode-safe Base64 conversion, fully offline." />
      <ErrorBanner message={error} />
      <div className="grid gap-3 lg:grid-cols-2">
        <TextArea label="Input" value={input} onChange={setInput} placeholder="Hello, developer!" />
        <TextArea label="Output" value={output} readOnly />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => apply(base64Encode, 'Encode')}>Encode</button>
        <button className="btn" onClick={() => apply(base64Decode, 'Decode')}>Decode</button>
        <PremiumGate feature="Batch processing">
          <span className="flex gap-2">
            <button className="btn" onClick={() => batch('encode')}>Encode each line</button>
            <button className="btn" onClick={() => batch('decode')}>Decode each line</button>
          </span>
        </PremiumGate>
        <CopyButton text={output} />
        <ExportButton content={output} filename="base64.txt" />
      </div>
    </div>
  );
}

// ---------------- URL Encoder (FREE) ----------------
export function UrlEncoderPage() {
  const { input, setInput, output, error, apply } = useEncoding('url-encoder', 'URL Encoder');
  return (
    <div>
      <ToolHeader title="URL Encoder / Decoder" description="Percent-encode or decode URL components safely." />
      <ErrorBanner message={error} />
      <div className="grid gap-3 lg:grid-cols-2">
        <TextArea label="Input" value={input} onChange={setInput} placeholder="query=hello world&lang=en" />
        <TextArea label="Output" value={output} readOnly />
      </div>
      <div className="mt-3 flex gap-2">
        <button className="btn btn-primary" onClick={() => apply(urlEncode, 'Encode')}>Encode</button>
        <button className="btn" onClick={() => apply(urlDecode, 'Decode')}>Decode</button>
        <CopyButton text={output} />
        <ExportButton content={output} filename="url.txt" />
      </div>
    </div>
  );
}
