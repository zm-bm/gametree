import { useCallback, useEffect, useRef, useState } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { useAppDispatch } from "@/store";
import { nav, ui } from "@/store/slices";
import { TreeViewNode } from "@/types";

const DEFAULT_HOVER_DELAY_MS = 140;

type UseTreeNodeInteractionsInput = {
  node: HierarchyPointNode<TreeViewNode>;
  minimap: boolean;
  hoverDelayMs?: number;
};

type UseTreeNodeInteractionsResult = {
  isNodeHovered: boolean;
  handleNodeClick: () => void;
  handleNodeMouseEnter: () => void;
  handleNodeMouseLeave: () => void;
};

export function useTreeNodeInteractions({
  node,
  minimap,
  hoverDelayMs = DEFAULT_HOVER_DELAY_MS,
}: UseTreeNodeInteractionsInput): UseTreeNodeInteractionsResult {
  const dispatch = useAppDispatch();
  const [isNodeHovered, setIsNodeHovered] = useState(false);
  const hoverDelayTimerRef = useRef<number | null>(null);

  const clearHoverDelay = useCallback(() => {
    if (hoverDelayTimerRef.current !== null) {
      window.clearTimeout(hoverDelayTimerRef.current);
      hoverDelayTimerRef.current = null;
    }
  }, []);

  const handleNodeClick = useCallback(() => {
    if (minimap) return;
    dispatch(nav.actions.navigateToId(node.data.id));
  }, [dispatch, minimap, node.data.id]);

  const handleNodeMouseEnter = useCallback(() => {
    setIsNodeHovered(true);
    if (minimap) return;

    clearHoverDelay();
    hoverDelayTimerRef.current = window.setTimeout(() => {
      dispatch(ui.actions.setHover(node.data.id));
      hoverDelayTimerRef.current = null;
    }, hoverDelayMs);
  }, [clearHoverDelay, dispatch, hoverDelayMs, minimap, node.data.id]);

  const handleNodeMouseLeave = useCallback(() => {
    setIsNodeHovered(false);
    clearHoverDelay();
    if (!minimap) dispatch(ui.actions.setHover(null));
  }, [clearHoverDelay, dispatch, minimap]);

  useEffect(() => {
    return () => {
      clearHoverDelay();
      if (!minimap) dispatch(ui.actions.setHover(null));
    };
  }, [clearHoverDelay, dispatch, minimap]);

  return {
    isNodeHovered,
    handleNodeClick,
    handleNodeMouseEnter,
    handleNodeMouseLeave,
  };
}
