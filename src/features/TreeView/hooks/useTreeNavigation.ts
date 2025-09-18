import { useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { useSpring } from '@react-spring/web'

import { TreeNodeData, ZoomState } from '@/shared/types';
import { RootState } from '@/store';
import { selectCurrentNode } from '@/store/selectors';

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
  const currentNode = useSelector((s: RootState) => selectCurrentNode(s));

  // React-spring, used for animating zoom and pan
  const [, spring] = useSpring<TransformMatrix>(() => ({
    ...zoom.initialTransformMatrix,
    onChange: ({ value }) => zoom.setTransformMatrix(value as TransformMatrix),
  }));

  // Update spring with current transform when transform changes
  const updateSpring = useCallback(() => {
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

  // If currentNode changes, pan to it
  useEffect(() => {
    if (currentNode) {
      panToNode(currentNode as HierarchyPointNode<TreeNodeData>);
    }
  }, [currentNode, panToNode]);

  return {
    spring,
    updateSpring,
    panToNode,
    handleZoom,
  };
};
