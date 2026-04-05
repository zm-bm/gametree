import { describe, expect, it } from 'vitest';

import {
  anchorTreePoint,
  boundsFromPoints,
  centerTreePoint,
  fitBounds,
  fromSvgPoint,
  localPointFromClient,
  svgMatrix,
  toSvgPoint,
  toSvgRect,
  treeViewportCenter,
  treeViewportRect,
  zoomAtPoint,
} from './svgMath';

describe('svgMath', () => {
  it('computes bounds from points and returns null for empty input', () => {
    expect(boundsFromPoints([])).toBeNull();

    expect(
      boundsFromPoints([
        { x: 2, y: 6 },
        { x: 10, y: 4 },
        { x: 4, y: 12 },
      ]),
    ).toEqual({
      left: 2,
      top: 4,
      right: 10,
      bottom: 12,
    });
  });

  it('fits bounds into viewport with centered translation', () => {
    const transform = fitBounds(
      { left: 10, top: 20, right: 50, bottom: 60 },
      { width: 100, height: 100 },
    );

    expect(transform).toEqual({
      scale: 2.5,
      translateX: -25,
      translateY: -50,
    });
    expect(svgMatrix(transform)).toBe('matrix(2.5 0 0 2.5 -25 -50)');
  });

  it('converts local/client points and svg/tree points', () => {
    expect(localPointFromClient({ x: 110, y: 75 }, { left: 10, top: 15 })).toEqual({
      x: 100,
      y: 60,
    });

    const transform = { scale: 2, translateX: 10, translateY: 20 };
    const svgPoint = toSvgPoint({ x: 5, y: 7 }, transform);

    expect(svgPoint).toEqual({ x: 20, y: 34 });
    expect(fromSvgPoint(svgPoint, transform)).toEqual({ x: 5, y: 7 });

    expect(
      toSvgRect(
        { left: 2, top: 3, width: 4, height: 5 },
        transform,
      ),
    ).toEqual({ x: 14, y: 26, width: 8, height: 10 });
  });

  it('computes tree viewport rect and center from transform matrix', () => {
    const matrix = {
      translateX: -40,
      translateY: -20,
      scaleX: 2,
      scaleY: 4,
      skewX: 0,
      skewY: 0,
    };

    expect(treeViewportRect(matrix, { width: 200, height: 120 })).toEqual({
      left: 20,
      top: 5,
      width: 100,
      height: 30,
    });

    expect(treeViewportCenter(matrix, { width: 200, height: 120 })).toEqual({
      x: 70,
      y: 20,
    });
  });

  it('anchors and centers tree points in viewport and supports zoom at point', () => {
    const matrix = {
      translateX: 0,
      translateY: 0,
      scaleX: 2,
      scaleY: 2,
      skewX: 0,
      skewY: 0,
    };

    expect(
      anchorTreePoint(matrix, { width: 300, height: 200 }, { x: 50, y: 10 }, { xRatio: 1 / 3, yRatio: 1 / 2 }),
    ).toEqual({
      ...matrix,
      translateX: 0,
      translateY: 80,
    });

    expect(centerTreePoint(matrix, { width: 300, height: 200 }, { x: 50, y: 10 })).toEqual({
      ...matrix,
      translateX: 50,
      translateY: 80,
    });

    expect(zoomAtPoint(matrix, { x: 100, y: 50 }, 2)).toEqual({
      ...matrix,
      translateX: -100,
      translateY: -50,
      scaleX: 4,
      scaleY: 4,
    });
  });
});