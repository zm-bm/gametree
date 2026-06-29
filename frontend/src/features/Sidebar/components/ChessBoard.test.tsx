import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Config } from 'chessground/config';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import ChessBoard from './ChessBoard';
import { BoardProps } from '@/shared/ui/Board/Board';

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

const boardMock = vi.fn((props: BoardProps) => (
  <div data-testid="board-mock" data-classname={props.className} />
));

vi.mock('@/shared/ui/Board', () => ({
  default: (props: BoardProps) => boardMock(props),
}));

describe('ChessBoard', () => {
  beforeEach(() => {
    useChessgroundConfigMock.mockReset();
    useChessgroundConfigMock.mockReturnValue(mockedConfig);
    boardMock.mockClear();
  });

  it('renders the board without owning orientation chrome', () => {
    renderWithProviders(<ChessBoard />);

    expect(useChessgroundConfigMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('board-mock')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Flip board' })).not.toBeInTheDocument();
  });

  it('passes board config and presentation props', () => {
    renderWithProviders(<ChessBoard />);

    expect(useChessgroundConfigMock).toHaveBeenCalledTimes(1);
    expect(boardMock).toHaveBeenCalledWith(
      expect.objectContaining({
        config: mockedConfig,
        promotionOverlay: true,
      })
    );
  });

  it('passes updated config to Board on rerender', () => {
    const nextConfig: Config = {
      ...mockedConfig,
      orientation: 'black',
      turnColor: 'black',
    };

    useChessgroundConfigMock.mockReturnValueOnce(mockedConfig).mockReturnValueOnce(nextConfig);

    const { rerender } = renderWithProviders(<ChessBoard />);
    rerender(<ChessBoard />);

    expect(useChessgroundConfigMock).toHaveBeenCalledTimes(2);
    expect(boardMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        config: nextConfig,
        promotionOverlay: true,
      })
    );
  });
});
