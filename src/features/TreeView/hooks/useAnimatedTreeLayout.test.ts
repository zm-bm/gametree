import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { UseSpringProps } from 'react-spring';

import { createTestHierarchyPointNode } from '@/features/TreeView/testUtils';

type SpringLifecycleConfig = Pick<UseSpringProps<{ t: number }>, 'onChange' | 'onRest'>;
type SpringOnChange = (args: { value: { t?: number } }) => void;
type SpringOnRest = (args: { cancelled?: boolean }) => void;

let springConfig: SpringLifecycleConfig | null = null;
let currentProgress = 0;

const springApi = {
  stop: vi.fn(),
  start: vi.fn(),
};

vi.mock('react-spring', () => ({
  useSpring: vi.fn((factory: () => unknown) => {
    springConfig = factory() as typeof springConfig;
    return [{ t: {} }, springApi];
  }),
  to: vi.fn((_: unknown, mapper: (tt: number) => number) => mapper(currentProgress)),
}));

import { useAnimatedTreeLayout } from './useAnimatedTreeLayout';

function triggerSpringRest(cancelled = false) {
  const onRest = springConfig?.onRest;
  if (typeof onRest === 'function') {
    (onRest as unknown as SpringOnRest)({ cancelled });
  }
}

function triggerSpringChange(t: number) {
  const onChange = springConfig?.onChange;
  if (typeof onChange === 'function') {
    (onChange as unknown as SpringOnChange)({ value: { t } });
  }
}

describe('useAnimatedTreeLayout', () => {
  beforeEach(() => {
    currentProgress = 0;
    springConfig = null;
    springApi.stop.mockClear();
    springApi.start.mockClear();
  });

  it('interpolates positions between previous and next layout', () => {
    const nodeA0 = createTestHierarchyPointNode({ id: 'a', x: 10, y: 20 });
    const { result, rerender } = renderHook(
      ({ nodes }) => useAnimatedTreeLayout(nodes),
      { initialProps: { nodes: [nodeA0] } }
    );

    triggerSpringRest(false);

    const nodeA1 = createTestHierarchyPointNode({ id: 'a', x: 30, y: 60 });
    rerender({ nodes: [nodeA1] });

    currentProgress = 0;
    expect(result.current.ax('a')).toBe(10);
    expect(result.current.ay('a')).toBe(20);

    currentProgress = 0.5;
    expect(result.current.ax('a')).toBe(20);
    expect(result.current.ay('a')).toBe(40);

    currentProgress = 1;
    expect(result.current.ax('a')).toBe(30);
    expect(result.current.ay('a')).toBe(60);
  });

  it('rebases from in-flight position when a new layout arrives mid-animation', () => {
    const { result, rerender } = renderHook(
      ({ nodes }) => useAnimatedTreeLayout(nodes),
      { initialProps: { nodes: [createTestHierarchyPointNode({ id: 'a', x: 0, y: 0 })] } }
    );

    triggerSpringRest(false);

    rerender({ nodes: [createTestHierarchyPointNode({ id: 'a', x: 100, y: 0 })] });

    triggerSpringChange(0.5);

    rerender({ nodes: [createTestHierarchyPointNode({ id: 'a', x: 200, y: 0 })] });

    currentProgress = 0;
    expect(result.current.ax('a')).toBe(50);

    currentProgress = 1;
    expect(result.current.ax('a')).toBe(200);
  });

  it('animates new nodes from parent origin when available', () => {
    const root = createTestHierarchyPointNode({ id: 'root', x: 0, y: 0 });
    const { result, rerender } = renderHook(
      ({ nodes }) => useAnimatedTreeLayout(nodes),
      { initialProps: { nodes: [root] } }
    );

    triggerSpringRest(false);

    const child = createTestHierarchyPointNode({
      id: 'child',
      x: 80,
      y: 40,
      parent: { id: 'root' },
    });
    rerender({ nodes: [root, child] });

    currentProgress = 0;
    expect(result.current.ax('child')).toBe(0);
    expect(result.current.ay('child')).toBe(0);

    currentProgress = 1;
    expect(result.current.ax('child')).toBe(80);
    expect(result.current.ay('child')).toBe(40);
  });

  it('ignores no-op layout updates with identical positions', () => {
    const node = createTestHierarchyPointNode({ id: 'a', x: 12, y: 34 });
    const { rerender } = renderHook(
      ({ nodes }) => useAnimatedTreeLayout(nodes),
      { initialProps: { nodes: [node] } }
    );

    triggerSpringRest(false);
    springApi.start.mockClear();
    springApi.stop.mockClear();

    rerender({ nodes: [createTestHierarchyPointNode({ id: 'a', x: 12, y: 34 })] });

    expect(springApi.start).not.toHaveBeenCalled();
    expect(springApi.stop).not.toHaveBeenCalled();
  });
});