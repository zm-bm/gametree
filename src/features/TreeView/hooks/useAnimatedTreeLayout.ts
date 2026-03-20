import { useCallback, useEffect, useMemo, useRef } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { useSpring, to } from "react-spring";

import { TreeViewNode } from "@/shared/types";

type XY = { x: number; y: number };
type XYMap = Map<string, XY>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const POSITION_EPSILON = 1e-6;
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function arePositionMapsEqual(a: XYMap, b: XYMap) {
  if (a.size !== b.size) return false;

  for (const [nodeId, posA] of a) {
    const posB = b.get(nodeId);
    if (!posB) return false;

    if (
      Math.abs(posA.x - posB.x) > POSITION_EPSILON ||
      Math.abs(posA.y - posB.y) > POSITION_EPSILON
    ) {
      return false;
    }
  }

  return true;
}

function rebaseInFlightPositions(
  fromPositions: XYMap,
  toPositions: XYMap,
  incomingPositions: XYMap,
  progress: number,
) {
  const rebasedPositions: XYMap = new Map();
  const ids = new Set<string>([
    ...fromPositions.keys(),
    ...toPositions.keys(),
    ...incomingPositions.keys(),
  ]);

  ids.forEach((nodeId) => {
    const from = fromPositions.get(nodeId);
    const to = toPositions.get(nodeId);

    if (from && to) {
      rebasedPositions.set(nodeId, {
        x: lerp(from.x, to.x, progress),
        y: lerp(from.y, to.y, progress),
      });
      return;
    }

    if (to) {
      rebasedPositions.set(nodeId, to);
      return;
    }

    if (from) {
      rebasedPositions.set(nodeId, from);
    }
  });

  return rebasedPositions;
}

export function useAnimatedTreeLayout(
  nodes: HierarchyPointNode<TreeViewNode>[]
) {
  const prevPositionsRef = useRef<XYMap>(new Map());
  const nextPositionsRef = useRef<XYMap>(new Map());
  const pendingUpdateRef = useRef<XYMap | null>(null);
  const progressRef = useRef(1);

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
    config: { tension: 300, friction: 30, clamp: true },
    onChange: ({ value }) => {
      const nextProgress = (value as { t?: number }).t;
      if (typeof nextProgress === "number") {
        progressRef.current = nextProgress;
      }
    },
    onRest: ({ cancelled }) => {
      if (cancelled) return;

      // Update prev positions when animation completes
      if (pendingUpdateRef.current) {
        prevPositionsRef.current = new Map(pendingUpdateRef.current);
        pendingUpdateRef.current = null;
      }
      progressRef.current = 1;
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
    const incomingPositions = new Map(nextPositions);

    // If an animation is in-flight, capture its currently rendered positions
    // and use those as the new animation baseline. This prevents replaying the
    // previous transition when updates arrive rapidly.
    const fromPositions = prevPositionsRef.current;
    const toPositions = nextPositionsRef.current;
    const progress = clamp01(progressRef.current);
    const hasPendingAnimation = pendingUpdateRef.current !== null;
    const hasInFlightAnimation = toPositions.size > 0 && hasPendingAnimation;

    if (!hasInFlightAnimation && arePositionMapsEqual(incomingPositions, toPositions)) {
      // Ignore no-op updates (same target layout), which otherwise restart
      // animation and create visible replay/jitter.
      prevPositionsRef.current = new Map(toPositions);
      pendingUpdateRef.current = null;
      progressRef.current = 1;
      return;
    }

    if (hasInFlightAnimation) {
      prevPositionsRef.current = rebaseInFlightPositions(
        fromPositions,
        toPositions,
        incomingPositions,
        progress,
      );
    }

    nextPositionsRef.current = incomingPositions;
    pendingUpdateRef.current = new Map(incomingPositions);

    // Restart interpolation from the rebased baseline to the newest layout.
    api.stop();
    progressRef.current = 0;
    api.start({ from: { t: 0 }, to: { t: 1 }, immediate: false });
  }, [nextPositions, api]);

  // Animated x/y accessors
  const ax = useCallback((id: string) => {
    return to(t, (tt) => xyAt(id, tt)?.x ?? 0);
  }, [t, xyAt]);

  const ay = useCallback((id: string) => {
    return to(t, (tt) => xyAt(id, tt)?.y ?? 0);
  }, [t, xyAt]);

  return { ax, ay };
}
