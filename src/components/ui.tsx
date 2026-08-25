import { useState, type ReactNode } from 'react';
import { useEntitlement } from '../context/EntitlementContext';

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="btn"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          const ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          ta.remove();
        }
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? '✓ Copied' : label}
    </button>
  );
}

/** Download output as a file. Premium-gated export feature. */
export function ExportButton({ content, filename }: { content: string; filename: string }) {
  const { premium, requestUpgrade } = useEntitlement();
  const download = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  if (!premium) {
    return (
      <button className="btn" onClick={() => requestUpgrade('Export to file')} aria-label="Export — Premium feature">
        🔒 Export
      </button>
    );
  }
  return (
    <button className="btn" onClick={download}>
      ⬇ Export
    </button>
  );
}

export function ToolHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {actions}
      </div>
      <p className="mt-1 text-sm text-gray-400">{description}</p>
    </header>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div role="alert" className="mb-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
      {message}
    </div>
  );
}

export function TextArea({
  value,
  onChange,
  placeholder,
  label,
  rows = 10,
  readOnly = false,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  label: string;
  rows?: number;
  readOnly?: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <label className="label">{label}</label>
      <textarea
        className="field resize-y"
        style={{ minHeight: `${rows * 1.4}rem` }}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}
