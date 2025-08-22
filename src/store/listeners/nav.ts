import { isAnyOf, UnknownAction } from "@reduxjs/toolkit";

import { RootState } from "../";
import { startAppListening } from "../listener";
import { nav, ui } from "../slices";
import { selectCurrentId, selectCurrentNode } from "../selectors";
import { getChildId } from "../../shared/lib/tree";
import { Id, Move } from "../../shared/types";

const getDestinationNode = (action: UnknownAction, state: RootState): Id | undefined => {
  const currentId = selectCurrentId(state);
  const currentNode = selectCurrentNode(state);
  const actionType = action.type;

  switch (actionType) {
    case nav.actions.commitMove.type:
      return getChildId(currentId, action.payload as Move);
    
    case nav.actions.navigateToId.type:
      return action.payload as Id;
    
    case nav.actions.navigateUp.type:
      return currentNode?.parent?.data.id as Id;
    
    case nav.actions.navigateDown.type: {
      if (!currentNode?.children?.length) return undefined;
      
      const exploredChild = currentNode.children.find(child => child.data.explored);
      const centerChild = currentNode.children[Math.floor(currentNode.children.length / 2)];
      const child = exploredChild || centerChild;
      
      return child?.data.id;
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
      
      return siblings[siblingIndex].data.id;
    }
    
    default:
      return undefined;
  }
}

let lastNavTime = 0;
const NAV_THROTTLE_MS = 333;

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
    const now = Date.now();
    if (now - lastNavTime < NAV_THROTTLE_MS) return;
    lastNavTime = now;

    console.log("Navigation action:", action.type);

    
    const state = getState();
    const destinationId = getDestinationNode(action, state);
    
    if (destinationId !== undefined) {
      dispatch(ui.actions.setCurrent(destinationId));
    }
  }
});
