import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { TransformMatrix } from '@visx/zoom/lib/types';

let mockCurrentId = '';
let mockCurrentNode: unknown = null;

const springApi = {
  stop: vi.fn(),
  set: vi.fn(),
  start: vi.fn(),
};

vi.mock('@react-spring/web', () => ({
  useSpring: vi.fn(() => [{}, springApi]),
}));

vi.mock('@/store/selectors', () => ({
  selectCurrentId: vi.fn(() => mockCurrentId),
  selectCurrentNode: vi.fn(() => mockCurrentNode),
}));

vi.mock('react-redux', () => ({
  useSelector: vi.fn((selector: (state: unknown) => unknown) => selector({})),
}));

import { getPanToNodeTransform, useTreeNavigation } from './useTreeNavigation';

const makeMatrix = (): TransformMatrix => ({
  translateX: 10,
  translateY: 20,
  scaleX: 2,
  scaleY: 2,
  skewX: 0,
  skewY: 0,
});

describe('useTreeNavigation integration scenarios', () => {
  beforeEach(() => {
    mockCurrentId = '';
    mockCurrentNode = null;
    springApi.stop.mockClear();
    springApi.set.mockClear();
    springApi.start.mockClear();
  });

  it('re-enables follow on id change after manual exploration disabled it', () => {
    const transformRef = { current: makeMatrix() };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    mockCurrentId = 'a';
    mockCurrentNode = {
      data: { id: 'a' },
      x: 40,
      y: 100,
    };

    const { result, rerender } = renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    expect(springApi.start).toHaveBeenCalledTimes(1);
    springApi.start.mockClear();

    act(() => {
      result.current.updateSpring();
    });

    mockCurrentNode = {
      data: { id: 'a' },
      x: 45,
      y: 100,
    };
    rerender();

    expect(springApi.start).toHaveBeenCalledTimes(0);

    mockCurrentId = 'b';
    mockCurrentNode = {
      data: { id: 'b' },
      x: 45,
      y: 130,
    };
    rerender();

    const expected = getPanToNodeTransform(
      transformRef.current,
      { width: 300, height: 200 },
      { x: 45, y: 130 },
    );

    expect(springApi.start).toHaveBeenCalledTimes(1);
    expect(springApi.start).toHaveBeenCalledWith(
      expect.objectContaining({
        from: transformRef.current,
        to: expected,
      }),
    );
  });

  it('pans using latest transformRef scale after external zoom changes', () => {
    const transformRef = {
      current: {
        ...makeMatrix(),
        scaleX: 3,
        scaleY: 3,
      },
    };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    mockCurrentId = 'a';
    mockCurrentNode = {
      data: { id: 'a' },
      x: 50,
      y: 100,
    };

    renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    const expected = getPanToNodeTransform(
      transformRef.current,
      { width: 300, height: 200 },
      { x: 50, y: 100 },
    );

    expect(springApi.start).toHaveBeenCalledWith(
      expect.objectContaining({
        from: transformRef.current,
        to: expected,
      }),
    );
  });
});
