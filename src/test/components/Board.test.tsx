import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react'
import { Config } from 'chessground/config';
import { Chess, DEFAULT_POSITION } from 'chess.js';

import ChessBoard from '../../features/ChessPanel/components/ChessBoard';
import { MockDispatch, renderWithProviders } from '../../test/testUtils';
import { setupStore } from '../../store';
import { setPromotionTarget, rootNode, initialState as gameInitialState } from '../../store/slices/ui';
import { initialState as engineInitialState } from '../../store/engineSlice';
import { MoveNode } from "../../shared/types";
import { MakeMove } from '../../store/thunks';

vi.mock('../../hooks/useDimensions', () => ({
  useDimensions: vi.fn(() => [useRef(), { width: 404, height: 404 }])
}));

let baseboardProps: { config?: Config } = {};
vi.mock('../../components/BaseBoard', () => ({
  default: vi.fn(props => {
    baseboardProps = props;
    return <div {...props} />;
  }
)}));

const a2a4 = (new Chess()).move({ from: 'a2', to: 'a4' })

describe('Board', () => {
  it('renders board wrapper with correct size', () => {
    renderWithProviders(<ChessBoard />);
    
    expect(screen.getByTestId('board-wrapper').style.height).toEqual('400px');
    expect(screen.getByTestId('board-wrapper').style.width).toEqual('400px');
  });

  it('generates correct chessground config', () => {
    renderWithProviders(<ChessBoard />, { preloadedState: {
      engine: {
        ...engineInitialState,
        infos: [
          {
            depth: 1,
            seldepth: 1,
            multipv: 1,
            pv: [a2a4],
          },
        ],
      }
    }});

    expect(baseboardProps.config).toMatchObject({
      fen: DEFAULT_POSITION,
      orientation: 'white',
      turnColor: 'white',
      check: false,
      lastMove: [],
      drawable: { autoShapes: [{ orig: 'a2', dest: 'a4', brush: 'paleGreen' }] }
    });
  });

  it('dispatches moves', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    vi.mock('../../thunks', () => ({
      MakeMove: vi.fn()
    }))

    renderWithProviders(<ChessBoard />, { store: mockStore });
    
    baseboardProps?.config?.events?.move?.('a2', 'a4');
    expect(mockStore.dispatch).toHaveBeenCalledWith(MakeMove(a2a4))

    vi.clearAllMocks();
  });

  it('dispatches promotions', () => {
    const mockStore = setupStore({
      game: {
        ...gameInitialState,
        moveTree: [{
          ...rootNode,
          move: new Chess('rn1qkbnr/1Ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR b KQkq - 0 4').move('d8c8'),
        }] as MoveNode[]
        }
    });
    mockStore.dispatch = vi.fn() as MockDispatch;

    renderWithProviders(<ChessBoard />, { store: mockStore });
    
    baseboardProps?.config?.events?.move?.('b7', 'a8');
    expect(mockStore.dispatch).toHaveBeenCalledWith(setPromotionTarget(['b7', 'a8']))
  });
});
