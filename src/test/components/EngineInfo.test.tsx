import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "../testUtils";
import { EngineState, initialState } from "../../store/engineSlice";
import EngineOutputDisplay from "../../features/ChessPanel/components/EngineOutputDisplay";
import { fireEvent } from "@testing-library/react";
import { EngineBoardProps } from "../../features/ChessPanel/components/EngineBoard";

const engineState = {
  ...initialState,
  infos: [{
    depth: 1,
    seldepth: 1,
    cp: 63,
    multipv: 0,
    pv: [
      {
        color: 'w',
        piece: 'p',
        from: 'e2',
        to: 'e4',
        san: 'e4',
        lan: 'e2e4',
        before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
      }
    ]
  }]
};

let boardProps: EngineBoardProps;
vi.mock('../../components/EngineBoard', () => ({
  default: vi.fn(props => {
    boardProps = props;
    return <div />;
  }
)}));

describe('EngineInfo', () => {
  it('renders depth, score, move', () => {
    const { getByText } = renderWithProviders(<EngineOutputDisplay />, {
      preloadedState: { engine: engineState as EngineState }
    });
    getByText('1/1')
    getByText('+0.63')
    getByText('1.e4')
  });

  it('renders correctly on move hover', () => {
    const { getByText, rerender } = renderWithProviders(<EngineOutputDisplay />, {
      preloadedState: { engine: engineState as EngineState }
    });
    const moveElem = getByText('1.e4');
    fireEvent.mouseEnter(moveElem);
    rerender(<EngineOutputDisplay />);
    expect(boardProps.config.fen).toEqual(engineState.infos[0].pv[0].after);
    expect(boardProps.config.lastMove).toEqual(['e2', 'e4']);
    expect(boardProps.isHovered).toEqual(true);
  });

  it('renders correctly on move leave', () => {
    const { getByText, rerender } = renderWithProviders(<EngineOutputDisplay />, {
      preloadedState: { engine: engineState as EngineState }
    });
    const moveElem = getByText('1.e4');
    fireEvent.mouseEnter(moveElem);
    fireEvent.mouseLeave(moveElem);
    rerender(<EngineOutputDisplay />);
    expect(boardProps.isHovered).toEqual(false);
  });
});
