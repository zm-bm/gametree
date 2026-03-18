import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningData, NormalTree, TreeSource } from "@/shared/types";
import { addNodesToTree } from "@/shared/lib/treeState";

interface AddNodes {
  nodeId: Id,
  otb: LcOpeningData,
  online: LcOpeningData,
};

interface SetNodeBoolean {
  nodeId: Id,
  source: TreeSource,
  value: boolean,
};

const selectNodes = (state: TreeState, source: TreeSource): NormalTree => {
  return source === 'online' ? state.onlineNodes : state.otbNodes;
};

interface TreeState {
  otbNodes: NormalTree;
  onlineNodes: NormalTree;
}

const tree = createSlice({
  name: 'tree',
  initialState: {
    otbNodes: {} as NormalTree,
    onlineNodes: {} as NormalTree,
  },
  reducers: {
    addNodes(state, action: PayloadAction<AddNodes>) {
      const { nodeId, otb, online } = action.payload;
      addNodesToTree(state.otbNodes, nodeId, otb);
      addNodesToTree(state.onlineNodes, nodeId, online);
    },

    setNodeLoading(state, action: PayloadAction<SetNodeBoolean>) {
      const { nodeId, source, value } = action.payload;
      const nodes = selectNodes(state, source);
      if (nodeId !== null && nodes[nodeId]) {
        nodes[nodeId].loading = value;
      }
    },

    setNodeCollapsed(state, action: PayloadAction<SetNodeBoolean>) {
      const { nodeId, source, value } = action.payload;
      const nodes = selectNodes(state, source);
      if (nodeId !== null && nodes[nodeId]) {
        nodes[nodeId].collapsed = value;
      }
    },
  },
});

export default tree;
