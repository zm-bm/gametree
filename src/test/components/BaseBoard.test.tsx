import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Chessground } from 'chessground';

import BaseBoard from '../../components/BaseBoard'
import { renderWithProviders } from '../testUtils';

const setMock = vi.fn()
vi.mock('chessground', () => ({
  Chessground: vi.fn().mockImplementation(() => ({
    set: setMock,
  }))
}));

describe('BaseBoard', () => {
  beforeEach(() => {
    setMock.mockClear();
  });

  it('calls chessground', () => {
    renderWithProviders(<BaseBoard config={{}} />)
    expect(Chessground).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledTimes(1);
  })

  it('calls set on config changes', () => {
    const { rerender } = renderWithProviders(<BaseBoard config={{}} />)
    const config = { fen: '' };
    rerender(<BaseBoard config={config} />);
    expect(setMock).toHaveBeenCalledTimes(2);
    expect(setMock).toBeCalledWith(config)
  })
})
