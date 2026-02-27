import { isAnyOf, UnknownAction } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from "chess.js";

import { RootState } from "@/store";
import { startAppListening } from "@/store/listener";
import { nav, tree, ui } from "@/store/slices";
import { selectCurrentId, selectCurrentNode, selectCurrentNodeData, selectTreeDataNodes, selectTreeSource } from "@/store/selectors";
import { getChildId } from "@/shared/lib/id";
import { Id, Move, TreeSource } from "@/shared/types";

type NavResult =
  | { id: Id; fen: string }
  | { expandId: Id; source: TreeSource };

// Determine the target position and node based on the navigation action and current state
const getNavTarget = (action: UnknownAction, state: RootState): NavResult | undefined => {
  const currentId = selectCurrentId(state);
  const currentNode = selectCurrentNode(state);
  const currentNodeData = selectCurrentNodeData(state);
  const nodes = selectTreeDataNodes(state);
  const source = selectTreeSource(state);
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
      const fen = nodes[id]?.move?.after || DEFAULT_POSITION;
      return { id, fen };
    }
    
    case nav.actions.navigateUp.type: {
      // Navigating up moves to the parent node if it exists
      const id = currentNode?.parent?.data.id as Id;
      if (id === undefined) return undefined;
      const fen = nodes[id]?.move?.after || DEFAULT_POSITION;
      return { id, fen };
    }
    
    case nav.actions.navigateDown.type: {
      // If the current node is collapsed and has loaded children, expand it instead of navigating
      if (
        currentNodeData?.collapsed &&
        currentNodeData.childrenLoaded &&
        currentNodeData.children.length > 0
      ) {
        return { expandId: currentNodeData.id, source };
      }

      // Otherwise, navigate to the first child node (preferably one that has loaded its own children)
      const children = currentNode?.children;
      if (!children?.length) return undefined;
      
      const exploredChild = children.find(child => child.data.childrenLoaded);
      const middleChild = children.length % 2
        ? children[Math.floor(children.length / 2)]
        : children[Math.floor(children.length / 2 - 1)];
      const child = exploredChild || middleChild;

      const id = child?.data.id;
      if (id === undefined) return undefined;
      const fen = nodes[id]?.move?.after || DEFAULT_POSITION;
      return { id, fen };
    }
    
    case nav.actions.navigateNextSibling.type:
    case nav.actions.navigatePrevSibling.type: {
      // Navigating to the next/previous sibling moves to the adjacent node at the same level if it exists
      if (!currentNode?.parent?.children?.length) return undefined;
      
      const siblings = currentNode.parent.children;
      const currentIndex = siblings.findIndex(sibling => sibling.data.id === currentNode.data.id);
      if (currentIndex === -1) return undefined;
      
      const isNext = actionType === nav.actions.navigateNextSibling.type;
      const siblingIndex = isNext ? currentIndex + 1 : currentIndex - 1;
      
      if (siblingIndex < 0 || siblingIndex >= siblings.length) return undefined;
      
      const id = siblings[siblingIndex].data.id;
      const fen = nodes[id]?.move?.after || DEFAULT_POSITION;
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
        dispatch(tree.actions.setNodeCollapsed({ nodeId: target.expandId, source: target.source, value: false }));
        return;
      }

      dispatch(ui.actions.setFen(target.fen));
      dispatch(ui.actions.setCurrent(target.id));
    }
  }
});
