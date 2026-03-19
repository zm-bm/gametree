import { isAnyOf, UnknownAction } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from "chess.js";

import { RootState } from "@/store";
import { startAppListening } from "@/store/listener";
import { nav, tree, ui } from "@/store/slices";
import { selectCurrentId, selectCurrentNode, selectTreeMode, selectTreeNodeMap } from "@/store/selectors";
import { getChildId, getParentId } from "@/shared/lib/id";
import { Id, Move, NormalTree } from "@/shared/types";

type NavResult =
  | { id: Id; fen: string }
  | { expandId: Id };

const getNodeFen = (nodes: NormalTree, id: Id) => {
  return nodes[id]?.move?.after || DEFAULT_POSITION;
};

// Determine the target position and node based on the navigation action and current state
const getNavTarget = (action: UnknownAction, state: RootState): NavResult | undefined => {
  const currentId = selectCurrentId(state);
  const currentNode = selectCurrentNode(state);
  const treeMode = selectTreeMode(state);
  const nodes = selectTreeNodeMap(state);
  const currentNodeData = nodes[currentId] || null;
  const actionType = action.type;

  switch (actionType) {
    case nav.actions.commitMove.type: {
      // Committing a move always navigates to the child node corresponding to that move
      const move = action.payload as Move;
      const id = getChildId(currentId, move);
      const fen = move.after || DEFAULT_POSITION
      return { id, fen };
    }
    
    case nav.actions.navigateToId.type: {
      // Navigating to a specific ID should only update the position if that ID exists in the tree
      const id = action.payload as Id;
      if (!nodes[id]) return undefined;
      const fen = getNodeFen(nodes, id);
      return { id, fen };
    }
    
    case nav.actions.navigateUp.type: {
      // Navigating up moves to the parent node if it exists
      const id = (currentNode?.parent?.data.id as Id | undefined) ?? getParentId(currentId);
      if (id === undefined || id === null || id === currentId || !nodes[id]) return undefined;
      const fen = getNodeFen(nodes, id);
      return { id, fen };
    }
    
    case nav.actions.navigateDown.type: {
      // If the current node is collapsed and has loaded children, expand it instead of navigating
      if (
        treeMode === "compare" &&
        currentNodeData?.collapsed &&
        currentNodeData.childrenLoaded &&
        currentNodeData.children.length > 0
      ) {
        return { expandId: currentNodeData.id };
      }

      // Otherwise, navigate to the first child node (preferably one that has loaded its own children)
      let id: Id | undefined;
      const visibleChildren = currentNode?.children;
      if (visibleChildren?.length) {
        const exploredChild = visibleChildren.find((child) => child.data.childrenLoaded);
        const middleChild = visibleChildren.length % 2
          ? visibleChildren[Math.floor(visibleChildren.length / 2)]
          : visibleChildren[Math.floor(visibleChildren.length / 2 - 1)];
        id = (exploredChild || middleChild)?.data.id;
      } else {
        const childIds = currentNodeData?.children || [];
        if (!childIds.length) return undefined;

        const exploredChildId = childIds.find((childId) => nodes[childId]?.childrenLoaded);
        const middleChildId = childIds.length % 2
          ? childIds[Math.floor(childIds.length / 2)]
          : childIds[Math.floor(childIds.length / 2 - 1)];
        id = exploredChildId || middleChildId;
      }

      if (id === undefined || !nodes[id]) return undefined;
      const fen = getNodeFen(nodes, id);
      return { id, fen };
    }
    
    case nav.actions.navigateNextSibling.type:
    case nav.actions.navigatePrevSibling.type: {
      // Navigating to the next/previous sibling moves to the adjacent node at the same level if it exists
      const siblings = currentNode?.parent?.children?.length
        ? currentNode.parent.children.map((sibling) => sibling.data.id)
        : (() => {
          const parentId = getParentId(currentId);
          if (parentId === null || parentId === currentId) return [] as Id[];
          return nodes[parentId]?.children || [];
        })();

      if (!siblings.length) return undefined;

      const currentIndex = siblings.findIndex((siblingId) => siblingId === currentId);
      if (currentIndex === -1) return undefined;
      
      const isNext = actionType === nav.actions.navigateNextSibling.type;
      const siblingIndex = isNext ? currentIndex + 1 : currentIndex - 1;
      
      if (siblingIndex < 0 || siblingIndex >= siblings.length) return undefined;
      
      const id = siblings[siblingIndex];
      if (!nodes[id]) return undefined;
      const fen = getNodeFen(nodes, id);
      return { id, fen };
    }
    
    default:
      return undefined;
  }
}

// Listen for navigation actions and update the current position and node accordingly
// If navigating down to a collapsed node, expand it instead of navigating
startAppListening({
  matcher: isAnyOf(
    nav.actions.commitMove,
    nav.actions.navigateToId,
    nav.actions.navigateUp,
    nav.actions.navigateDown,
    nav.actions.navigateNextSibling,
    nav.actions.navigatePrevSibling,
  ),
  effect: async (action, listenerApi) => {
    const { dispatch, getState } = listenerApi;
    const state = getState();
    const target = getNavTarget(action, state);

    if (target !== undefined) {
      if ("expandId" in target) {
        dispatch(tree.actions.setNodeCollapsed({ nodeId: target.expandId, value: false }));
        return;
      }

      dispatch(ui.actions.setFen(target.fen));
      dispatch(ui.actions.setCurrent(target.id));
    }
  }
});
