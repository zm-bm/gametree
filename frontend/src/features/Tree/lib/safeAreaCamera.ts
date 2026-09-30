import type { TransformMatrix } from '@visx/zoom/lib/types';

import type { Point, ViewportSize } from './svgMath';

export type SafeAreaEdge = 'left' | 'right' | 'top' | 'bottom';

export type SafeAreaReservedRect = {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
  edges: SafeAreaEdge[];
  margin?: number;
};

export type SafeAreaInsets = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

export type SafeViewport = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export const DESKTOP_SAFE_AREA_EDGE_PADDING = 16;
export const MOBILE_SAFE_AREA_EDGE_PADDING = 12;
export const DEFAULT_RESERVED_RECT_MARGIN = 16;
export const MIN_SAFE_VIEWPORT_WIDTH = 96;
export const MIN_SAFE_VIEWPORT_HEIGHT = 96;

const isUsableReservedRect = (rect: SafeAreaReservedRect) =>
  rect.right > rect.left && rect.bottom > rect.top;

const scaleInsetsToFit = (
  first: number,
  second: number,
  viewportSize: number,
  minimumSafeSize: number,
): [number, number] => {
  const minimum = Math.min(minimumSafeSize, viewportSize);
  const maxInsetTotal = Math.max(0, viewportSize - minimum);
  const currentTotal = first + second;

  if (currentTotal <= maxInsetTotal || currentTotal === 0) {
    return [first, second];
  }

  const scale = maxInsetTotal / currentTotal;
  return [first * scale, second * scale];
};

export function getSafeAreaEdgePadding(viewport: ViewportSize): number {
  return Math.min(viewport.width, viewport.height) < 640
    ? MOBILE_SAFE_AREA_EDGE_PADDING
    : DESKTOP_SAFE_AREA_EDGE_PADDING;
}

export function computeSafeAreaInsets(
  viewport: ViewportSize,
  reservedRects: SafeAreaReservedRect[],
  edgePadding = getSafeAreaEdgePadding(viewport),
  defaultMargin = DEFAULT_RESERVED_RECT_MARGIN,
): SafeAreaInsets {
  let insets: SafeAreaInsets = {
    left: edgePadding,
    right: edgePadding,
    top: edgePadding,
    bottom: edgePadding,
  };

  for (const rect of reservedRects) {
    if (!isUsableReservedRect(rect)) continue;

    const margin = rect.margin ?? defaultMargin;

    for (const edge of rect.edges) {
      if (edge === 'left') {
        insets.left = Math.max(insets.left, rect.right + margin);
      } else if (edge === 'right') {
        insets.right = Math.max(insets.right, viewport.width - rect.left + margin);
      } else if (edge === 'top') {
        insets.top = Math.max(insets.top, rect.bottom + margin);
      } else {
        insets.bottom = Math.max(insets.bottom, viewport.height - rect.top + margin);
      }
    }
  }

  const [left, right] = scaleInsetsToFit(
    insets.left,
    insets.right,
    viewport.width,
    MIN_SAFE_VIEWPORT_WIDTH,
  );
  const [top, bottom] = scaleInsetsToFit(
    insets.top,
    insets.bottom,
    viewport.height,
    MIN_SAFE_VIEWPORT_HEIGHT,
  );

  insets = { left, right, top, bottom };

  return insets;
}

export function computeSafeViewport(
  viewport: ViewportSize,
  reservedRects: SafeAreaReservedRect[],
): SafeViewport {
  const insets = computeSafeAreaInsets(viewport, reservedRects);
  const left = insets.left;
  const top = insets.top;
  const right = Math.max(left, viewport.width - insets.right);
  const bottom = Math.max(top, viewport.height - insets.bottom);

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export function projectTreePoint(
  transformMatrix: TransformMatrix,
  treePoint: Point,
): Point {
  return {
    x: treePoint.x * transformMatrix.scaleX + transformMatrix.translateX,
    y: treePoint.y * transformMatrix.scaleY + transformMatrix.translateY,
  };
}

export function frameTreePointInSafeArea(
  transformMatrix: TransformMatrix,
  viewport: ViewportSize,
  treePoint: Point,
  reservedRects: SafeAreaReservedRect[],
  anchor: { xRatio: number; yRatio: number },
): TransformMatrix {
  const safeViewport = computeSafeViewport(viewport, reservedRects);

  return {
    ...transformMatrix,
    translateX:
      -treePoint.x * transformMatrix.scaleX +
      safeViewport.left +
      safeViewport.width * anchor.xRatio,
    translateY:
      -treePoint.y * transformMatrix.scaleY +
      safeViewport.top +
      safeViewport.height * anchor.yRatio,
  };
}
