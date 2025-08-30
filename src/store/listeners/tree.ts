import { startAppListening } from "../listener";
import { openingsApi } from "../openingsApi";
import { tree } from "../slices";

startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchPending,
  effect: async (action, listenerApi) => {
    const { nodeId, source } = action.meta.arg.originalArgs;
    listenerApi.dispatch(tree.actions.addLoadingNode({ nodeId, source }));
  },
});
