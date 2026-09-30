import type { TransformMatrix } from '@visx/zoom/lib/types';
import { describe, expect, it } from 'vitest';

import {
  computeSafeAreaInsets,
  computeSafeViewport,
  frameTreePointInSafeArea,
  getSafeAreaEdgePadding,
  projectTreePoint,
  type SafeAreaReservedRect,
} from './safeAreaCamera';

const matrix: TransformMatrix = {
  translateX: 10,
  translateY: 20,
  scaleX: 2,
  scaleY: 2,
  skewX: 0,
  skewY: 0,
};

describe('safeAreaCamera', () => {
  it('reserves the compact Board HUD as a left inset', () => {
    const insets = computeSafeAreaInsets(
      { width: 900, height: 500 },
      [
        {
          id: 'board-hud',
          left: 8,
          top: 8,
          right: 180,
          bottom: 252,
          edges: ['left'],
        },
      ],
    );

    expect(insets.left).toBe(196);
    expect(insets.right).toBe(12);
  });

  it('reserves Help as top and right space', () => {
    const insets = computeSafeAreaInsets(
      { width: 900, height: 500 },
      [
        {
          id: 'help',
          left: 820,
          top: 8,
          right: 892,
          bottom: 42,
          edges: ['top', 'right'],
        },
      ],
    );

    expect(insets.top).toBe(58);
    expect(insets.right).toBe(96);
  });

  it('reserves bottom controls as bottom and right space by control edge', () => {
    const insets = computeSafeAreaInsets(
      { width: 900, height: 500 },
      [
        {
          id: 'bottom-left-controls',
          left: 8,
          top: 430,
          right: 260,
          bottom: 492,
          edges: ['bottom'],
        },
        {
          id: 'bottom-right-controls',
          left: 680,
          top: 360,
          right: 900,
          bottom: 500,
          edges: ['bottom', 'right'],
        },
      ],
    );

    expect(insets.bottom).toBe(156);
    expect(insets.right).toBe(236);
  });

  it('uses mobile edge padding on mobile-sized viewports', () => {
    expect(getSafeAreaEdgePadding({ width: 390, height: 844 })).toBe(12);
    expect(getSafeAreaEdgePadding({ width: 1280, height: 800 })).toBe(16);
  });

  it('clamps tiny viewports so the safe area remains nonnegative', () => {
    const safeViewport = computeSafeViewport(
      { width: 120, height: 80 },
      [
        {
          id: 'huge-left-control',
          left: 0,
          top: 0,
          right: 300,
          bottom: 80,
          edges: ['left'],
        },
        {
          id: 'huge-bottom-control',
          left: 0,
          top: 0,
          right: 120,
          bottom: 200,
          edges: ['bottom'],
        },
      ],
    );

    expect(safeViewport.width).toBeGreaterThanOrEqual(0);
    expect(safeViewport.height).toBeGreaterThanOrEqual(0);
    expect(safeViewport.right).toBeGreaterThanOrEqual(safeViewport.left);
    expect(safeViewport.bottom).toBeGreaterThanOrEqual(safeViewport.top);
  });

  it('frames a tree point at the left third and vertical middle of the safe area', () => {
    const reservedRects: SafeAreaReservedRect[] = [
      {
        id: 'board-hud',
        left: 8,
        top: 8,
        right: 180,
        bottom: 250,
        edges: ['left'],
      },
      {
        id: 'bottom-right-controls',
        left: 680,
        top: 360,
        right: 900,
        bottom: 500,
        edges: ['bottom', 'right'],
      },
    ];
    const viewport = { width: 900, height: 500 };
    const safeViewport = computeSafeViewport(viewport, reservedRects);

    const nextTransform = frameTreePointInSafeArea(
      matrix,
      viewport,
      { x: 120, y: 40 },
      reservedRects,
      { xRatio: 1 / 3, yRatio: 1 / 2 },
    );

    expect(projectTreePoint(nextTransform, { x: 120, y: 40 })).toEqual({
      x: safeViewport.left + safeViewport.width / 3,
      y: safeViewport.top + safeViewport.height / 2,
    });
  });
});
