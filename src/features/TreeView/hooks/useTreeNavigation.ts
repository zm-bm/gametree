import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useSpring } from '@react-spring/web'

import { TreeViewNode, ZoomState } from '@/shared/types';
import { RootState } from '@/store';
import { selectCurrentId, selectCurrentNode } from '@/store/selectors';

export const SPRING_CONFIG = {
  tension: 150,
  friction: 26,
  clamp: true,
} as const;

export const ZOOM_BUTTON_SCALE_STEP = 1.12;
export const PAN_TARGET_X_RATIO = 1 / 3;
export const PAN_TARGET_Y_RATIO = 1 / 2;

export function getZoomedTransform(
  currentTransform: TransformMatrix,
  viewport: { width: number; height: number },
  direction: 'in' | 'out',
) {
  const scale = direction === 'in'
    ? ZOOM_BUTTON_SCALE_STEP
    : (1 / ZOOM_BUTTON_SCALE_STEP);
  const centerX = viewport.width / 2;
  const centerY = viewport.height / 2;

  return {
    ...currentTransform,
    translateX: centerX - (centerX - currentTransform.translateX) * scale,
    translateY: centerY - (centerY - currentTransform.translateY) * scale,
    scaleX: currentTransform.scaleX * scale,
    scaleY: currentTransform.scaleY * scale,
  };
}

export function getPanToNodeTransform(
  currentTransform: TransformMatrix,
  viewport: { width: number; height: number },
  nodePosition: { x: number; y: number },
) {
  return {
    ...currentTransform,
    translateX: (-nodePosition.y * currentTransform.scaleX) + (viewport.width * PAN_TARGET_X_RATIO),
    translateY: (-nodePosition.x * currentTransform.scaleY) + (viewport.height * PAN_TARGET_Y_RATIO),
  };
}

export interface Props {
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState;
  transformRef: React.MutableRefObject<TransformMatrix>;
  width: number;
  height: number;
}

export function useTreeNavigation({
  zoom,
  transformRef,
  width,
  height,
}: Props) {
  const currentId = useSelector((s: RootState) => selectCurrentId(s));
  const currentNode = useSelector((s: RootState) => selectCurrentNode(s));
  const followCurrentRef = useRef(true);
  const lastCurrentPosRef = useRef<{ id: string; x: number; y: number } | null>(null);

  // React-spring, used for animating zoom and pan
  const [, spring] = useSpring<TransformMatrix>(() => ({
    ...zoom.initialTransformMatrix,
    config: SPRING_CONFIG,
    onChange: ({ value }) => zoom.setTransformMatrix(value as TransformMatrix),
  }));

  const startFromCurrentTransform = useCallback((nextTransform: TransformMatrix) => {
    spring.stop();
    spring.start({
      from: transformRef.current,
      to: nextTransform,
      config: SPRING_CONFIG,
    });
  }, [spring, transformRef]);

  // Update spring with current transform when transform changes
  const updateSpring = useCallback(() => {
    // Manual pan/drag means user is exploring and camera should stop auto-following.
    followCurrentRef.current = false;
    spring.stop();
    spring.set(transformRef.current);
  }, [spring, transformRef]);

  // Handle zooming in and out
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const nextTransform = getZoomedTransform(transformRef.current, { width, height }, direction);
    startFromCurrentTransform(nextTransform);
  }, [startFromCurrentTransform, transformRef, width, height]);

  // Handler for panning to a specific node
  const panToNode = useCallback((node: HierarchyPointNode<TreeViewNode>) => {
    const nextTransform = getPanToNodeTransform(
      transformRef.current,
      { width, height },
      { x: node.x, y: node.y },
    );
    startFromCurrentTransform(nextTransform);
  }, [startFromCurrentTransform, transformRef, width, height]);

  // Follow the current node while in "follow" mode:
  // - currentId change => always pan and re-enable follow
  // - same currentId but coords changed (layout/data update) => pan only if following
  useEffect(() => {
    if (currentNode) {
      const pointNode = currentNode as HierarchyPointNode<TreeViewNode>;
      const currentPos = {
        id: pointNode.data.id,
        x: pointNode.x,
        y: pointNode.y,
      };
      const lastPos = lastCurrentPosRef.current;
      const idChanged = !lastPos || lastPos.id !== currentPos.id;
      const positionChanged = !idChanged && (lastPos.x !== currentPos.x || lastPos.y !== currentPos.y);

      if (idChanged) {
        followCurrentRef.current = true;
        panToNode(pointNode);
      } else if (positionChanged && followCurrentRef.current) {
        panToNode(pointNode);
      }

      lastCurrentPosRef.current = currentPos;
    }
  }, [currentId, currentNode, panToNode]);

  return {
    spring,
    updateSpring,
    handleZoom,
  };
};
