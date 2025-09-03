import { isRejectedWithValue } from "@reduxjs/toolkit";

import { createSkeletonGateRegistry, gateKey } from "@/shared/lib/skeletonGate";
import { startAppListening } from "../listener";
import { openingsApi } from "../openingsApi";
import { tree } from "../slices";

const gates = createSkeletonGateRegistry({
  showAfterMs: 150,
  minVisibleMs: 500,
});

startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchPending,
  effect: async (action, api) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    gates.ensure(key).start(() => {
      api.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: true }));
    });
  },
});

startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchFulfilled,
  effect: async (action, listenerApi) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    gates.ensure(key).resolve(() => {
      listenerApi.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: false }));
      const { lichess, masters } = action.payload;
      if (!lichess || !masters) return;
      listenerApi.dispatch(tree.actions.addNodes({ nodeId, lichess, masters }));
    });
  },
});

startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchRejected,
  effect: async (action, listenerApi) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    if (isRejectedWithValue(action)) {
      gates.ensure(key).resolve(() => {
        listenerApi.dispatch(tree.actions.setNodeLoading({ nodeId, source, value: false }));
      });
    }
  },
});
