import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react'
import { Config } from 'chessground/config';
import { Chess } from 'chess.js';

import Board from './Board'
import { MockDispatch, renderWithProviders } from '../../test/testUtils';
import { setupStore } from '../../store';
import { MAKE_MOVE, SET_PROMOTION_TARGET, rootNode, initialState } from '../../redux/gameSlice';
import { MoveNode } from "../../types/chess";

vi.mock('../../hooks/useDimensions', () => ({
  useDimensions: vi.fn(() => [useRef(), { width: 404, height: 404 }])
}));

let baseboardProps: { config?: Config } = {};
vi.mock('./BaseBoard', () => ({
  default: vi.fn(props => {
    baseboardProps = props;
    return <div {...props} />;
  }
)}));

const promotionGameState = {
  ...initialState,
  moveTree: [{
    ...rootNode,
    move: {
      color: 'b',
      piece: 'q',
      from: 'd8',
      to: 'c8',
      san: 'Qc8',
      flags: 'n',
      lan: 'd8c8',
      before: 'rn1qkbnr/1Ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR b KQkq - 0 4',
      after: 'rnq1kbnr/1Ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq - 1 5'
    }
  }] as MoveNode[]
};

describe('Board', () => {
  it('renders board wrapper with correct size', () => {
    renderWithProviders(<Board />);
    
    expect(screen.getByTestId('board-wrapper').style.height).toEqual('400px');
    expect(screen.getByTestId('board-wrapper').style.width).toEqual('400px');
  });

  it('updates chessground config on move', () => {
    const { rerender } =  renderWithProviders(<Board />);
    baseboardProps?.config?.events?.move?.('a2', 'a4');
    rerender(<Board />);

    expect(baseboardProps.config).toMatchObject({
      fen: 'rnbqkbnr/pppppppp/8/8/P7/8/1PPPPPPP/RNBQKBNR b KQkq - 0 1',
      turnColor: 'black',
      lastMove: ['a2', 'a4'],
    });
  });

  it('dipatches moves', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    renderWithProviders(<Board />, { store: mockStore });
    
    baseboardProps?.config?.events?.move?.('a2', 'a4');
    const move = (new Chess()).move({ from: 'a2', to: 'a4' })
    expect(mockStore.dispatch).toHaveBeenCalledWith(MAKE_MOVE(move))
  });

  it('dispatches promotions', () => {
    const mockStore = setupStore({
      game: promotionGameState
    });
    mockStore.dispatch = vi.fn() as MockDispatch;
    renderWithProviders(<Board />, { store: mockStore });
    
    baseboardProps?.config?.events?.move?.('b7', 'a8');
    expect(mockStore.dispatch).toHaveBeenCalledWith(SET_PROMOTION_TARGET(['b7', 'a8']))
  });
});
