import { isRejectedWithValue } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from "chess.js";

import { createSkeletonGateRegistry } from "@/shared/lib/skeletonGate";
import { selectCurrentId } from "@/store/selectors";
import { startAppListening } from "../listener";
import { openingsApi } from "../openingsApi";
import { tree, ui } from "../slices";

const gates = createSkeletonGateRegistry({
  showAfterMs: 150,
  minVisibleMs: 250,
});

// Handle pending requests by starting the gate to show the loading state
startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchPending,
  effect: async (action, api) => {
    const { nodeId } = action.meta.arg.originalArgs;
    const gateKey = nodeId;
    const state = api.getState();
    const nodes = state.tree.nodes;

    // If the node is already loaded, do nothing
    if (nodes[nodeId] && nodes[nodeId]?.children?.length > 0) return;

    // Start the gate to show the loading state if the request takes too long
    gates.ensure(gateKey).start(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, value: true }));
    });
  },
});

// Handle successful requests by resolving the gate and removing the loading state
startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchFulfilled,
  effect: async (action, api) => {
    const { nodeId } = action.meta.arg.originalArgs;
    const gateKey = nodeId;
    const state = api.getState();
    const nodes = state.tree.nodes;

    // If the node is already loaded, do nothing
    if (nodes[nodeId] && nodes[nodeId]?.children?.length > 0) return;

    // Resolve the gate to add the nodes to the tree and hide the loading state
    gates.ensure(gateKey).resolve(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, value: false }));
      api.dispatch(tree.actions.addNodes({ nodeId, openingData: action.payload }));
    });
  },
});

// Handle rejected requests by removing the loading state
startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchRejected,
  effect: async (action, api) => {
    const { nodeId } = action.meta.arg.originalArgs;
    const gateKey = nodeId;

    // Only handle rejections with value (i.e., actual errors)
    if (!isRejectedWithValue(action)) return;

    // Resolve the gate to hide the loading state
    gates.ensure(gateKey).resolve(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, value: false }));
    });
  },
});

// Listen for node collapse actions and update the current position if the current node becomes hidden
startAppListening({
  actionCreator: tree.actions.setNodeCollapsed,
  effect: async (action, api) => {
    const { dispatch, getState } = api;
    const { nodeId, value } = action.payload;
    if (!value) return;

    const state = getState();

    const currentId = selectCurrentId(state);
    if (!currentId || currentId === nodeId) return;

    const isHiddenByCollapse = currentId.startsWith(`${nodeId},`);
    if (!isHiddenByCollapse) return;

    const nodes = state.tree.nodes;
    const fen = nodes[nodeId]?.move?.after || DEFAULT_POSITION;
    dispatch(ui.actions.setFen(fen));
    dispatch(ui.actions.setCurrent(nodeId));
  },
});
