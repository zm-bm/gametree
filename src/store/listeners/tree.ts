import { isRejectedWithValue } from "@reduxjs/toolkit";

import { createSkeletonGateRegistry, gateKey } from "@/shared/lib/skeletonGate";
import { startAppListening } from "../listener";
import { openingsApi } from "../openingsApi";
import { tree } from "../slices";

const gates = createSkeletonGateRegistry({
  showAfterMs: 150,
  minVisibleMs: 250,
});

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

startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchRejected,
  effect: async (action, api) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    // Only handle rejections with value (i.e., actual errors
    if (!isRejectedWithValue(action)) return;

    // Resolve the gate to hide the loading state
    gates.ensure(key).resolve(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: false }));
    });
  },
});
