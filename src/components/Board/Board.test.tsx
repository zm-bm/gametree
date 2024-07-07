import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react'
import { Config } from 'chessground/config';
import { Chess, DEFAULT_POSITION } from 'chess.js';

import Board from './Board'
import { MockDispatch, renderWithProviders } from '../../test/testUtils';
import { setupStore } from '../../store';
import { SET_PROMOTION_TARGET, rootNode, initialState } from '../../redux/gameSlice';
import { MoveNode } from "../../types/chess";
import { MakeMove } from '../../thunks';

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

describe('Board', () => {
  it('renders board wrapper with correct size', () => {
    renderWithProviders(<Board />);
    
    expect(screen.getByTestId('board-wrapper').style.height).toEqual('400px');
    expect(screen.getByTestId('board-wrapper').style.width).toEqual('400px');
  });

  it('generates correct chessground config', () => {
    renderWithProviders(<Board />);

    expect(baseboardProps.config).toMatchObject({
      fen: DEFAULT_POSITION,
      orientation: 'white',
      turnColor: 'white',
      check: false,
      lastMove: [],
    });
  });

  it('dispatches moves', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    vi.mock('../../thunks', () => ({
      MakeMove: vi.fn()
    }))

    renderWithProviders(<Board />, { store: mockStore });
    
    baseboardProps?.config?.events?.move?.('a2', 'a4');
    const move = (new Chess()).move({ from: 'a2', to: 'a4' })
    expect(mockStore.dispatch).toHaveBeenCalledWith(MakeMove(move))

    vi.clearAllMocks();
  });

  it('dispatches promotions', () => {
    const mockStore = setupStore({
      game: {
        ...initialState,
        moveTree: [{
          ...rootNode,
          move: new Chess('rn1qkbnr/1Ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR b KQkq - 0 4').move('d8c8'),
        }] as MoveNode[]
        }
    });
    mockStore.dispatch = vi.fn() as MockDispatch;

    renderWithProviders(<Board />, { store: mockStore });
    
    baseboardProps?.config?.events?.move?.('b7', 'a8');
    expect(mockStore.dispatch).toHaveBeenCalledWith(SET_PROMOTION_TARGET(['b7', 'a8']))
  });
});
