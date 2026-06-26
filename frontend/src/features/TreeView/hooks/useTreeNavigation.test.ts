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

import { anchorTreePoint, zoomAtPoint } from '@/features/TreeView/lib/svgMath';
import {
  PAN_TARGET_X_RATIO,
  PAN_TARGET_Y_RATIO,
  ZOOM_BUTTON_SCALE_STEP,
  useTreeNavigation,
} from './useTreeNavigation';

const makeMatrix = (): TransformMatrix => ({
  translateX: 10,
  translateY: 20,
  scaleX: 2,
  scaleY: 2,
  skewX: 0,
  skewY: 0,
});

describe('useTreeNavigation', () => {
  beforeEach(() => {
    mockCurrentId = '';
    mockCurrentNode = null;
    springApi.stop.mockClear();
    springApi.set.mockClear();
    springApi.start.mockClear();
  });

  it('syncs spring to current transform on updateSpring', () => {
    const transformRef = { current: makeMatrix() };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    const { result } = renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    act(() => {
      result.current.updateSpring();
    });

    expect(springApi.stop).toHaveBeenCalledTimes(1);
    expect(springApi.set).toHaveBeenCalledWith(transformRef.current);
  });

  it('starts zoom animation from the live transformRef value', () => {
    const transformRef = { current: makeMatrix() };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    const { result } = renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    act(() => {
      result.current.handleZoom('in');
    });

    const expected = zoomAtPoint(
      transformRef.current,
      { x: 150, y: 100 },
      ZOOM_BUTTON_SCALE_STEP,
    );

    expect(springApi.stop).toHaveBeenCalledTimes(1);
    expect(springApi.start).toHaveBeenCalledWith(
      expect.objectContaining({
        from: transformRef.current,
        to: expected,
      }),
    );
  });

  it('pans to current node on id change using current scale', () => {
    const transformRef = { current: makeMatrix() };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    mockCurrentId = 'a';
    mockCurrentNode = {
      data: { id: 'a' },
      x: 50,
      y: 120,
    };

    renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    const expected = anchorTreePoint(
      transformRef.current,
      { width: 300, height: 200 },
      { x: 120, y: 50 },
      { xRatio: PAN_TARGET_X_RATIO, yRatio: PAN_TARGET_Y_RATIO },
    );

    expect(springApi.start).toHaveBeenCalledWith(
      expect.objectContaining({
        from: transformRef.current,
        to: expected,
      }),
    );
  });

  it('pans again when the same id gets a new position while follow mode is active', () => {
    const transformRef = { current: makeMatrix() };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    mockCurrentId = 'a';
    mockCurrentNode = {
      data: { id: 'a' },
      x: 50,
      y: 120,
    };

    const { rerender } = renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    springApi.start.mockClear();

    mockCurrentNode = {
      data: { id: 'a' },
      x: 60,
      y: 120,
    };

    rerender();

    const expected = anchorTreePoint(
      transformRef.current,
      { width: 300, height: 200 },
      { x: 120, y: 60 },
      { xRatio: PAN_TARGET_X_RATIO, yRatio: PAN_TARGET_Y_RATIO },
    );

    expect(springApi.start).toHaveBeenCalledTimes(1);
    expect(springApi.start).toHaveBeenCalledWith(
      expect.objectContaining({
        from: transformRef.current,
        to: expected,
      }),
    );
  });

  it('does not pan on same-id position changes after updateSpring disables follow mode', () => {
    const transformRef = { current: makeMatrix() };
    const zoom = {
      initialTransformMatrix: makeMatrix(),
      setTransformMatrix: vi.fn(),
    };

    mockCurrentId = 'a';
    mockCurrentNode = {
      data: { id: 'a' },
      x: 50,
      y: 120,
    };

    const { result, rerender } = renderHook(() =>
      useTreeNavigation({
        zoom: zoom as never,
        transformRef,
        width: 300,
        height: 200,
      }),
    );

    springApi.start.mockClear();

    act(() => {
      result.current.updateSpring();
    });

    mockCurrentNode = {
      data: { id: 'a' },
      x: 60,
      y: 120,
    };

    rerender();

    expect(springApi.start).not.toHaveBeenCalled();
  });
});
