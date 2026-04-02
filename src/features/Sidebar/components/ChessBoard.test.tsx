import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Config } from 'chessground/config';

import { renderWithProviders } from '@/test/renderWithProviders';
import ChessBoard from './ChessBoard';

const mockedConfig: Config = {
  fen: '8/8/8/8/8/8/8/8 w - - 0 1',
  orientation: 'white',
  turnColor: 'white',
  drawable: { autoShapes: [] },
};

const useChessgroundConfigMock = vi.fn(() => mockedConfig);
vi.mock('@/shared/hooks', () => ({
  useChessgroundConfig: () => useChessgroundConfigMock(),
}));

let boardProps: { config?: Config; className?: string; promotionOverlay?: boolean } = {};
vi.mock('@/shared/ui/Board', () => ({
  default: vi.fn((props) => {
    boardProps = props;
    return <div data-testid="board-mock" />;
  }),
}));

describe('ChessBoard', () => {
  beforeEach(() => {
    boardProps = {};
    useChessgroundConfigMock.mockClear();
  });

  it('passes chessground config into Board', () => {
    renderWithProviders(<ChessBoard />);

    expect(useChessgroundConfigMock).toHaveBeenCalledTimes(1);
    expect(boardProps.config).toBe(mockedConfig);
  });

  it('passes Board presentation props', () => {
    renderWithProviders(<ChessBoard className="sidebar-card" />);

    expect(boardProps.className).toBe('sidebar-card');
    expect(boardProps.promotionOverlay).toBe(true);
  });
});