import { useState, type ComponentType } from 'react';
import { formatHtml, minifyHtml, formatCss, minifyCss, formatJs, minifyJs } from '../lib/web';
import { ToolHeader, TextArea, CopyButton, ExportButton } from '../components/ui';
import { addHistoryEntry } from '../lib/history';
import { useEntitlement } from '../context/EntitlementContext';

function CodeToolPage({
  toolId,
  title,
  description,
  placeholder,
  format,
  minify,
}: {
  toolId: string;
  title: string;
  description: string;
  placeholder: string;
  format: (v: string) => string;
  minify: (v: string) => string;
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const { premium } = useEntitlement();
  const apply = (fn: (v: string) => string, action: string) => {
    const result = fn(input);
    setOutput(result);
    if (premium) addHistoryEntry({ toolId, toolName: title, action, preview: result.slice(0, 120) });
  };
  return (
    <div>
      <ToolHeader title={title} description={description} />
      <div className="grid gap-3 lg:grid-cols-2">
        <TextArea label="Input" value={input} onChange={setInput} placeholder={placeholder} />
        <TextArea label="Output" value={output} readOnly />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => apply(format, 'Format')}>Format</button>
        <button className="btn" onClick={() => apply(minify, 'Minify')}>Minify</button>
        <CopyButton text={output} />
        <ExportButton content={output} filename={`${toolId}.txt`} />
      </div>
    </div>
  );
}

export const HtmlToolPage: ComponentType = () => (
  <CodeToolPage
    toolId="html-tool"
    title="HTML Formatter & Minifier"
    description="Beautify markup or compress it for production."
    placeholder="<div><p>Hello</p></div>"
    format={(v) => formatHtml(v, 2)}
    minify={minifyHtml}
  />
);

export const CssToolPage: ComponentType = () => (
  <CodeToolPage
    toolId="css-tool"
    title="CSS Formatter & Minifier"
    description="Reformat stylesheets or strip them down to the smallest form."
    placeholder="body{color:red}"
    format={(v) => formatCss(v, 2)}
    minify={minifyCss}
  />
);

export const JsToolPage: ComponentType = () => (
  <CodeToolPage
    toolId="js-tool"
    title="JavaScript Formatter & Minifier"
    description="Pretty-print JS snippets or collapse them into a single line. Tokens are preserved."
    placeholder="function greet(name){return 'hi '+name;}"
    format={(v) => formatJs(v, 2)}
    minify={minifyJs}
  />
);
