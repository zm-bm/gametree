import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TheoryLookupResult, TheorySnippet } from '@/types';

const { mockFilterTheorySnippets } = vi.hoisted(() => ({
  mockFilterTheorySnippets: vi.fn(),
}));

vi.mock('@/shared/theory', async () => {
  const actual = await vi.importActual<typeof import('@/shared/theory')>('@/shared/theory');
  return {
    ...actual,
    filterTheorySnippets: (
      ...args: Parameters<typeof actual.filterTheorySnippets>
    ) => mockFilterTheorySnippets(...args),
  };
});

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
    openingName: string;
    recentLine: string;
    sanMoves: string[];
  }> = {},
) => ({
  theoryData: makeTheoryResult(),
  theoryLoading: false,
  theoryIsError: false,
  openingName: "King's Pawn Game",
  recentLine: '1. e4',
  sanMoves: ['e4'],
  ...overrides,
});

describe('useDisplayTheory', () => {
  beforeEach(() => {
    mockFilterTheorySnippets.mockReset();
    mockFilterTheorySnippets.mockImplementation((snippets) => snippets);
  });

  it('returns settled filtered theory data when lookup succeeds', async () => {
    const filtered = [baseSnippet('Filtered theory text')];
    mockFilterTheorySnippets.mockReturnValue(filtered);

    const args = makeArgs();
    const { result } = renderHook(
      (hookArgs: ReturnType<typeof makeArgs>) => useDisplayTheory(hookArgs),
      { initialProps: args },
    );

    await waitFor(() => {
      expect(result.current.hasSettledTheory).toBe(true);
      expect(result.current.displayTheoryError).toBe(false);
      expect(result.current.theorySnippets).toEqual(filtered);
      expect(result.current.displayTheoryData?.snippets).toEqual(filtered);
      expect(result.current.displayTheoryData?.sourceTitle).toBe('Chess_Opening_Theory/1._e4');
    });

    expect(mockFilterTheorySnippets).toHaveBeenCalledWith(
      args.theoryData?.snippets ?? [],
      "King's Pawn Game",
      '1. e4',
      ['e4'],
    );
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

    expect(mockFilterTheorySnippets).not.toHaveBeenCalled();
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
