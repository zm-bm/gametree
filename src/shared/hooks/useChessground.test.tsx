import { PropsWithChildren } from 'react';
import { act, renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { describe, expect, it, vi } from 'vitest';

import type { AppStore } from '@/store';
import { nav, ui } from '@/store/slices';
import { setupTestStore } from '@/test/renderWithProviders';
import { createTestMove, createTestTreeStoreNode } from '@/test/treeFixtures';

import { useBoardDisplay, useChessState, useChessgroundConfig } from './useChessground';

function makeWrapper(store: AppStore) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe('useChessground hooks', () => {
  it('uses hover move over current move in board display', () => {
    const store = setupTestStore({
      ui: {
        currentId: 'a',
        hoverId: 'b',
        boardFen: '4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1',
      },
      tree: {
        nodes: {
          a: createTestTreeStoreNode({
            id: 'a',
            move: createTestMove({
              from: 'e2',
              to: 'e4',
              after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1',
            }),
          }),
          b: createTestTreeStoreNode({
            id: 'b',
            move: createTestMove({
              from: 'd2',
              to: 'd4',
              after: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
            }),
          }),
        },
      },
    });

    const { result } = renderHook(
      () => useBoardDisplay('fallback-fen'),
      { wrapper: makeWrapper(store) }
    );

    expect(result.current.displayFen).toBe('rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1');
    expect(result.current.displayMove).toEqual(['d2', 'd4']);
  });

  it('builds chess state with correct turn and legal destinations', () => {
    const { result } = renderHook(() => useChessState('4k3/8/8/8/8/8/4Q3/4K3 b - - 0 1'));

    expect(result.current.turnColor).toBe('black');
    expect(result.current.dests.get('e8')).toContain('f7');
  });

  it('creates config with engine auto-shape and dispatches commit move for normal moves', () => {
    const store = setupTestStore({
      ui: {
        boardFen: 'rn1qkbnr/pppbpppp/8/3p4/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        boardOrientation: 'black',
        currentId: 'a',
        hoverId: null,
      },
      tree: {
        nodes: {
          a: createTestTreeStoreNode({
            id: 'a',
            move: createTestMove({ from: 'd2', to: 'd4' }),
          }),
        },
      },
      engine: {
        output: { depth: 10, seldepth: 12, pv: ['d2d4'] },
      },
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(
      () => useChessgroundConfig(),
      { wrapper: makeWrapper(store) }
    );

    expect(result.current.orientation).toBe('black');
    expect(result.current.lastMove).toEqual(['d2', 'd4']);
    expect(result.current.drawable?.autoShapes).toEqual([
      { orig: 'd2', dest: 'd4', brush: 'blue' },
    ]);

    act(() => {
      result.current.events?.move?.('d2', 'd4');
    });

    expect(dispatchSpy).toHaveBeenCalledWith(
      nav.actions.commitMove(
        expect.objectContaining({ from: 'd2', to: 'd4', lan: 'd2d4' })
      )
    );
  });

  it('dispatches promotion target when move requires promotion', () => {
    const store = setupTestStore({
      ui: {
        boardFen: '7k/P7/8/8/8/8/8/K7 w - - 0 1',
      },
    });

    const dispatchSpy = vi.spyOn(store, 'dispatch');

    const { result } = renderHook(
      () => useChessgroundConfig(),
      { wrapper: makeWrapper(store) }
    );

    act(() => {
      result.current.events?.move?.('a7', 'a8');
    });

    expect(dispatchSpy).toHaveBeenCalledWith(ui.actions.setPromotionTarget(['a7', 'a8']));
  });
});
