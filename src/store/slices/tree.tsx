import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { Id, LcOpeningStats, NormalNodeData, TreeSource } from "../../shared/types";
import { getMove, getParentId, processChildNodes } from "../../shared/lib/tree";

interface AddOpeningsArgs {
  openingStats: LcOpeningStats,
  nodeId: Id,
  source: TreeSource,
}

const tree = createSlice({
  name: 'tree',
  initialState: {
    lichessNodes: {} as Record<Id, NormalNodeData>,
    mastersNodes: {} as Record<Id, NormalNodeData>,
  },
  reducers: {
    addOpenings(state, action: PayloadAction<AddOpeningsArgs>) {
      const { nodeId, openingStats, source } = action.payload;
      const nodes = source === 'lichess' ? state.lichessNodes : state.mastersNodes;
      const node = nodes[nodeId];
      const children = processChildNodes(nodes, nodeId, openingStats.moves);

      if (node) {
        // update existing node
        nodes[nodeId] = {
          ...node,
          explored: true,
          topGames: openingStats.topGames,
          opening: openingStats.opening,
          children: [...new Set([...node.children, ...children])],
        };
      } else {
        // add new node
        nodes[nodeId] = {
          id: nodeId,
          explored: true,
          move: getMove(nodeId),
          white: openingStats.white,
          draws: openingStats.draws,
          black: openingStats.black,
          averageRating: 0,
          topGames: openingStats.topGames,
          opening: openingStats.opening,
          children,
        };

        // update parent node with new child
        const parentId = getParentId(nodeId);
        if (parentId) {
          nodes[parentId]?.children.push(nodeId);
        }
      }
    },
  },
});

export default tree;
