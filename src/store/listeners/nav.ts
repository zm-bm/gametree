import { isAnyOf, UnknownAction } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from "chess.js";

import { RootState } from "@/store";
import { startAppListening } from "@/store/listener";
import { nav, ui } from "@/store/slices";
import { selectCurrentId, selectCurrentNode, selectTreeDataNodes } from "@/store/selectors";
import { getChildId } from "@/shared/lib/id";
import { Id, Move } from "@/shared/types";

const getNavTarget = (action: UnknownAction, state: RootState) => {
  const currentId = selectCurrentId(state);
  const currentNode = selectCurrentNode(state);
  const nodes = selectTreeDataNodes(state);
  const actionType = action.type;

  switch (actionType) {
    case nav.actions.commitMove.type: {
      const move = action.payload as Move;
      const id = getChildId(currentId, move);
      const fen = move.after || DEFAULT_POSITION
      return { id, fen };
    }
    
    case nav.actions.navigateToId.type: {
      const id = action.payload as Id;
      const fen = nodes[id]?.move?.after || DEFAULT_POSITION;
      return { id, fen };
    }
    
    case nav.actions.navigateUp.type: {
      const id = currentNode?.parent?.data.id as Id;
      if (id === undefined) return undefined;
      const fen = nodes[id]?.move?.after || DEFAULT_POSITION;
      return { id, fen };
    }
    
    case nav.actions.navigateDown.type: {
      const children = currentNode?.children;
      if (!children?.length) return undefined;
      
      const exploredChild = children.find(child => child.data.explored);
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
      dispatch(ui.actions.setFen(target.fen));
      dispatch(ui.actions.setCurrent(target.id));
    }
  }
});
