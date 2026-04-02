import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Chessground } from 'chessground';

import { renderWithProviders } from '@/test/renderWithProviders';
import Board from './Board';

const setMock = vi.fn();
vi.mock('chessground', () => ({
  Chessground: vi.fn().mockImplementation(() => ({
    set: setMock,
  })),
}));

describe('Board', () => {
  beforeEach(() => {
    setMock.mockClear();
  });

  it('calls chessground', () => {
    renderWithProviders(<Board config={{}} />);
    expect(Chessground).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledTimes(1);
  });

  it('calls set on config changes', () => {
    const { rerender } = renderWithProviders(<Board config={{}} />);
    const config = { fen: '' };
    rerender(<Board config={config} />);
    expect(setMock).toHaveBeenCalledTimes(2);
    expect(setMock).toBeCalledWith(config);
  });
});