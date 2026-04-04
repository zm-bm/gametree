import { isAnyOf, isRejectedWithValue } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from "chess.js";

import { createSkeletonGateRegistry } from "../../shared/tree/skeletonGate";
import { findNearestExistingAncestorId } from "../../shared/tree";
import { selectCurrentId, selectCurrentNodeData, selectCurrentVisibleId } from "../selectors";
import { startAppListening } from "../listener";
import { getOpeningsHttpStatus, openingsApi } from "../openingsApi";
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

// Clamp current node to the nearest visible ancestor after tree-shape changes (focus/compare, filters, source)
startAppListening({
  matcher: isAnyOf(
    ui.actions.setTreeSource,
    ui.actions.setTreeMinFrequencyPct,
    ui.actions.setTreeMoveLimit,
    tree.actions.addNodes,
  ),
  effect: async (_action, api) => {
    const { dispatch, getState } = api;
    const state = getState();

    const currentId = selectCurrentId(state);
    if (!currentId) return;

    // Skip while current node is not yet known in the node map (e.g. in-flight fetch)
    const currentNodeData = selectCurrentNodeData(state);
    if (!currentNodeData) return;

    const currentVisibleId = selectCurrentVisibleId(state);
    if (!currentVisibleId || currentVisibleId === currentId) return;

    const nodes = state.tree.nodes;
    const fen = nodes[currentVisibleId]?.move?.after || DEFAULT_POSITION;
    dispatch(ui.actions.setFen(fen));
    dispatch(ui.actions.setCurrent(currentVisibleId));
  },
});

// Guardrail: if an unknown path is set and fetch rejects with a not-found style status, clamp to nearest known ancestor
startAppListening({
  matcher: openingsApi.endpoints.getNodes.matchRejected,
  effect: async (action, api) => {
    if (!isRejectedWithValue(action)) return;

    const status = getOpeningsHttpStatus(action.payload);
    if (status !== 400 && status !== 404) return;

    const { nodeId } = action.meta.arg.originalArgs;
    const { dispatch, getState } = api;
    const state = getState();

    const currentId = selectCurrentId(state);
    if (currentId !== nodeId) return;

    const nodes = state.tree.nodes;
    if (nodes[currentId]) return;

    const clampedId = findNearestExistingAncestorId(nodes, currentId);
    if (!clampedId || clampedId === currentId || !nodes[clampedId]) return;

    const fen = nodes[clampedId]?.move?.after || DEFAULT_POSITION;
    dispatch(ui.actions.setFen(fen));
    dispatch(ui.actions.setCurrent(clampedId));
  },
});
