import { useCallback, useEffect, useMemo, useRef } from "react";
import { HierarchyPointNode } from "d3-hierarchy";
import { useSpring, to } from "react-spring";

import { TreeNodeData } from "@/shared/types";

type XY = { x: number; y: number };
type XYMap = Map<string, XY>;

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function useAnimatedTreeLayout(
  nodes: HierarchyPointNode<TreeNodeData>[],
  nodeSize: [number, number],
  minimap: boolean
) {

  // Lookup for parent ids (for enter origin)
  const parentOfNext = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of nodes) {
      if (n.parent) m.set(n.data.id, n.parent.data.id);
    }
    return m;
  }, [nodes]);

  // Previous and next layout maps (id → xy)
  const prevRef = useRef<XYMap>(new Map());
  const nextRef = useRef<XYMap>(
    new Map(nodes.map(n => [n.data.id, { x: n.x, y: n.y }]))
  );

  // Shared spring for animation
  const [{ t }, api] = useSpring(() => ({
    t: 1,
    config: { tension: 200, friction: 26 },
    immediate: minimap,
  }));

  // Interpolates position for a node id at time t
  const xyAt = useCallback(
    (id: string, tt: number): XY | undefined => {
      const prev = prevRef.current.get(id);
      const next = nextRef.current.get(id);
      if (prev && next) {
        return { x: lerp(prev.x, next.x, tt), y: lerp(prev.y, next.y, tt) };
      }
      if (!next) return prev;
      const pid = parentOfNext.get(id);
      const pPrev = pid ? prevRef.current.get(pid) : undefined;
      const pNext = pid ? nextRef.current.get(pid) : undefined;
      const from = pPrev || pNext || next;
      return { x: lerp(from.x, next.x, tt), y: lerp(from.y, next.y, tt) };
    },
    [parentOfNext]
  );

  // Update layout and animate on node changes
  useEffect(() => {
    const tNow = t.get();
    const ids = new Set<string>([
      ...Array.from(prevRef.current.keys()),
      ...Array.from(nextRef.current.keys()),
      ...nodes.map(n => n.data.id),
    ]);
    const newPrev: XYMap = new Map();
    for (const id of ids) {
      const cur = xyAt(id, tNow);
      if (cur) newPrev.set(id, cur);
    }
    prevRef.current = newPrev;
    nextRef.current = new Map(nodes.map(n => [n.data.id, { x: n.x, y: n.y }]));
    api.start({ from: { t: 0 }, to: { t: 1 }, immediate: minimap });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, nodeSize, api, minimap]);

  // Animated x/y accessors
  const ax = (id: string) => to(t, (tt) => xyAt(id, tt)?.x ?? 0);
  const ay = (id: string) => to(t, (tt) => xyAt(id, tt)?.y ?? 0);

  return { ax, ay };
}
