import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningData, NormalTree, TreeSource } from "@/shared/types";
import { buildNodes } from "@/shared/lib/tree";
import { getParentId } from "@/shared/lib/id";

interface AddNodes {
  openingData: LcOpeningData,
  nodeId: Id,
  source: TreeSource,
}

// interface AddNodes {
//   nodes: NormalNodeData[],
//   source: TreeSource,
// };

const tree = createSlice({
  name: 'tree',
  initialState: {
    lichessNodes: {} as NormalTree,
    mastersNodes: {} as NormalTree,
  },
  reducers: {
    // addNodes(state, action: PayloadAction<AddNodes>) {
    //   const { nodes, source } = action.payload;
    //   const target = source === 'lichess' ? state.lichessNodes : state.mastersNodes;
    //   for (const node of nodes) {
    //     target[node.id] = node;
    //   }
    // },

    addNodes(state, action: PayloadAction<AddNodes>) {
      const { nodeId, openingData, source } = action.payload;
      const nodes = source === 'lichess'
        ? state.lichessNodes
        : state.mastersNodes;

      const newNodes = buildNodes(nodes, nodeId, openingData);
      for (const node of newNodes) {
        nodes[node.id] = node;
      }

      // update parent node with new child
      const parentId = getParentId(nodeId);
      if (parentId !== null && nodes[parentId] && !nodes[parentId].children.includes(nodeId)) {
        nodes[parentId].children.push(nodeId);
      }
    },
  },
});

export default tree;
