import { TransformMatrix } from '@visx/zoom/lib/types';

export type ViewportSize = {
  width: number;
  height: number;
};

export type Point = {
  x: number;
  y: number;
};

export type TreeViewportRect = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type BoundsRect = {
  left: number;
  top: number;
  right: number;
  bottom: number;
};

export type SvgRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ScaleTranslate = {
  scale: number;
  translateX: number;
  translateY: number;
};

export function boundsFromPoints(points: Point[]): BoundsRect | null {
  if (!points.length) return null;

  return points.reduce<BoundsRect>(
    (bounds, point) => ({
      left: Math.min(bounds.left, point.x),
      top: Math.min(bounds.top, point.y),
      right: Math.max(bounds.right, point.x),
      bottom: Math.max(bounds.bottom, point.y),
    }),
    {
      left: Infinity,
      top: Infinity,
      right: -Infinity,
      bottom: -Infinity,
    },
  );
}

export function fitBounds(
  bounds: BoundsRect,
  viewport: ViewportSize,
  scaleMultiplier = 1,
): ScaleTranslate {
  const boundsWidth = bounds.right - bounds.left;
  const boundsHeight = bounds.bottom - bounds.top;

  const xScale = viewport.width / (boundsWidth || 1);
  const yScale = viewport.height / (boundsHeight || 1);
  const scale = Math.min(xScale, yScale) * scaleMultiplier;

  const offsetX = (viewport.width - boundsWidth * scale) / 2;
  const offsetY = (viewport.height - boundsHeight * scale) / 2;

  return {
    scale,
    translateX: -bounds.left * scale + offsetX,
    translateY: -bounds.top * scale + offsetY,
  };
}

export function svgMatrix(transform: ScaleTranslate): string {
  return `matrix(${transform.scale} 0 0 ${transform.scale} ${transform.translateX} ${transform.translateY})`;
}

export function localPointFromClient(
  client: Point,
  rect: { left: number; top: number },
): Point {
  return {
    x: client.x - rect.left,
    y: client.y - rect.top,
  };
}

export function toSvgPoint(point: Point, transform: ScaleTranslate): Point {
  return {
    x: point.x * transform.scale + transform.translateX,
    y: point.y * transform.scale + transform.translateY,
  };
}

export function fromSvgPoint(point: Point, transform: ScaleTranslate): Point {
  return {
    x: (point.x - transform.translateX) / transform.scale,
    y: (point.y - transform.translateY) / transform.scale,
  };
}

export function toSvgRect(rect: TreeViewportRect, transform: ScaleTranslate): SvgRect {
  return {
    x: rect.left * transform.scale + transform.translateX,
    y: rect.top * transform.scale + transform.translateY,
    width: rect.width * transform.scale,
    height: rect.height * transform.scale,
  };
}

export function treeViewportRect(
  transformMatrix: TransformMatrix,
  viewport: ViewportSize,
): TreeViewportRect {
  return {
    left: -transformMatrix.translateX / transformMatrix.scaleX,
    top: -transformMatrix.translateY / transformMatrix.scaleY,
    width: viewport.width / transformMatrix.scaleX,
    height: viewport.height / transformMatrix.scaleY,
  };
}

export function treeViewportCenter(
  transformMatrix: TransformMatrix,
  viewport: ViewportSize,
): Point {
  const rect = treeViewportRect(transformMatrix, viewport);
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

export function centerTreePoint(
  transformMatrix: TransformMatrix,
  viewport: ViewportSize,
  treePoint: Point,
): TransformMatrix {
  return anchorTreePoint(transformMatrix, viewport, treePoint, {
    xRatio: 1 / 2,
    yRatio: 1 / 2,
  });
}

export function anchorTreePoint(
  transformMatrix: TransformMatrix,
  viewport: ViewportSize,
  treePoint: Point,
  anchor: { xRatio: number; yRatio: number },
): TransformMatrix {
  return {
    ...transformMatrix,
    translateX: -treePoint.x * transformMatrix.scaleX + viewport.width * anchor.xRatio,
    translateY: -treePoint.y * transformMatrix.scaleY + viewport.height * anchor.yRatio,
  };
}

export function zoomAtPoint(
  currentTransform: TransformMatrix,
  focus: Point,
  scaleMultiplier: number,
): TransformMatrix {
  return {
    ...currentTransform,
    translateX: focus.x - (focus.x - currentTransform.translateX) * scaleMultiplier,
    translateY: focus.y - (focus.y - currentTransform.translateY) * scaleMultiplier,
    scaleX: currentTransform.scaleX * scaleMultiplier,
    scaleY: currentTransform.scaleY * scaleMultiplier,
  };
}