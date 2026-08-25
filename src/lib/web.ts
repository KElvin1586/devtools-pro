/** HTML / CSS / JS formatting and minification (pure TypeScript, offline). */

// ---------- HTML ----------
export function formatHtml(input: string, indent = 2): string {
  const unit = ' '.repeat(indent);
  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link',
    'meta', 'param', 'source', 'track', 'wbr',
  ]);
  const tokens = input
    .replace(/>\s+</g, '><')
    .split(/(<[^>]+>)/g)
    .map((t) => t.trim())
    .filter(Boolean);
  let depth = 0;
  const lines: string[] = [];
  for (const token of tokens) {
    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      lines.push(unit.repeat(depth) + token);
    } else if (token.startsWith('<') && token.endsWith('>')) {
      lines.push(unit.repeat(depth) + token);
      const tagMatch = token.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/);
      const tag = tagMatch?.[1]?.toLowerCase() ?? '';
      const selfClosing = token.endsWith('/>') || voidTags.has(tag) || token.startsWith('<!') || token.startsWith('<?');
      if (tag && !selfClosing) depth++;
    } else {
      lines.push(unit.repeat(depth) + token);
    }
  }
  return lines.join('\n');
}

export function minifyHtml(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\s*=\s*/g, '=')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

// ---------- CSS ----------
export function formatCss(input: string, indent = 2): string {
  const unit = ' '.repeat(indent);
  let depth = 0;
  const lines: string[] = [];
  let buffer = '';
  for (const ch of input) {
    buffer += ch;
    if (ch === '{') {
      lines.push(unit.repeat(depth) + buffer.slice(0, -1).trim() + ' {');
      buffer = '';
      depth++;
    } else if (ch === '}') {
      const head = buffer.slice(0, -1).trim();
      if (head) lines.push(unit.repeat(depth) + head);
      buffer = '';
      depth = Math.max(0, depth - 1);
      lines.push(unit.repeat(depth) + '}');
    } else if (ch === ';' && depth > 0) {
      lines.push(unit.repeat(depth) + buffer.trim());
      buffer = '';
    }
  }
  const rest = buffer.trim();
  if (rest) lines.push(unit.repeat(depth) + rest);
  return lines
    .filter((l) => l.trim())
    .map((l) => l.replace(/:\s*/g, ': ').replace(/\s+;/g, ';'))
    .join('\n');
}

export function minifyCss(input: string): string {
  return input
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*([{}:;,>~+])\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}

// ---------- JavaScript ----------
/**
 * Lightweight JS pretty-printer. Minifies first (removing comments/whitespace),
 * then splits on structural characters outside strings and re-indents by brace
 * depth. It preserves tokens rather than re-parsing, so it is safe for everyday
 * snippets.
 */
export function formatJs(input: string, indent = 2): string {
  const unit = ' '.repeat(indent);
  const flat = minifyJs(input);
  const segments: string[] = [];
  let current = '';
  let inString: string | null = null;
  const flush = () => {
    const t = current.trim();
    if (t) segments.push(t);
    current = '';
  };
  for (let i = 0; i < flat.length; i++) {
    const ch = flat[i];
    if (inString) {
      current += ch;
      if (ch === '\\') {
        current += flat[i + 1] ?? '';
        i++;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      current += ch;
    } else if (ch === '{') {
      current += '{';
      flush();
    } else if (ch === '}') {
      flush();
      current = '}';
    } else if (ch === ';') {
      current += ';';
      flush();
    } else {
      current += ch;
    }
  }
  flush();

  let depth = 0;
  return segments
    .map((seg) => {
      const opens = (seg.match(/{/g) ?? []).length;
      const closes = (seg.match(/}/g) ?? []).length;
      const level = seg.startsWith('}') ? Math.max(0, depth - 1) : depth;
      const line = unit.repeat(level) + seg;
      depth = Math.max(0, depth + opens - closes);
      return line;
    })
    .join('\n');
}

export function minifyJs(input: string): string {
  let out = '';
  let inString: string | null = null;
  let inLineComment = false;
  let inBlockComment = false;
  let inRegex = false;
  for (let i = 0; i < input.length; i++) {
    const ch = input[i];
    const next = input[i + 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        i++;
        inBlockComment = false;
      }
      continue;
    }
    if (inString) {
      out += ch;
      if (ch === '\\') {
        out += next ?? '';
        i++;
      } else if (ch === inString) {
        inString = null;
      }
      continue;
    }
    if (inRegex) {
      out += ch;
      if (ch === '\\') {
        out += next ?? '';
        i++;
      } else if (ch === '/') {
        inRegex = false;
      }
      continue;
    }
    if (ch === '/' && next === '/') {
      inLineComment = true;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      inString = ch;
      out += ch;
      continue;
    }
    if (ch === '/' && /[=(,;!&|?:{}[\]\s]$/.test(out.slice(-1) || '(')) {
      inRegex = true;
      out += ch;
      continue;
    }
    if (/\s/.test(ch)) {
      if (out && !/[\s{}()[\];,:&|+\-*/%=<>!?.]/.test(out.slice(-1))) out += ' ';
      continue;
    }
    if (/[{}()[\];,:&|+\-*/%=<>!?.]/.test(ch) && out.endsWith(' ')) out = out.slice(0, -1);
    out += ch;
  }
  return out.trim();
}
