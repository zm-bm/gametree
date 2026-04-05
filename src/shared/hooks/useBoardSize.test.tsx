import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useBoardSize } from './useBoardSize';

class MockResizeObserver {
  static instances: MockResizeObserver[] = [];

  callback: ResizeObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    MockResizeObserver.instances.push(this);
  }

  trigger() {
    this.callback([], this as unknown as ResizeObserver);
  }
}

const originalDevicePixelRatio = window.devicePixelRatio;
let offsetWidthSpy: ReturnType<typeof vi.spyOn>;

function TestBoardSize() {
  const [ref, boardSize] = useBoardSize();

  return (
    <div>
      <div data-testid="board" ref={ref} />
      <span data-testid="size">{boardSize}</span>
    </div>
  );
}

describe('useBoardSize', () => {
  beforeEach(() => {
    MockResizeObserver.instances = [];
    vi.stubGlobal('ResizeObserver', MockResizeObserver);

    offsetWidthSpy = vi
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockImplementation(function offsetWidth(this: HTMLElement) {
        return Number(this.getAttribute('data-width') || 0);
      });
  });

  afterEach(() => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: originalDevicePixelRatio,
      configurable: true,
    });
    offsetWidthSpy.mockRestore();
  });

  it('computes initial board size from the mounted element width', () => {
    Object.defineProperty(window, 'devicePixelRatio', {
      value: 1,
      configurable: true,
    });

    render(<TestBoardSize />);

    const board = screen.getByTestId('board');
    board.setAttribute('data-width', '101');

    // Re-run observer callback after setting width to simulate layout update.
    act(() => {
      MockResizeObserver.instances[0].trigger();
    });

    expect(screen.getByTestId('size').textContent).toBe('96.1');
  });

  it('updates board size when resize observer fires', () => {
    render(<TestBoardSize />);

    const board = screen.getByTestId('board');
    board.setAttribute('data-width', '80');

    act(() => {
      MockResizeObserver.instances[0].trigger();
    });
    expect(screen.getByTestId('size').textContent).toBe('80.1');

    board.setAttribute('data-width', '95');

    act(() => {
      MockResizeObserver.instances[0].trigger();
    });
    expect(screen.getByTestId('size').textContent).toBe('88.1');
  });

  it('unobserves the element on unmount', () => {
    const { unmount } = render(<TestBoardSize />);

    const observer = MockResizeObserver.instances[0];
    const board = screen.getByTestId('board');

    unmount();

    expect(observer.unobserve).toHaveBeenCalledWith(board);
  });
});
