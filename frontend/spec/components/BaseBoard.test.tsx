import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import BaseBoard from '../../src/components/BaseBoard'
import { Chessground } from 'chessground';

const setMock = vi.fn()
vi.mock('chessground', () => ({
  Chessground: vi.fn().mockImplementation((element, config) => ({
    set: setMock,
  }))
}));

describe('BaseBoard', () => {
  beforeEach(() => {
    setMock.mockClear();  // Clear mock history before each test
  });

  it('calls chessground', () => {
    render(<BaseBoard config={{}} />)
    expect(Chessground).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledTimes(1);
  })

  it('calls set on config changes', () => {
    const { rerender } = render(<BaseBoard config={{}} />)
    const config = { fen: '' };
    rerender(<BaseBoard config={config} />);
    expect(setMock).toHaveBeenCalledTimes(2);
    expect(setMock).toBeCalledWith(config)
  })
})
