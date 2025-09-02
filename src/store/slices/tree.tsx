import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningData, NormalTree, TreeSource } from "@/shared/types";
import { buildNodes, getLoadingNode } from "@/shared/lib/tree";
import { getParentId } from "@/shared/lib/id";

interface AddNodes {
  openingData: LcOpeningData,
  nodeId: Id,
  source: TreeSource,
};

interface AddLoadingNode {
  nodeId: Id,
  source: TreeSource,
};

const makeLoadingId = (parentId: string, i: number) => `loading:${parentId}:${i}`;

const tree = createSlice({
  name: 'tree',
  initialState: {
    lichessNodes: {} as NormalTree,
    mastersNodes: {} as NormalTree,
  },
  reducers: {
    addNodes(state, action: PayloadAction<AddNodes>) {
      const { nodeId, openingData, source } = action.payload;
      const nodes = source === 'lichess'
        ? state.lichessNodes
        : state.mastersNodes;

      // build and add new nodes to tree
      const newNodes = buildNodes(nodes, nodeId, openingData);
      for (const node of newNodes) {
        nodes[node.id] = node;
      }

      // update parent node and remove any loading placeholders
      const parentId = getParentId(nodeId);
      if (parentId && nodes[parentId]) {
        if (!nodes[parentId].children.includes(nodeId)) {
          nodes[parentId].children.push(nodeId);
        }
        nodes[parentId].children = nodes[parentId].children.filter(
          (id) => !id.startsWith(`loading:${parentId}:`)
        );
        Object.keys(nodes).forEach((id) => {
          if (id.startsWith(`loading:${parentId}:`)) delete nodes[id];
        });
      }
    },

    addLoadingNode(state, action: PayloadAction<AddLoadingNode>) {
      const { nodeId: parentId, source } = action.payload;
      const nodes = source === 'lichess'
        ? state.lichessNodes
        : state.mastersNodes;
      if (!parentId || !nodes[parentId]) return;

      // render 3 placeholder loading nodes
      const count = 3;
      for (let i = 1; i <= count; i++) {
        const id = makeLoadingId(parentId, i);
        nodes[id] = getLoadingNode(id);

        if (!nodes[parentId].children.includes(id)) {
          nodes[parentId].children.push(id);
        }
      }
    },

    removeLoadingNodes(state, action: PayloadAction<AddLoadingNode>) {
      const { nodeId: parentId, source } = action.payload;
      const nodes = source === 'lichess'
        ? state.lichessNodes
        : state.mastersNodes;
      if (!parentId || !nodes[parentId]) return;

      nodes[parentId].children = nodes[parentId].children.filter(
        (id) => !id.startsWith(`loading:${parentId}:`)
      );

      Object.keys(nodes).forEach((id) => {
        if (id.startsWith(`loading:${parentId}:`)) delete nodes[id];
      });
    },
  },
});

export default tree;
