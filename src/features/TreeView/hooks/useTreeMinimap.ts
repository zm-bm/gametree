import { useCallback, useMemo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { TransformMatrix } from "@visx/zoom/lib/types";
import { SpringRef } from "react-spring";

import { TreeViewNode } from "@/shared/types";
import {
  svgMatrix,
  boundsFromPoints,
  localPointFromClient,
  fitBounds,
  fromSvgPoint,
  toSvgRect,
  centerTreePoint,
  treeViewportRect,
} from "@/features/TreeView/lib/svgMath";

type MinimapEvent = {
  clientX: number;
  clientY: number;
  currentTarget: EventTarget & SVGSVGElement
};

interface Props {
  spring: SpringRef<TransformMatrix>,
  nodes: HierarchyPointNode<TreeViewNode>[],
  minimapWidth: number,
  minimapHeight: number,
  treeWidth: number,
  treeHeight: number,
  transformMatrix: TransformMatrix,
  setTransformMatrix: (matrix: TransformMatrix) => void,
};

export const useTreeMinimap = ({
  spring,
  nodes,
  minimapWidth,
  minimapHeight,
  treeWidth,
  treeHeight,
  transformMatrix,
  setTransformMatrix,
}: Props) => {

  // Calculate tree bounds for coordinate conversions
  const treeBounds = useMemo(() => {
    return boundsFromPoints(nodes.map((node) => ({ x: node.y, y: node.x })));
  }, [nodes]);

  // Calculate optimal margin based on tree size
  const scaleFactor = useMemo(() => Math.min(Math.sqrt(nodes.length / 64), 0.85), [nodes.length]);

  // Calculate minimap transform parameters
  const minimapTransform = useMemo(() => {
    if (!treeBounds) return null;
    const { scale, translateX, translateY } = fitBounds(
      treeBounds,
      { width: minimapWidth, height: minimapHeight },
      scaleFactor,
    );

    return {
      scale,
      translateX,
      translateY,
      matrix: svgMatrix({ scale, translateX, translateY }),
    };
  }, [treeBounds, scaleFactor, minimapWidth, minimapHeight]);

  // Calculate viewport rectangle position and size
  const viewportRect = useMemo(() => {
    if (!minimapTransform) return null;

    const treeViewport = treeViewportRect(transformMatrix, {
      width: treeWidth,
      height: treeHeight,
    });

    return toSvgRect(treeViewport, minimapTransform);
  }, [transformMatrix, minimapTransform, treeWidth, treeHeight]);

  // Convert minimap coordinates to tree coordinates
  const minimapToTreeCoords = useCallback((minimapX: number, minimapY: number) => {
    if (!minimapTransform) return null;
    return fromSvgPoint({ x: minimapX, y: minimapY }, minimapTransform);
  }, [minimapTransform]);

  // Center the viewport on a specific point in the minimap
  const centerViewportPoint = useCallback((minimapX: number, minimapY: number) => {
    // Convert to tree coordinates 
    const treeCoords = minimapToTreeCoords(minimapX, minimapY);
    if (!treeCoords) return;

    const transform = centerTreePoint(
      transformMatrix,
      { width: treeWidth, height: treeHeight },
      treeCoords,
    );
    setTransformMatrix(transform);
    spring.set(transform);
  }, [minimapToTreeCoords, setTransformMatrix, transformMatrix, treeWidth, treeHeight, spring]);

  const centerViewport = useCallback((event: MinimapEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const { x, y } = localPointFromClient({ x: event.clientX, y: event.clientY }, rect);
    centerViewportPoint(x, y);
  }, [centerViewportPoint]);

  return {
    treeBounds,
    transform: minimapTransform,
    viewport: viewportRect,
    minimapToTreeCoords,
    centerViewport,
  };
};
