import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningData, NormalTree, TreeSource } from "@/shared/types";
import { buildNodes } from "@/shared/lib/tree";
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

const tree = createSlice({
  name: 'tree',
  initialState: {
    loadingId: null as Id | null,
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

      // update parent node with new child
      const parentId = getParentId(nodeId);
      if (parentId && nodes[parentId] && !nodes[parentId].children.includes(nodeId)) {
        nodes[parentId].children.push(nodeId);
      }

      // remove loading node
      if (state.loadingId && nodes[state.loadingId]) {
        nodes[state.loadingId].children
          = nodes[state.loadingId].children.filter(id => !id.startsWith('loading'));
      }
      state.loadingId = null;
    },

    addLoadingNode(state, action: PayloadAction<AddLoadingNode>) {
      const { nodeId, source } = action.payload;
      if (!nodeId) return;
      const nodes = source === 'lichess'
        ? state.lichessNodes
        : state.mastersNodes;

      if (state.loadingId && nodes[state.loadingId]) {
        nodes[state.loadingId].children
          = nodes[state.loadingId].children.filter(id => id.startsWith('loading'));
      }

      state.loadingId = nodeId;
      if (nodes[nodeId]) {
        nodes[nodeId].children.push('loading1');
        nodes[nodeId].children.push('loading2');
        nodes[nodeId].children.push('loading3');
      }

      nodes['loading1'] = {
        id: 'loading1',
        explored: true,
        loading: true,
        move: null,
        white: 0,
        draws: 0,
        black: 0,
        topGames: [],
        opening: null,
        children: [],
      };
      nodes['loading2'] = {
        id: 'loading2',
        explored: true,
        loading: true,
        move: null,
        white: 0,
        draws: 0,
        black: 0,
        topGames: [],
        opening: null,
        children: [],
      };
      nodes['loading3'] = {
        id: 'loading3',
        explored: true,
        loading: true,
        move: null,
        white: 0,
        draws: 0,
        black: 0,
        topGames: [],
        opening: null,
        children: [],
      };
    },
  },
});

export default tree;
