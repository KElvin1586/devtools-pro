import { describe, it, expect } from 'vitest';
import { convertCase, analyzeText, removeDuplicateLines, sortLines } from '../src/lib/text';

describe('convertCase', () => {
  const input = 'hello world';
  it('lower', () => expect(convertCase('HeLLo', 'lower')).toBe('hello'));
  it('upper', () => expect(convertCase('Hello', 'upper')).toBe('HELLO'));
  it('title', () => expect(convertCase(input, 'title')).toBe('Hello World'));
  it('sentence', () => expect(convertCase('hello world. bye now', 'sentence')).toBe('Hello world. Bye now'));
  it('camel', () => expect(convertCase(input, 'camel')).toBe('helloWorld'));
  it('pascal', () => expect(convertCase(input, 'pascal')).toBe('HelloWorld'));
  it('snake', () => expect(convertCase(input, 'snake')).toBe('hello_world'));
  it('kebab', () => expect(convertCase(input, 'kebab')).toBe('hello-world'));
  it('constant', () => expect(convertCase(input, 'constant')).toBe('HELLO_WORLD'));
});

describe('analyzeText', () => {
  it('counts words, characters, lines', () => {
    const stats = analyzeText('one two\nthree');
    expect(stats.words).toBe(3);
    expect(stats.characters).toBe(13);
    expect(stats.charactersNoSpaces).toBe(11);
    expect(stats.lines).toBe(2);
  });
  it('handles empty input', () => {
    const stats = analyzeText('');
    expect(stats.words).toBe(0);
    expect(stats.lines).toBe(0);
    expect(stats.characters).toBe(0);
  });
  it('counts sentences and paragraphs', () => {
    const stats = analyzeText('Hello world. How are you?\n\nNew paragraph.');
    expect(stats.sentences).toBe(3);
    expect(stats.paragraphs).toBe(2);
  });
});

describe('removeDuplicateLines', () => {
  it('removes duplicates preserving order', () => {
    expect(removeDuplicateLines('a\nb\na\nc\nb')).toBe('a\nb\nc');
  });
  it('keeps unique input unchanged', () => {
    expect(removeDuplicateLines('x\ny\nz')).toBe('x\ny\nz');
  });
});

describe('sortLines', () => {
  const input = 'banana\napple\ncherry';
  it('ascending', () => expect(sortLines(input, 'asc')).toBe('apple\nbanana\ncherry'));
  it('descending', () => expect(sortLines(input, 'desc')).toBe('cherry\nbanana\napple'));
  it('by length', () => {
    expect(sortLines('ccc\na\nbb', 'lengthAsc')).toBe('a\nbb\nccc');
    expect(sortLines('ccc\na\nbb', 'lengthDesc')).toBe('ccc\nbb\na');
  });
  it('natural sort treats numbers numerically', () => {
    expect(sortLines('item10\nitem2\nitem1', 'natural')).toBe('item1\nitem2\nitem10');
  });
  it('default is ascending', () => {
    expect(sortLines(input)).toBe(sortLines(input, 'asc'));
  });
});
