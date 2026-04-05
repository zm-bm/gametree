import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { MutableRefObject, RefObject } from 'react';

import { useParentSize } from '@visx/responsive';

vi.mock('@visx/responsive', () => ({
  useParentSize: vi.fn(),
}));

import { useStableParentSize } from './useStableParentSize';

type MockParentSizeState = {
  parentRef: MutableRefObject<HTMLElement | null>;
  width: number;
  height: number;
  top: number;
  left: number;
  resize: ReturnType<typeof vi.fn>;
};

describe('useStableParentSize', () => {
  const mockUseParentSize = vi.mocked(useParentSize);
  let state: MockParentSizeState;
  let hidden = false;

  beforeEach(() => {
    state = {
      parentRef: { current: null },
      width: 0,
      height: 0,
      top: 0,
      left: 0,
      resize: vi.fn(),
    };

    mockUseParentSize.mockImplementation(() => ({
      parentRef: state.parentRef as RefObject<HTMLElement>,
      width: state.width,
      height: state.height,
      top: state.top,
      left: state.left,
      resize: state.resize,
    }));

    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 1;
    });

    hidden = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hidden,
    });
  });

  it('returns current width and height when observer reports positive values', () => {
    state.width = 640;
    state.height = 360;

    const { result } = renderHook(() => useStableParentSize());

    expect(result.current.width).toBe(640);
    expect(result.current.height).toBe(360);
  });

  it('keeps last good size when observer temporarily reports zero', () => {
    state.width = 800;
    state.height = 500;

    const { result, rerender } = renderHook(() => useStableParentSize());

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(500);

    state.width = 0;
    state.height = 0;
    rerender();

    expect(result.current.width).toBe(800);
    expect(result.current.height).toBe(500);
  });

  it('remeasures on mount and window/document restore events', () => {
    state.parentRef.current = {
      getBoundingClientRect: () => ({
        width: 1024,
        height: 768,
        top: 10,
        left: 20,
      }),
    } as HTMLElement;

    renderHook(() => useStableParentSize());

    expect(state.resize).toHaveBeenCalledWith({
      width: 1024,
      height: 768,
      top: 10,
      left: 20,
    });

    state.resize.mockClear();

    act(() => {
      window.dispatchEvent(new Event('focus'));
    });
    expect(state.resize).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new Event('pageshow'));
    });
    expect(state.resize).toHaveBeenCalledTimes(2);

    act(() => {
      hidden = false;
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(state.resize).toHaveBeenCalledTimes(3);
  });

  it('skips visibility-triggered remeasure while document is hidden', () => {
    state.parentRef.current = {
      getBoundingClientRect: () => ({
        width: 900,
        height: 600,
        top: 0,
        left: 0,
      }),
    } as HTMLElement;

    renderHook(() => useStableParentSize());
    state.resize.mockClear();

    act(() => {
      hidden = true;
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(state.resize).not.toHaveBeenCalled();
  });
});
