import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useSelector } from 'react-redux';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useSpring } from '@react-spring/web';

import { TreeViewNode, TreeZoom } from '@/types';
import { RootState } from '@/store';
import { selectCurrentId, selectCurrentNode } from '@/store/selectors';
import { zoomAtPoint } from '@/features/Tree/lib/svgMath';
import {
  frameTreePointInSafeArea,
  projectTreePoint,
  type SafeAreaReservedRect,
} from '@/features/Tree/lib/safeAreaCamera';

export const SPRING_CONFIG = {
  tension: 150,
  friction: 26,
  clamp: true,
} as const;

export const ZOOM_BUTTON_SCALE_STEP = 1.3;
export const PAN_TARGET_X_RATIO = 1 / 3;
export const PAN_TARGET_Y_RATIO = 1 / 2;

const EMPTY_SAFE_AREA_RECTS: SafeAreaReservedRect[] = [];

export interface Props {
  zoom: TreeZoom;
  transformRef: React.MutableRefObject<TransformMatrix>;
  width: number;
  height: number;
  safeAreaRects?: SafeAreaReservedRect[];
}

const getNodeTreePoint = (node: HierarchyPointNode<TreeViewNode>) => ({
  x: node.y,
  y: node.x,
});

const getSafeAreaKey = (rects: SafeAreaReservedRect[]) =>
  rects
    .map((rect) => [
      rect.id,
      rect.left,
      rect.top,
      rect.right,
      rect.bottom,
      rect.edges.join('|'),
      rect.margin ?? '',
    ].join(':'))
    .join(';');

export function useTreeNavigation({
  zoom,
  transformRef,
  width,
  height,
  safeAreaRects = EMPTY_SAFE_AREA_RECTS,
}: Props) {
  const currentId = useSelector((s: RootState) => selectCurrentId(s));
  const currentNode = useSelector((s: RootState) => selectCurrentNode(s));
  const followCurrentRef = useRef(true);
  const lastCurrentPosRef = useRef<{ id: string; x: number; y: number } | null>(null);
  const lastViewportKeyRef = useRef('');
  const lastSafeAreaKeyRef = useRef('');
  const viewport = useMemo(() => ({ width, height }), [width, height]);
  const viewportKey = `${width}|${height}`;
  const safeAreaKey = getSafeAreaKey(safeAreaRects);

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

  const frameNode = useCallback((node: HierarchyPointNode<TreeViewNode>, baseTransform = transformRef.current) => {
    const nextTransform = frameTreePointInSafeArea(
      baseTransform,
      viewport,
      getNodeTreePoint(node),
      safeAreaRects,
      { xRatio: PAN_TARGET_X_RATIO, yRatio: PAN_TARGET_Y_RATIO },
    );
    startFromCurrentTransform(nextTransform);
  }, [safeAreaRects, startFromCurrentTransform, transformRef, viewport]);

  // Handle zooming in and out
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    const scaleMultiplier = direction === 'in'
      ? ZOOM_BUTTON_SCALE_STEP
      : (1 / ZOOM_BUTTON_SCALE_STEP);
    const pointNode = currentNode as HierarchyPointNode<TreeViewNode> | null;
    const currentPoint = pointNode ? getNodeTreePoint(pointNode) : null;
    const focus = currentPoint
      ? projectTreePoint(transformRef.current, currentPoint)
      : { x: width / 2, y: height / 2 };
    const zoomedTransform = zoomAtPoint(
      transformRef.current,
      focus,
      scaleMultiplier,
    );
    const nextTransform = currentPoint
      ? frameTreePointInSafeArea(
          zoomedTransform,
          viewport,
          currentPoint,
          safeAreaRects,
          { xRatio: PAN_TARGET_X_RATIO, yRatio: PAN_TARGET_Y_RATIO },
        )
      : zoomedTransform;

    startFromCurrentTransform(nextTransform);
  }, [currentNode, safeAreaRects, startFromCurrentTransform, transformRef, viewport, width, height]);

  const centerCurrent = useCallback(() => {
    if (!currentNode) return;

    followCurrentRef.current = true;
    frameNode(currentNode as HierarchyPointNode<TreeViewNode>);
  }, [currentNode, frameNode]);

  // Follow the current node while in "follow" mode:
  // - currentId change => always pan and re-enable follow
  // - same currentId but coords changed (layout/data update) => pan only if following
  // - viewport resize => reframe even after manual exploration
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
      const viewportChanged = lastViewportKeyRef.current !== viewportKey;
      const safeAreaChanged = lastSafeAreaKeyRef.current !== safeAreaKey;

      if (idChanged || viewportChanged) {
        followCurrentRef.current = true;
        frameNode(pointNode);
      } else if (positionChanged && followCurrentRef.current) {
        frameNode(pointNode);
      } else if (safeAreaChanged && followCurrentRef.current) {
        frameNode(pointNode);
      }

      lastCurrentPosRef.current = currentPos;
    }

    lastViewportKeyRef.current = viewportKey;
    lastSafeAreaKeyRef.current = safeAreaKey;
  }, [currentId, currentNode, frameNode, safeAreaKey, viewportKey]);

  return {
    spring,
    updateSpring,
    handleZoom,
    centerCurrent,
  };
}
