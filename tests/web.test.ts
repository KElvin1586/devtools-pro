import { describe, it, expect } from 'vitest';
import { formatHtml, minifyHtml, formatCss, minifyCss, formatJs, minifyJs } from '../src/lib/web';

describe('HTML', () => {
  it('formats nested markup with indentation', () => {
    const out = formatHtml('<div><p>Hello</p></div>');
    expect(out).toBe('<div>\n  <p>\n    Hello\n  </p>\n</div>');
  });
  it('keeps void elements flat', () => {
    const out = formatHtml('<div><img src="a.png"><br></div>');
    expect(out).toContain('<img src="a.png">');
    expect(out).toContain('<br>');
  });
  it('minifies markup', () => {
    expect(minifyHtml('<div>\n  <p>  hi  </p>\n</div>')).toBe('<div><p>hi</p></div>');
  });
  it('strips comments when minifying', () => {
    expect(minifyHtml('<div><!-- x --><p>a</p></div>')).toBe('<div><p>a</p></div>');
  });
});

describe('CSS', () => {
  it('formats rules', () => {
    const out = formatCss('body{color:red;margin:0}');
    expect(out).toContain('body {');
    expect(out).toContain('color: red;');
    expect(out).toContain('}');
  });
  it('minifies rules', () => {
    expect(minifyCss('body { color: red; margin: 0; }')).toBe('body{color:red;margin:0}');
  });
  it('strips comments when minifying', () => {
    expect(minifyCss('/* c */ a { b: c; }')).toBe('a{b:c}');
  });
  it('format/minify round-trip preserves declarations', () => {
    const src = '.a{color:red}.b{margin:0}';
    expect(minifyCss(formatCss(src))).toBe('.a{color:red}.b{margin:0}');
  });
});

describe('JavaScript', () => {
  it('minifies simple code', () => {
    expect(minifyJs('const x = 1; // c\nconst y = 2;')).toBe('const x=1;const y=2;');
  });
  it('preserves strings with comment-like content', () => {
    expect(minifyJs('const s = "a // b";')).toBe('const s="a // b";');
  });
  it('preserves block-comment-like strings', () => {
    expect(minifyJs('const s = "/* nope */";')).toBe('const s="/* nope */";');
  });
  it('formats with braces on their own lines and indentation', () => {
    const out = formatJs('function f(){return 1;}');
    expect(out).toContain('function f(){');
    expect(out).toContain('  return 1;');
    expect(out.trim().endsWith('}')).toBe(true);
  });
  it('minify of format equals minify of original', () => {
    const src = 'function add(a, b) { return a + b; }';
    expect(minifyJs(formatJs(src))).toBe(minifyJs(src));
  });
  it('does not split strings at braces', () => {
    const out = formatJs('const s = "a{b}c";');
    expect(out).toContain('const s="a{b}c";');
  });
});
