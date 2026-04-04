import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { TransformMatrix } from '@visx/zoom/lib/types';

import { createTestHierarchyPointNode } from '@/features/TreeView/testUtils';
import {
  treeViewportCenter,
  toSvgPoint,
} from '@/features/TreeView/lib/svgMath';

import { useTreeMinimap } from './useTreeMinimap';

const makeMatrix = (overrides: Partial<TransformMatrix> = {}): TransformMatrix => ({
  translateX: 0,
  translateY: 0,
  scaleX: 2,
  scaleY: 2,
  skewX: 0,
  skewY: 0,
  ...overrides,
});

describe('useTreeMinimap', () => {
  it('returns null-derived values when there are no nodes', () => {
    const spring = { set: vi.fn() };
    const setTransformMatrix = vi.fn();

    const { result } = renderHook(() =>
      useTreeMinimap({
        spring: spring as never,
        nodes: [],
        minimapWidth: 120,
        minimapHeight: 80,
        treeWidth: 600,
        treeHeight: 400,
        transformMatrix: makeMatrix(),
        setTransformMatrix,
      }),
    );

    expect(result.current.treeBounds).toBeNull();
    expect(result.current.transform).toBeNull();
    expect(result.current.viewport).toBeNull();
    expect(result.current.minimapToTreeCoords(10, 10)).toBeNull();
  });

  it('computes tree bounds, minimap transform, and viewport', () => {
    const spring = { set: vi.fn() };
    const setTransformMatrix = vi.fn();
    const nodes = [
      createTestHierarchyPointNode({ id: 'a', x: 10, y: 20 }),
      createTestHierarchyPointNode({ id: 'b', x: 110, y: 220 }),
    ];

    const { result } = renderHook(() =>
      useTreeMinimap({
        spring: spring as never,
        nodes,
        minimapWidth: 100,
        minimapHeight: 80,
        treeWidth: 400,
        treeHeight: 200,
        transformMatrix: makeMatrix({ translateX: -40, translateY: -20, scaleX: 2, scaleY: 2 }),
        setTransformMatrix,
      }),
    );

    expect(result.current.treeBounds).toEqual({
      left: 20,
      top: 10,
      right: 220,
      bottom: 110,
    });

    expect(result.current.transform).toEqual(
      expect.objectContaining({
        scale: expect.any(Number),
        translateX: expect.any(Number),
        translateY: expect.any(Number),
        matrix: expect.any(String),
      }),
    );

    const transform = result.current.transform;
    const viewport = result.current.viewport;
    expect(transform).not.toBeNull();
    expect(viewport).not.toBeNull();
    if (!transform || !viewport) return;

    expect(transform.scale).toBeGreaterThan(0);
    expect(transform.matrix).toContain('matrix(');

    // The projected node positions should fit inside the minimap area.
    const projected = nodes.map((node) =>
      toSvgPoint({ x: node.y, y: node.x }, transform)
    );

    projected.forEach((p) => {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(100);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(80);
    });

    expect(viewport.width).toBeGreaterThan(0);
    expect(viewport.height).toBeGreaterThan(0);
    expect(viewport.width).toBeLessThanOrEqual(100);
    expect(viewport.height).toBeLessThanOrEqual(80);
  });

  it('converts minimap coordinates to tree coordinates', () => {
    const spring = { set: vi.fn() };
    const setTransformMatrix = vi.fn();
    const nodes = [
      createTestHierarchyPointNode({ id: 'a', x: 10, y: 20 }),
      createTestHierarchyPointNode({ id: 'b', x: 110, y: 220 }),
    ];

    const { result } = renderHook(() =>
      useTreeMinimap({
        spring: spring as never,
        nodes,
        minimapWidth: 100,
        minimapHeight: 80,
        treeWidth: 400,
        treeHeight: 200,
        transformMatrix: makeMatrix({ translateX: -40, translateY: -20, scaleX: 2, scaleY: 2 }),
        setTransformMatrix,
      }),
    );

    const topLeft = result.current.minimapToTreeCoords(10, 10);
    const center = result.current.minimapToTreeCoords(50, 40);
    const bottomRight = result.current.minimapToTreeCoords(90, 70);

    expect(topLeft).not.toBeNull();
    expect(center).not.toBeNull();
    expect(bottomRight).not.toBeNull();
    if (!topLeft || !center || !bottomRight) return;

    // Mapping should preserve ordering: farther right/down on minimap maps farther in tree coords.
    expect(topLeft.x).toBeLessThan(center.x);
    expect(center.x).toBeLessThan(bottomRight.x);
    expect(topLeft.y).toBeLessThan(center.y);
    expect(center.y).toBeLessThan(bottomRight.y);

    // Center sample should land within the tree bounds.
    expect(center.x).toBeGreaterThanOrEqual(20);
    expect(center.x).toBeLessThanOrEqual(220);
    expect(center.y).toBeGreaterThanOrEqual(10);
    expect(center.y).toBeLessThanOrEqual(110);
  });

  it('centers viewport from minimap click and syncs spring/matrix', () => {
    const spring = { set: vi.fn() };
    const setTransformMatrix = vi.fn();
    const nodes = [
      createTestHierarchyPointNode({ id: 'a', x: 10, y: 20 }),
      createTestHierarchyPointNode({ id: 'b', x: 110, y: 220 }),
    ];

    const transformMatrix = makeMatrix({ translateX: -40, translateY: -20, scaleX: 2, scaleY: 2 });

    const { result } = renderHook(() =>
      useTreeMinimap({
        spring: spring as never,
        nodes,
        minimapWidth: 100,
        minimapHeight: 80,
        treeWidth: 400,
        treeHeight: 200,
        transformMatrix,
        setTransformMatrix,
      }),
    );

    act(() => {
      result.current.centerViewport({
        clientX: 60,
        clientY: 50,
        currentTarget: {
          getBoundingClientRect: () => ({ left: 0, top: 0 }),
        } as unknown as EventTarget & SVGSVGElement,
      });
    });

    expect(setTransformMatrix).toHaveBeenCalledTimes(1);
    expect(spring.set).toHaveBeenCalledTimes(1);

    const nextTransform = setTransformMatrix.mock.calls[0][0] as TransformMatrix;
    expect(spring.set).toHaveBeenCalledWith(nextTransform);

    // The click point should become the viewport center in tree coordinates.
    const clickTreeCoords = result.current.minimapToTreeCoords(60, 50);
    expect(clickTreeCoords).not.toBeNull();
    if (!clickTreeCoords) return;

    const viewportCenter = treeViewportCenter(nextTransform, {
      width: 400,
      height: 200,
    });

    expect(viewportCenter.x).toBeCloseTo(clickTreeCoords.x, 6);
    expect(viewportCenter.y).toBeCloseTo(clickTreeCoords.y, 6);
  });
});