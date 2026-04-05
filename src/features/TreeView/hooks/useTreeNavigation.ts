import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useSpring } from '@react-spring/web'

import { TreeViewNode, TreeZoom } from '@/types';
import { RootState } from '@/store';
import { selectCurrentId, selectCurrentNode } from '@/store/selectors';
import {
  anchorTreePoint,
  zoomAtPoint,
} from '@/features/TreeView/lib/svgMath';

export const SPRING_CONFIG = {
  tension: 150,
  friction: 26,
  clamp: true,
} as const;

export const ZOOM_BUTTON_SCALE_STEP = 1.12;
export const PAN_TARGET_X_RATIO = 1 / 3;
export const PAN_TARGET_Y_RATIO = 1 / 2;

export interface Props {
  zoom: TreeZoom;
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
    const scaleMultiplier = direction === 'in'
      ? ZOOM_BUTTON_SCALE_STEP
      : (1 / ZOOM_BUTTON_SCALE_STEP);
    const nextTransform = zoomAtPoint(
      transformRef.current,
      { x: width / 2, y: height / 2 },
      scaleMultiplier,
    );
    startFromCurrentTransform(nextTransform);
  }, [startFromCurrentTransform, transformRef, width, height]);

  // Handler for panning to a specific node
  const panToNode = useCallback((node: HierarchyPointNode<TreeViewNode>) => {
    const nextTransform = anchorTreePoint(
      transformRef.current,
      { width, height },
      { x: node.y, y: node.x },
      { xRatio: PAN_TARGET_X_RATIO, yRatio: PAN_TARGET_Y_RATIO },
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
