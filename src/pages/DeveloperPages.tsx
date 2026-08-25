import { useState } from 'react';
import {
  generateUUIDs,
  hashText,
  timestampToDate,
  dateToTimestamp,
  convertColor,
  decodeJwt,
  testRegex,
  generateLorem,
  type HashAlgorithm,
} from '../lib/developer';
import { ToolHeader, ErrorBanner, TextArea, CopyButton, ExportButton } from '../components/ui';
import { PremiumGate } from '../components/PremiumGate';
import { addHistoryEntry } from '../lib/history';
import { useEntitlement } from '../context/EntitlementContext';

// ---------------- UUID (FREE) ----------------
export function UuidPage() {
  const [count, setCount] = useState(1);
  const [uuids, setUuids] = useState<string[]>([]);
  const { premium } = useEntitlement();
  const generate = () => {
    const result = generateUUIDs(count);
    setUuids(result);
    if (premium) addHistoryEntry({ toolId: 'uuid', toolName: 'UUID Generator', action: `Generate ${count}`, preview: result[0] ?? '' });
  };
  const output = uuids.join('\n');
  return (
    <div>
      <ToolHeader title="UUID Generator" description="Cryptographically random v4 UUIDs via the Web Crypto API." />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          Quantity (1–1000)
          <input
            type="number"
            min={1}
            max={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="field w-24"
          />
        </label>
        <button className="btn btn-primary" onClick={generate}>Generate</button>
        <CopyButton text={output} label="Copy all" />
        <ExportButton content={output} filename="uuids.txt" />
        {count > 1 && (
          <PremiumGate feature="Batch UUID generation">
            <span className="text-sm text-gray-400">Bulk list generation</span>
          </PremiumGate>
        )}
      </div>
      <pre className="panel mt-4 max-h-96 overflow-auto p-4 font-mono text-sm text-gray-200" aria-live="polite">
        {output || 'UUIDs will appear here…'}
      </pre>
    </div>
  );
}

// ---------------- Hash (PREMIUM) ----------------
const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

export function HashPage() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState<HashAlgorithm>('SHA-256');
  const [output, setOutput] = useState('');
  const { premium } = useEntitlement();
  const run = async () => {
    const result = await hashText(input, algorithm);
    setOutput(result);
    if (premium) addHistoryEntry({ toolId: 'hash', toolName: 'Hash Generator', action: algorithm, preview: result });
  };
  return (
    <div>
      <ToolHeader title="Hash Generator" description="MD5 and SHA family digests computed locally via Web Crypto." />
      <TextArea label="Input" value={input} onChange={setInput} placeholder="Text to hash…" rows={4} />
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          Algorithm
          <select className="field w-auto" value={algorithm} onChange={(e) => setAlgorithm(e.target.value as HashAlgorithm)}>
            {ALGORITHMS.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </label>
        <button className="btn btn-primary" onClick={run}>Generate hash</button>
      </div>
      <div className="panel mt-4 flex items-center justify-between gap-3 p-3">
        <code className="break-all font-mono text-sm text-accent-500">{output || 'Digest appears here…'}</code>
        {output && <CopyButton text={output} />}
      </div>
    </div>
  );
}

// ---------------- Timestamp (FREE) ----------------
export function TimestampPage() {
  const [tsInput, setTsInput] = useState('');
  const [isoInput, setIsoInput] = useState('');
  const ts = tsInput.trim() && !isNaN(Number(tsInput)) ? timestampToDate(Number(tsInput)) : null;
  const fromIso = isoInput.trim() ? dateToTimestamp(isoInput) : null;
  return (
    <div>
      <ToolHeader title="Timestamp Converter" description="Unix seconds/milliseconds ↔ ISO 8601, UTC and local time." />
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel p-4">
          <h2 className="font-semibold text-white">Unix timestamp → date</h2>
          <input
            className="field mt-2"
            placeholder={`e.g. ${Math.floor(Date.now() / 1000)}`}
            value={tsInput}
            onChange={(e) => setTsInput(e.target.value)}
            aria-label="Unix timestamp"
          />
          {ts && (
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-400">Detected unit</dt><dd className="font-mono">{ts.isUnixMillis ? 'milliseconds' : 'seconds'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-400">Seconds</dt><dd className="font-mono">{ts.unixSeconds}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-400">Milliseconds</dt><dd className="font-mono">{ts.unixMilliseconds}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-400">ISO 8601</dt><dd className="font-mono">{ts.iso}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-400">UTC</dt><dd className="font-mono">{ts.utc}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-400">Local</dt><dd className="font-mono">{ts.local}</dd></div>
            </dl>
          )}
          <button className="btn mt-3" onClick={() => setTsInput(String(Math.floor(Date.now() / 1000)))}>Use current time</button>
        </section>
        <section className="panel p-4">
          <h2 className="font-semibold text-white">ISO date → timestamp</h2>
          <input
            className="field mt-2"
            placeholder="2024-01-01T00:00:00Z"
            value={isoInput}
            onChange={(e) => setIsoInput(e.target.value)}
            aria-label="ISO date"
          />
          {fromIso && (
            <dl className="mt-3 space-y-1.5 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-400">Seconds</dt><dd className="font-mono">{fromIso.unixSeconds}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-400">Milliseconds</dt><dd className="font-mono">{fromIso.unixMilliseconds}</dd></div>
            </dl>
          )}
          {isoInput.trim() && !fromIso && <p className="mt-3 text-sm text-red-400">Unrecognized date format.</p>}
          <button className="btn mt-3" onClick={() => setIsoInput(new Date().toISOString())}>Use current time</button>
        </section>
      </div>
    </div>
  );
}

// ---------------- Color (FREE; HSL/HSV premium) ----------------
export function ColorPage() {
  const [input, setInput] = useState('#4C8DFF');
  const { premium } = useEntitlement();
  const result = input.trim() ? convertColor(input) : null;
  const swatch = result ? result.hex : '#000000';
  return (
    <div>
      <ToolHeader title="Color Converter" description="Convert between HEX, RGB, HSL and HSV. Enter #hex or rgb(r, g, b)." />
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="field w-64"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="#4C8DFF or rgb(76, 141, 255)"
          aria-label="Color value"
        />
        <span className="h-10 w-16 rounded-md border border-surface-600" style={{ backgroundColor: swatch }} aria-label="Color preview" />
        {result && (
          <div className="flex gap-2 text-sm font-mono">
            <CopyButton text={result.hex} label={result.hex} />
            <CopyButton text={`rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`} label={`rgb(${result.rgb.r}, ${result.rgb.g}, ${result.rgb.b})`} />
          </div>
        )}
        {input.trim() && !result && <p className="text-sm text-red-400">Unrecognized color format.</p>}
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <section className="panel p-4">
          <h2 className="text-sm font-semibold text-gray-300">HSL</h2>
          {premium ? (
            result && (
              <p className="mt-2 font-mono text-lg text-accent-500">
                hsl({result.hsl.h}, {result.hsl.s}%, {result.hsl.l}%)
              </p>
            )
          ) : (
            <PremiumGate feature="HSL conversion">
              <p className="mt-2 font-mono text-lg">
                {result ? `hsl(${result.hsl.h}, ${result.hsl.s}%, ${result.hsl.l}%)` : 'hsl(—, —%, —%)'}
              </p>
            </PremiumGate>
          )}
        </section>
        <section className="panel p-4">
          <h2 className="text-sm font-semibold text-gray-300">HSV</h2>
          {premium ? (
            result && (
              <p className="mt-2 font-mono text-lg text-accent-500">
                hsv({result.hsv.h}, {result.hsv.s}%, {result.hsv.v}%)
              </p>
            )
          ) : (
            <PremiumGate feature="HSV conversion">
              <p className="mt-2 font-mono text-lg">
                {result ? `hsv(${result.hsv.h}, ${result.hsv.s}%, ${result.hsv.v}%)` : 'hsv(—, —%, —%)'}
              </p>
            </PremiumGate>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------- Regex Tester (PREMIUM) ----------------
export function RegexPage() {
  const [pattern, setPattern] = useState('\\b\\w+@\\w+\\.com\\b');
  const [flags, setFlags] = useState('gi');
  const [input, setInput] = useState('');
  const result = input || pattern ? testRegex(pattern, flags, input) : null;
  return (
    <div>
      <ToolHeader title="Regex Tester" description="Test JavaScript regular expressions with match highlighting and capture groups." />
      <div className="flex flex-wrap gap-3">
        <label className="flex-1">
          <span className="label">Pattern</span>
          <input className="field" value={pattern} onChange={(e) => setPattern(e.target.value)} placeholder="\\d+" />
        </label>
        <label className="w-28">
          <span className="label">Flags</span>
          <input className="field" value={flags} onChange={(e) => setFlags(e.target.value)} placeholder="gim" />
        </label>
      </div>
      <div className="mt-3">
        <TextArea label="Test string" value={input} onChange={setInput} placeholder="Text to match against…" rows={5} />
      </div>
      {result && !result.ok && <p className="mt-2 text-sm text-red-400">{result.error}</p>}
      {result?.ok && (
        <div className="panel mt-3 p-4">
          <p className="text-sm text-gray-400">{result.matches.length} match{result.matches.length === 1 ? '' : 'es'}</p>
          <ul className="mt-2 space-y-1 font-mono text-sm">
            {result.matches.slice(0, 50).map((m, i) => (
              <li key={i} className="flex flex-wrap gap-2">
                <span className="text-gray-500">#{m.index}</span>
                <mark className="rounded bg-green-500/20 px-1 text-green-300">{m.match}</mark>
                {m.groups.length > 0 && <span className="text-gray-400">groups: {m.groups.join(' | ')}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ---------------- JWT Decoder (PREMIUM) ----------------
export function JwtPage() {
  const [token, setToken] = useState('');
  const result = token.trim() ? decodeJwt(token) : null;
  return (
    <div>
      <ToolHeader title="JWT Decoder" description="Inspect header and payload of a JSON Web Token locally. Signature is shown, not verified." />
      <TextArea label="Token" value={token} onChange={setToken} placeholder="eyJhbGciOi…" rows={4} />
      <ErrorBanner message={result && !result.ok ? result.error : null} />
      {result?.ok && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <section>
            <h2 className="label">Header</h2>
            <pre className="panel max-h-64 overflow-auto p-3 font-mono text-sm text-accent-500">{JSON.stringify(result.decoded.header, null, 2)}</pre>
          </section>
          <section>
            <h2 className="label">Payload</h2>
            <pre className="panel max-h-64 overflow-auto p-3 font-mono text-sm text-green-300">{JSON.stringify(result.decoded.payload, null, 2)}</pre>
          </section>
          {result.decoded.expiresAt && (
            <p className={`text-sm ${result.decoded.expired ? 'text-red-400' : 'text-green-400'}`}>
              {result.decoded.expired ? '✗ Expired' : '✓ Valid until'} {result.decoded.expiresAt}
            </p>
          )}
          <section className="lg:col-span-2">
            <h2 className="label">Signature</h2>
            <code className="panel block break-all p-3 font-mono text-xs text-gray-400">{result.decoded.signature}</code>
          </section>
        </div>
      )}
    </div>
  );
}

// ---------------- Lorem Ipsum (PREMIUM) ----------------
export function LoremPage() {
  const [paragraphs, setParagraphs] = useState(3);
  const [output, setOutput] = useState('');
  return (
    <div>
      <ToolHeader title="Lorem Ipsum Generator" description="Placeholder text for mockups and prototypes." />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          Paragraphs
          <input type="number" min={1} max={20} value={paragraphs} onChange={(e) => setParagraphs(Number(e.target.value))} className="field w-20" />
        </label>
        <button className="btn btn-primary" onClick={() => setOutput(generateLorem(paragraphs))}>Generate</button>
        <CopyButton text={output} />
        <ExportButton content={output} filename="lorem.txt" />
      </div>
      <div className="panel mt-4 max-h-96 overflow-auto whitespace-pre-wrap p-4 text-sm leading-relaxed text-gray-300">
        {output || 'Generated text appears here…'}
      </div>
    </div>
  );
}
