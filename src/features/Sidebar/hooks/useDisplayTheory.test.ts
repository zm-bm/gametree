import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { TheoryLookupResult, TheorySnippet } from '@/types';

import { useDisplayTheory } from './useDisplayTheory';

const baseSnippet = (text: string): TheorySnippet => ({
  kind: 'paragraph',
  text,
  html: text,
});

const makeTheoryResult = (overrides: Partial<TheoryLookupResult> = {}): TheoryLookupResult => ({
  snippets: [baseSnippet('Theory text')],
  sourceTitle: 'Chess_Opening_Theory/1._e4',
  sourceUrl: 'https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4',
  strategy: 'exact-path',
  ...overrides,
});

const makeArgs = (
  overrides: Partial<{
    theoryData: TheoryLookupResult | undefined;
    theoryLoading: boolean;
    theoryIsError: boolean;
  }> = {},
) => ({
  theoryData: makeTheoryResult(),
  theoryLoading: false,
  theoryIsError: false,
  ...overrides,
});

describe('useDisplayTheory', () => {
  it('returns settled theory data when lookup succeeds', async () => {
    const args = makeArgs();
    const { result } = renderHook(
      (hookArgs: ReturnType<typeof makeArgs>) => useDisplayTheory(hookArgs),
      { initialProps: args },
    );

    await waitFor(() => {
      expect(result.current.hasSettledTheory).toBe(true);
      expect(result.current.displayTheoryError).toBe(false);
      expect(result.current.theorySnippets).toEqual(args.theoryData?.snippets ?? []);
      expect(result.current.displayTheoryData?.snippets).toEqual(args.theoryData?.snippets ?? []);
      expect(result.current.displayTheoryData?.sourceTitle).toBe('Chess_Opening_Theory/1._e4');
    });
  });

  it('settles to an empty non-error result when no data is returned', async () => {
    const { result } = renderHook(
      (hookArgs: ReturnType<typeof makeArgs>) => useDisplayTheory(hookArgs),
      { initialProps: makeArgs({ theoryData: undefined }) },
    );

    await waitFor(() => {
      expect(result.current.hasSettledTheory).toBe(true);
      expect(result.current.displayTheoryError).toBe(false);
      expect(result.current.theorySnippets).toEqual([]);
      expect(result.current.displayTheoryData).toEqual({
        snippets: [],
        sourceTitle: null,
        sourceUrl: null,
        strategy: 'none',
      });
    });
  });

  it('surfaces error state when query fails', async () => {
    const { result } = renderHook(
      (hookArgs: ReturnType<typeof makeArgs>) => useDisplayTheory(hookArgs),
      {
        initialProps: makeArgs({
          theoryData: undefined,
          theoryLoading: false,
          theoryIsError: true,
        }),
      },
    );

    await waitFor(() => {
      expect(result.current.displayTheoryError).toBe(true);
      expect(result.current.hasSettledTheory).toBe(true);
      expect(result.current.displayTheoryData).toBeNull();
      expect(result.current.theorySnippets).toEqual([]);
    });
  });

  it('keeps previous settled display while loading next query', async () => {
    const initialTheory = makeTheoryResult({
      snippets: [baseSnippet('Initial displayed theory')],
    });
    const { result, rerender } = renderHook(
      (args: ReturnType<typeof makeArgs>) => useDisplayTheory(args),
      {
        initialProps: makeArgs({ theoryData: initialTheory, theoryLoading: false }),
      },
    );

    await waitFor(() => {
      expect(result.current.theorySnippets).toEqual([baseSnippet('Initial displayed theory')]);
      expect(result.current.displayTheoryError).toBe(false);
    });

    rerender(makeArgs({ theoryData: undefined, theoryLoading: true, theoryIsError: false }));

    expect(result.current.hasSettledTheory).toBe(true);
    expect(result.current.displayTheoryError).toBe(false);
    expect(result.current.theorySnippets).toEqual([baseSnippet('Initial displayed theory')]);
  });
});
