import { isRejectedWithValue } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from "chess.js";

import { createSkeletonGateRegistry, gateKey } from "@/shared/lib/skeletonGate";
import { selectCurrentId, selectTreeSource } from "@/store/selectors";
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
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);
    const state = api.getState();
    const nodes = state.tree[source === 'lichess' ? 'lichessNodes' : 'mastersNodes'];

    // If the node is already loaded, do nothing
    if (nodes[nodeId] && nodes[nodeId]?.children?.length > 0) return;

    // Start the gate to show the loading state if the request takes too long
    gates.ensure(key).start(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: true }));
    });
  },
});

// Handle successful requests by resolving the gate and removing the loading state
startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchFulfilled,
  effect: async (action, api) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);
    const state = api.getState();
    const nodes = state.tree[source === 'lichess' ? 'lichessNodes' : 'mastersNodes'];

    // If the node is already loaded, do nothing
    if (nodes[nodeId] && nodes[nodeId]?.children?.length > 0) return;

    // Resolve the gate to add the nodes to the tree and hide the loading state
    gates.ensure(key).resolve(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: false }));
      const { lichess, masters } = action.payload;
      if (!lichess || !masters) return;
      api.dispatch(tree.actions.addNodes({ nodeId, lichess, masters }));
    });
  },
});

// Handle rejected requests by removing the loading state
startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchRejected,
  effect: async (action, api) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    // Only handle rejections with value (i.e., actual errors)
    if (!isRejectedWithValue(action)) return;

    // Resolve the gate to hide the loading state
    gates.ensure(key).resolve(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: false }));
    });
  },
});

// Listen for node collapse actions and update the current position if the current node becomes hidden
startAppListening({
  actionCreator: tree.actions.setNodeCollapsed,
  effect: async (action, api) => {
    const { dispatch, getState } = api;
    const { nodeId, source, value } = action.payload;
    if (!value) return;

    const state = getState();
    if (source !== selectTreeSource(state)) return;

    const currentId = selectCurrentId(state);
    if (!currentId || currentId === nodeId) return;

    const isHiddenByCollapse = currentId.startsWith(`${nodeId},`);
    if (!isHiddenByCollapse) return;

    const nodes = source === 'lichess' ? state.tree.lichessNodes : state.tree.mastersNodes;
    const fen = nodes[nodeId]?.move?.after || DEFAULT_POSITION;
    dispatch(ui.actions.setFen(fen));
    dispatch(ui.actions.setCurrent(nodeId));
  },
});
