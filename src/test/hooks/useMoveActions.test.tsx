import { renderHook, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { describe, it, expect, vi } from "vitest";
import { GameState, initialState } from "../../redux/gameSlice";
import { useMoveActions } from "../../hooks/useMoveActions";
import { AppStore, setupStore } from "../../store";
import { MockDispatch } from "../testUtils";

const gameState: GameState = {
  ...initialState,
  moveIndex: 1,
  moveTree: [
    {
      key: 0,
      move: null,
      parent: null,
      children: [
        1
      ]
    },
    {
      key: 1,
      move: {
        color: 'w',
        piece: 'p',
        from: 'd2',
        to: 'd4',
        san: 'd4',
        lan: 'd2d4',
        before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        after: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1'
      },
      parent: 0,
      children: [
        2
      ]
    },
    {
      key: 2,
      move: {
        color: 'b',
        piece: 'p',
        from: 'd7',
        to: 'd5',
        san: 'd5',
        lan: 'd7d5',
        before: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
        after: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'
      },
      parent: 1,
      children: []
    },
  ]
};

describe("useMoveActions", () => {
  const renderUseMoveActions = (store: AppStore) => {
    return renderHook(() => useMoveActions(), {
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    });
  };

  it("performs undo action", () => {
    const store = setupStore({ game: gameState });
    const { result } = renderUseMoveActions(store);

    act(() => {
      result.current.undo();
    });

    expect(store.getState().game.moveIndex).toBe(0);
  });

  it("performs redo action", () => {
    const store = setupStore({ game: gameState });
    const { result } = renderUseMoveActions(store);

    act(() => {
      result.current.redo();
    });

    expect(store.getState().game.moveIndex).toBe(2);
  });

  it("performs rewind action", () => {
    const store = setupStore({ game: { ...gameState, moveIndex: 2 } });
    const { result } = renderUseMoveActions(store);

    act(() => {
      result.current.rewind();
    });

    expect(store.getState().game.moveIndex).toBe(0);
  });

  it("performs forward action", () => {
    const store = setupStore({ game: { ...gameState, moveIndex: 0 } });
    const { result } = renderUseMoveActions(store);

    act(() => {
      result.current.forward();
    });

    expect(store.getState().game.moveIndex).toBe(2);
  });

  it("throttles actions", () => {
    const store = setupStore({ game: gameState });
    store.dispatch = vi.fn() as MockDispatch;
    const { result } = renderUseMoveActions(store);

    act(() => {
      result.current.undo();
      result.current.undo();
    });

    expect(store.dispatch).toHaveBeenCalledOnce();
  });
});
