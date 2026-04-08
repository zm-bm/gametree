import { describe, expect, it } from 'vitest';

import { extractTheorySnippets } from './extract';

describe('extractTheorySnippets', () => {
  it('returns null for empty html or missing parser root', () => {
    expect(extractTheorySnippets('', 1)).toBeNull();
    expect(extractTheorySnippets('<div><p>no parser output root</p></div>', 1)).toBeNull();
  });

  it('extracts readable paragraphs and ignores short/unreadable content', () => {
    const html = `
      <div class="mw-parser-output">
        <p>Too short.</p>
        <p>
          White often fights for central squares with flexible pawn and piece development,
          aiming for long-term pressure while keeping multiple plans available.
        </p>
      </div>
    `;

    const snippets = extractTheorySnippets(html, 1);
    expect(snippets).not.toBeNull();
    expect(snippets).toHaveLength(1);
    expect(snippets?.[0].kind).toBe('paragraph');
    expect(snippets?.[0].text).toContain('White often fights for central squares');
  });

  it('ignores h1 headings and keeps h2+ headings with sanitized inline emphasis', () => {
    const html = `
      <div class="mw-parser-output">
        <div class="mw-heading mw-heading1">
          <h1 id="Closed_Sicilian">Closed Sicilian</h1>
          <span class="mw-editsection">
            [<a href="/edit">edit</a>]
          </span>
        </div>
        <div class="mw-heading mw-heading2">
          <h2 id="Closed_Sicilian_Plans">Closed Sicilian Plans</h2>
          <span class="mw-editsection">
            [<a href="/edit">edit</a>]
          </span>
        </div>
        <p>
          White can choose <strong><a href="/wiki/line">c4</a></strong> and Black may answer
          with <em>...d5</em> setups in many structures.
        </p>
      </div>
    `;

    const snippets = extractTheorySnippets(html, 1);
    expect(snippets).not.toBeNull();

    expect(snippets?.some((snippet) => snippet.kind === 'heading' && snippet.text === 'Closed Sicilian')).toBe(false);
    expect(snippets?.some((snippet) => snippet.kind === 'heading' && snippet.text === 'Closed Sicilian Plans')).toBe(true);
    const paragraph = snippets?.find((snippet) => snippet.kind === 'paragraph');
    expect(paragraph).toBeDefined();
    expect(paragraph?.html).toContain('<strong>c4</strong>');
    expect(paragraph?.html).toContain('<em>...d5</em>');
    expect(paragraph?.html).not.toContain('<a');
    expect(paragraph?.html.toLowerCase()).not.toContain('edit');
  });

  it('respects section limit and stops at stop-headings', () => {
    const html = `
      <div class="mw-parser-output">
        <p>
          First section paragraph with enough detail to pass readability checks and remain
          useful as opening guidance for typical plans.
        </p>
        <h2>Plans</h2>
        <p>
          Second section paragraph with concrete middlegame ideas and enough words to meet
          extraction thresholds for display.
        </p>
        <h2>References</h2>
        <p>
          This paragraph should not be included because extraction must stop at references.
        </p>
      </div>
    `;

    const leadOnly = extractTheorySnippets(html, 0);
    expect(leadOnly?.some((snippet) => snippet.kind === 'paragraph' && snippet.text.includes('First section paragraph'))).toBe(true);
    expect(leadOnly?.some((snippet) => snippet.kind === 'paragraph' && snippet.text.includes('Second section paragraph'))).toBe(false);

    const withOneExtraSection = extractTheorySnippets(html, 1);
    expect(withOneExtraSection?.some((snippet) => snippet.kind === 'heading' && snippet.text === 'Plans')).toBe(true);
    expect(withOneExtraSection?.some((snippet) => snippet.kind === 'paragraph' && snippet.text.includes('Second section paragraph'))).toBe(true);
    expect(withOneExtraSection?.some((snippet) => snippet.text.includes('should not be included'))).toBe(false);
  });

  it('returns null when no readable paragraphs are found', () => {
    const html = `
      <div class="mw-parser-output">
        <h2>Table</h2>
        <table><tr><td>data</td></tr></table>
      </div>
    `;

    expect(extractTheorySnippets(html, 2)).toBeNull();
  });
});
