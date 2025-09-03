import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningData, NormalTree, TreeSource } from "@/shared/types";
import { buildNodes } from "@/shared/lib/tree";
import { getParentId } from "@/shared/lib/id";

interface AddNodes {
  nodeId: Id,
  lichess: LcOpeningData,
  masters: LcOpeningData,
};

interface SetNodeLoading {
  nodeId: Id,
  source: TreeSource,
  value: boolean,
};

// Helper to get nodes object based on source
const selectNodes = (state: TreeState, source: TreeSource): NormalTree => {
  return source === 'lichess' ? state.lichessNodes : state.mastersNodes;
};

// Helper to add new nodes to the tree
const addNodesToTree = (nodes: NormalTree, nodeId: Id, openingData: LcOpeningData) => {
  // Build and add new nodes to tree
  const newNodes = buildNodes(nodes, nodeId, openingData);
  for (const node of newNodes) {
    nodes[node.id] = node;
  }

  // Update parent node
  const parentId = getParentId(nodeId);
  if (parentId && nodes[parentId]) {
    if (!nodes[parentId].children.includes(nodeId)) {
      nodes[parentId].children.push(nodeId);
    }
  }
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

    setNodeLoading(state, action: PayloadAction<SetNodeLoading>) {
      const { nodeId, source, value } = action.payload;
      const nodes = selectNodes(state, source);
      if (nodeId !== null && nodes[nodeId]) {
        nodes[nodeId].loading = value;
      }
    },
  },
});

export default tree;
