import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningData, NormalTree, TreeSource } from "@/shared/types";
import { addNodesToTree } from "@/shared/lib/treeState";

interface AddNodes {
  nodeId: Id,
  lichess: LcOpeningData,
  masters: LcOpeningData,
};

interface SetNodeBoolean {
  nodeId: Id,
  source: TreeSource,
  value: boolean,
};

const selectNodes = (state: TreeState, source: TreeSource): NormalTree => {
  return source === 'lichess' ? state.lichessNodes : state.mastersNodes;
};

interface TreeState {
  lichessNodes: NormalTree;
  mastersNodes: NormalTree;
}

const tree = createSlice({
  name: 'tree',
  initialState: {
    lichessNodes: {} as NormalTree,
    mastersNodes: {} as NormalTree,
  },
  reducers: {
    addNodes(state, action: PayloadAction<AddNodes>) {
      const { nodeId, lichess, masters } = action.payload;
      addNodesToTree(state.lichessNodes, nodeId, lichess);
      addNodesToTree(state.mastersNodes, nodeId, masters);
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
