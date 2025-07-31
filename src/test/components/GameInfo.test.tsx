import { describe, expect, it, vi } from "vitest";
import { GameState, initialState } from "../../redux/gameSlice";
import { MockDispatch, renderWithProviders } from "../testUtils";
import GameInfo from "../../components/GameInfo";
import { fireEvent } from "@testing-library/react";
import { setupStore } from "../../store";
import { GotoMove } from "../../thunks";

const gameState: GameState = {
  ...initialState,
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
      children: [
        3,
        4
      ]
    },
    {
      key: 3,
      move: {
        color: 'w',
        piece: 'p',
        from: 'c2',
        to: 'c4',
        san: 'c4',
        lan: 'c2c4',
        before: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
        after: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2'
      },
      parent: 2,
      children: []
    },
    {
      key: 4,
      move: {
        color: 'w',
        piece: 'b',
        from: 'c1',
        to: 'f4',
        san: 'Bf4',
        lan: 'c1f4',
        before: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
        after: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2'
      },
      parent: 2,
      children: []
    }
  ]
};

describe('GameInfo', () => {
  it('renders moves from move tree', () => {
    const { getByText } = renderWithProviders(<GameInfo />, { preloadedState: { game: gameState }});
    getByText('1.d4')
    getByText('d5')
    getByText('2.c4')
    getByText('2.Bf4')
  });

  it('goes to move on click', () => {
    const mockStore = setupStore({ game: gameState });
    mockStore.dispatch = vi.fn() as MockDispatch;
    vi.mock('../../thunks', () => ({
      GotoMove: vi.fn()
    }))

    const { getByText } = renderWithProviders(<GameInfo />, { store: mockStore });

    const move = getByText('2.c4')
    fireEvent.click(move);
    expect(mockStore.dispatch).toHaveBeenCalledWith(GotoMove(3));
  });
});
