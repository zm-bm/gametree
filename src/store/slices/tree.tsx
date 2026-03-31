import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { OpeningTotals, Id, TreeStore } from "@/shared/types";
import { addNodesToTree } from "@/shared/lib/treeState";

interface AddNodes {
  nodeId: Id,
  openingData: OpeningTotals,
};

interface SetNodeBoolean {
  nodeId: Id,
  value: boolean,
};

const tree = createSlice({
  name: 'tree',
  initialState: {
    nodes: {} as TreeStore,
    pinnedNodes: [] as Id[],
    lastVisitedChildByParent: {} as Record<Id, Id>,
  },
  reducers: {
    addNodes(state, action: PayloadAction<AddNodes>) {
      const { nodeId, openingData } = action.payload;
      addNodesToTree(state.nodes, nodeId, openingData);
    },

    setNodeLoading(state, action: PayloadAction<SetNodeBoolean>) {
      const { nodeId, value } = action.payload;
      if (nodeId !== null && state.nodes[nodeId]) {
        state.nodes[nodeId].loading = value;
      }
    },

    toggleNodePinned(state, action: PayloadAction<Id>) {
      const nodeId = action.payload;
      const pinnedIndex = state.pinnedNodes.indexOf(nodeId);

      if (pinnedIndex === -1) {
        state.pinnedNodes.push(nodeId);
        return;
      }

      state.pinnedNodes.splice(pinnedIndex, 1);
    },

    setLastVisitedChild(state, action: PayloadAction<{ parentId: Id; childId: Id }>) {
      const { parentId, childId } = action.payload;
      state.lastVisitedChildByParent[parentId] = childId;
    },
  },
});

export default tree;
