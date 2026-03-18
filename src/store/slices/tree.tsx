import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { OpeningTotals, Id, NormalTree } from "@/shared/types";
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
    nodes: {} as NormalTree,
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

    setNodeCollapsed(state, action: PayloadAction<SetNodeBoolean>) {
      const { nodeId, value } = action.payload;
      if (nodeId !== null && state.nodes[nodeId]) {
        state.nodes[nodeId].collapsed = value;
      }
    },
  },
});

export default tree;
