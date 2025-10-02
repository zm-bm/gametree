import { useCallback, useEffect, useMemo, useRef } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { useSpring, to } from "react-spring";

import { TreeNodeData } from "@/shared/types";
import { getPlaceholderId } from "@/shared/lib/id";

type XY = { x: number; y: number };
type XYMap = Map<string, XY>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function useAnimatedTreeLayout(
  nodes: HierarchyPointNode<TreeNodeData>[],
  minimap: boolean
) {
  const prevPositionsRef = useRef<XYMap>(new Map());
  const nextPositionsRef = useRef<XYMap>(new Map());
  const pendingUpdateRef = useRef<XYMap | null>(null);

  // Build next position map
  const nextPositions: XYMap = useMemo(() => {
    const map = new Map<string, XY>();
    nodes.forEach((n) => {
      map.set(n.data.id, { x: n.x, y: n.y });
    });
    return map;
  }, [nodes]);

  // Resolve origin for each node
  const getOriginPosition = useCallback(
    (nodeId: string): XY | undefined => {
      const node = nodes.find((n) => n.data.id === nodeId);
      if (!node?.parent) return undefined;

      // Check if expanding from placeholder (sibling position)
      const placeholderId = getPlaceholderId(node.parent.data.id);
      if (prevPositionsRef.current.has(placeholderId)) {
        return prevPositionsRef.current.get(placeholderId);
      }

      // Default to parent position
      return (
        prevPositionsRef.current.get(node.parent.data.id) ||
        { x: node.parent.x, y: node.parent.y }
      );
    },
    [nodes]
  );

  // Shared spring for animation
  const [{ t }, api] = useSpring(() => ({
    t: 1,
    config: { tension: 300, friction: 30 },
    immediate: minimap,
    onRest: () => {
      // Update prev positions when animation completes
      if (pendingUpdateRef.current) {
        prevPositionsRef.current = new Map(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
    },
  }));

  // Interpolates position for a node id at time t
  const xyAt = useCallback((id: string, tt: number): XY | undefined => {
    const prev = prevPositionsRef.current.get(id);
    const next = nextPositionsRef.current.get(id);

    // If node exists in both layouts, interpolate
    if (prev && next) {
      return { x: lerp(prev.x, next.x, tt), y: lerp(prev.y, next.y, tt) };
    }

    // If node is new, animate from origin (parent or sibling placeholder)
    if (!next) {
      return prev || { x: 0, y: 0 };
    }

    const origin = getOriginPosition(id);
    const from = origin || next;
    return { x: lerp(from.x, next.x, tt), y: lerp(from.y, next.y, tt) };
  }, [getOriginPosition]);

  // Update layout and animate on node changes
  useEffect(() => {
    // Always update next positions ref first
    nextPositionsRef.current = new Map(nextPositions);

    if (minimap) {
      // For minimap, set prev positions to match next (no animation)
      prevPositionsRef.current = new Map(nextPositions);
      pendingUpdateRef.current = null;
    } else {
      // Store pending update for when animation completes
      pendingUpdateRef.current = new Map(nextPositions);
    }

    // Start animation
    api.start({ from: { t: 0 }, to: { t: 1 }, immediate: minimap });
  }, [nextPositions, api, minimap]);

  // Animated x/y accessors
  const ax = (id: string) => to(t, (tt) => xyAt(id, tt)?.x ?? 0);
  const ay = (id: string) => to(t, (tt) => xyAt(id, tt)?.y ?? 0);

  return { ax, ay };
}
