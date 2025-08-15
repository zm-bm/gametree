import { useCallback, useEffect, useRef, useState } from 'react';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { useSpring } from '@react-spring/web'
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { TreeNodeData } from '../types/chess';
import { ZoomState } from '../types/tree';
import { DEFAULT_TRANSFORM } from '../components/MoveTree/constants';

export interface Props {
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState;
  transformRef: React.MutableRefObject<TransformMatrix>;
  width: number;
  height: number;
  source: string | null;
}

export function useTreeNavigation({
  zoom,
  transformRef,
  width,
  height,
  source
}: Props) {
  // Refs and state for tracking nodes
  const currentNodeRef = useRef<HierarchyPointNode<TreeNodeData> | null>(null);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const lastNodeRef = useRef<HierarchyPointNode<TreeNodeData> | null>(null);
  const sourceRef = useRef<string | null>(null);

  // React-spring, used for animating zoom and pan
  const [, spring] = useSpring<TransformMatrix>(() => ({
    ...DEFAULT_TRANSFORM,
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

  // Handler for updating the current node
  const updateCurrentNode = useCallback((node: HierarchyPointNode<TreeNodeData>) => {
    currentNodeRef.current = node;
    setCurrentNodeId(node.data.id);
  }, []);

  // Panning to current node when node or source changes
  useEffect(() => {
    if (!currentNodeRef.current) return;
    if (currentNodeId !== lastNodeRef.current?.data.id || source !== sourceRef.current) {
      panToNode(currentNodeRef.current);
      lastNodeRef.current = currentNodeRef.current;
      sourceRef.current = source;
    }
  }, [source, currentNodeId, panToNode]);

  return {
    spring,
    currentNodeRef,
    currentNodeId,
    updateCurrentNode,
    updateSpring,
    panToNode,
    handleZoom,
  };
};
