import { useCallback, useMemo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { TransformMatrix } from "@visx/zoom/lib/types";
import { SpringRef } from "react-spring";

import { TreeNodeData } from "@/shared/types";

const INITIAL_BOUNDS = {
  left: Infinity,
  top: Infinity,
  right: -Infinity,
  bottom: -Infinity,
};

type MinimapEvent = {
  clientX: number;
  clientY: number;
  currentTarget: EventTarget & SVGSVGElement
};

const getEventPoint = (event: MinimapEvent) => {
  const rect = event.currentTarget.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  return { x, y };
};

interface Props {
  spring: SpringRef<TransformMatrix>,
  nodes: HierarchyPointNode<TreeNodeData>[],
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
    return nodes.length ? nodes.reduce((bounds, node) => ({
      left: Math.min(bounds.left, node.y),
      top: Math.min(bounds.top, node.x),
      right: Math.max(bounds.right, node.y),
      bottom: Math.max(bounds.bottom, node.x),
    }), INITIAL_BOUNDS) : null;
  }, [nodes]);

  // Calculate optimal margin based on tree size
  const scaleFactor = useMemo(() => Math.min(Math.sqrt(nodes.length / 64), 0.85), [nodes.length]);

  // Calculate minimap transform parameters
  const minimapTransform = useMemo(() => {
    if (!treeBounds) return null;

    const treeBoundsWidth = treeBounds.right - treeBounds.left;
    const treeBoundsHeight = treeBounds.bottom - treeBounds.top;

    // Calculate scale to fit tree in minimap
    const xScale = minimapWidth / (treeBoundsWidth || 1);
    const yScale = minimapHeight / (treeBoundsHeight || 1);
    const scale = Math.min(xScale, yScale) * scaleFactor;

    // Calculate translation to center tree in minimap
    const offsetX = (minimapWidth - treeBoundsWidth * scale) / 2;
    const offsetY = (minimapHeight - treeBoundsHeight * scale) / 2;
    const translateX = -treeBounds.left * scale + offsetX;
    const translateY = -treeBounds.top * scale + offsetY;

    return {
      scale,
      translateX,
      translateY,
      matrix: `matrix(${scale} 0 0 ${scale} ${translateX} ${translateY})`,
    };
  }, [treeBounds, scaleFactor, minimapWidth, minimapHeight]);

  // Calculate viewport rectangle position and size
  const viewportRect = useMemo(() => {
    if (!minimapTransform) return null;

    // Convert main viewport position to tree coordinates
    const treeLeft = -transformMatrix.translateX / transformMatrix.scaleX;
    const treeTop = -transformMatrix.translateY / transformMatrix.scaleY;
    const treeViewportWidth = treeWidth / transformMatrix.scaleX;
    const treeViewportHeight = treeHeight / transformMatrix.scaleY;

    // Map tree coordinates to minimap coordinates
    return {
      x: treeLeft * minimapTransform.scale + minimapTransform.translateX,
      y: treeTop * minimapTransform.scale + minimapTransform.translateY,
      width: treeViewportWidth * minimapTransform.scale,
      height: treeViewportHeight * minimapTransform.scale,
    }
  }, [transformMatrix, minimapTransform, treeWidth, treeHeight]);

  // Convert minimap coordinates to tree coordinates
  const minimapToTreeCoords = useCallback((minimapX: number, minimapY: number) => {
    if (!minimapTransform) return null;
    return {
      x: (minimapX - minimapTransform.translateX) / minimapTransform.scale,
      y: (minimapY - minimapTransform.translateY) / minimapTransform.scale,
    };
  }, [minimapTransform]);

  // Center the viewport on a specific point in the minimap
  const centerViewportPoint = useCallback((minimapX: number, minimapY: number) => {
    // Convert to tree coordinates 
    const treeCoords = minimapToTreeCoords(minimapX, minimapY);
    if (!treeCoords) return;
    
    // Calculate proper center position with viewport center offset
    const transform = {
      ...transformMatrix,
      translateX: -treeCoords.x * transformMatrix.scaleX + treeWidth / 2,
      translateY: -treeCoords.y * transformMatrix.scaleY + treeHeight / 2,
    };
    setTransformMatrix(transform);
    spring.set(transform);
  }, [minimapToTreeCoords, setTransformMatrix, transformMatrix, treeWidth, treeHeight, spring]);

  const centerViewport = useCallback((event: MinimapEvent) => {
    const { x, y } = getEventPoint(event);
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
