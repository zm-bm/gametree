import { useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useSpring } from '@react-spring/web'

import { TreeNodeData, ZoomState } from '@/shared/types';
import { RootState } from '@/store';
import { selectCurrentId, selectCurrentNode } from '@/store/selectors';

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
    onChange: ({ value }) => zoom.setTransformMatrix(value as TransformMatrix),
  }));

  // Update spring with current transform when transform changes
  const updateSpring = useCallback(() => {
    // Manual pan/drag means user is exploring and camera should stop auto-following.
    followCurrentRef.current = false;
    spring.set(transformRef.current);
  }, [spring, transformRef]);

  // Handle zooming in and out
  const handleZoom = useCallback((direction: 'in' | 'out') => {
    // TODO: use zoom.handleWheel with calculated centerpoint
    const scale = direction === 'in' ? (6 / 5) : (5 / 6);
    spring.start({
      ...transformRef.current,
      translateX: transformRef.current.translateX * scale,
      translateY: transformRef.current.translateY * scale,
      scaleX: transformRef.current.scaleX * scale,
      scaleY: transformRef.current.scaleY * scale,
    })
  }, [spring, transformRef]);

  // Handler for panning to a specific node
  const panToNode = useCallback((node: HierarchyPointNode<TreeNodeData>) => {
    spring.start({
      ...transformRef.current,
      translateX: (-node.y * transformRef.current.scaleX) + (width / 3),
      translateY: (-node.x * transformRef.current.scaleY) + (height / 2),
    });
  }, [spring, transformRef, width, height]);

  // Follow the current node while in "follow" mode:
  // - currentId change => always pan and re-enable follow
  // - same currentId but coords changed (layout/data update) => pan only if following
  useEffect(() => {
    if (currentNode) {
      const pointNode = currentNode as HierarchyPointNode<TreeNodeData>;
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
