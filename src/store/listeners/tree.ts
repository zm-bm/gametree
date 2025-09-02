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
  effect: async (action, listenerApi) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    gates.ensure(key).start(() => {
      listenerApi.dispatch(tree.actions.addLoadingNode({ nodeId, source }));
    });
  },
});

startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchFulfilled,
  effect: async (action, listenerApi) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    const key = gateKey(nodeId, source);

    gates.ensure(key).resolve(() => {
      listenerApi.dispatch(tree.actions.removeLoadingNodes({ nodeId, source }));
      const { lichess, masters } = action.payload;
      if (lichess && masters) {
        listenerApi.dispatch(tree.actions.addNodes({ openingData: lichess, nodeId, source: 'lichess' }));
        listenerApi.dispatch(tree.actions.addNodes({ openingData: masters, nodeId, source: 'masters' }));
      } 
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
        listenerApi.dispatch(tree.actions.removeLoadingNodes({ nodeId, source }));
      });
    }
  },
});

