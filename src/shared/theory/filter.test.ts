import { describe, expect, it } from 'vitest';

import type { TheorySnippet } from '@/types';
import { filterTheorySnippets } from './filter';

const heading = (text: string): TheorySnippet => ({
  kind: 'heading',
  text,
  html: text,
});

const paragraph = (text: string): TheorySnippet => ({
  kind: 'paragraph',
  text,
  html: text,
});

describe('filterTheorySnippets', () => {
  it('drops the first heading while keeping paragraph snippets', () => {
    const snippets: TheorySnippet[] = [
      heading('English Opening'),
      paragraph('White often keeps flexible central options.'),
    ];

    const filtered = filterTheorySnippets(
      snippets,
      'English Opening',
      '1. c4',
      ['c4'],
    );

    expect(filtered).toEqual([paragraph('White often keeps flexible central options.')]);
  });

  it('filters blocklisted theory table headings', () => {
    const snippets: TheorySnippet[] = [
      heading('First heading to drop'),
      heading('THEORY TABLE'),
      heading('Theory table: continuations'),
      paragraph('Useful prose remains visible.'),
    ];

    const filtered = filterTheorySnippets(
      snippets,
      'Sicilian Defense',
      '1. e4 c5',
      ['e4', 'c5'],
    );

    expect(filtered.some((snippet) => snippet.kind === 'heading' && /theory table/i.test(snippet.text))).toBe(false);
    expect(filtered.some((snippet) => snippet.kind === 'paragraph')).toBe(true);
  });

  it('filters headings that duplicate opening context', () => {
    const snippets: TheorySnippet[] = [
      heading('First heading to drop'),
      heading("King's Pawn opening"),
      heading('Strategic plans'),
    ];

    const filtered = filterTheorySnippets(
      snippets,
      "King's Pawn Game",
      '1. e4',
      ['e4'],
    );

    expect(filtered.some((snippet) => snippet.kind === 'heading' && snippet.text === "King's Pawn opening")).toBe(false);
    expect(filtered.some((snippet) => snippet.kind === 'heading' && snippet.text === 'Strategic plans')).toBe(true);
  });

  it('filters move-prefix headings represented by the current line', () => {
    const snippets: TheorySnippet[] = [
      heading('First heading to drop'),
      heading('1. e4 c5'),
      heading('Typical plans after 2. Nf3'),
    ];

    const filtered = filterTheorySnippets(
      snippets,
      'Sicilian Defense',
      '1. e4 c5 2. Nf3',
      ['e4', 'c5', 'Nf3'],
    );

    expect(filtered.some((snippet) => snippet.kind === 'heading' && snippet.text === '1. e4 c5')).toBe(false);
    expect(filtered.some((snippet) => snippet.kind === 'heading' && snippet.text === 'Typical plans after 2. Nf3')).toBe(true);
  });

  it('keeps non-duplicate headings and paragraphs in order', () => {
    const snippets: TheorySnippet[] = [
      heading('First heading to drop'),
      heading('Queenside expansion ideas'),
      paragraph('Black can challenge the center with timely ...d5 breaks.'),
    ];

    const filtered = filterTheorySnippets(
      snippets,
      'English Opening',
      '1. c4 Nf6 2. Nc3',
      ['c4', 'Nf6', 'Nc3'],
    );

    expect(filtered).toEqual([
      heading('Queenside expansion ideas'),
      paragraph('Black can challenge the center with timely ...d5 breaks.'),
    ]);
  });
});

