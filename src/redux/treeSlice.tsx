import { PayloadAction, createSelector, createSlice } from "@reduxjs/toolkit";

import { pathId } from "../lib/chess";
import { LcOpeningStats, MovePath, NormalNodeData, TreeSource } from "../types/chess";
import { RootState } from "../store";
import { buildTree, processChildNodes } from "../lib/tree";

interface AddOpeningsArgs {
  openingStats: LcOpeningStats,
  path: MovePath,
  source: TreeSource,
}

export interface TreeState {
  lichessNodes: Record<string, NormalNodeData>, // indexed by path
  mastersNodes: Record<string, NormalNodeData>, // indexed by path
  source: TreeSource,
  minFrequency: number,
}

export const initialState: TreeState = {
  lichessNodes: {},
  mastersNodes: {},
  source: 'lichess',
  minFrequency: 2,
};

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    SetMinFrequency(state, action: PayloadAction<number>) {
      state.minFrequency = action.payload;
    },

    SetDataSource(state, action: PayloadAction<TreeSource>) {
      state.source = action.payload;
    },

    AddOpenings(state, action: PayloadAction<AddOpeningsArgs>) {
      const { path, openingStats, source } = action.payload;
      const id = pathId(path);
      const move = path.at(-1) || null;
      const nodes = source === 'lichess' ? state.lichessNodes : state.mastersNodes;
      const node = nodes[id];
      const children = processChildNodes(nodes, path, move, openingStats.moves);

      if (node) {
        // update existing node
        nodes[id] = {
          ...node,
          explored: true,
          topGames: openingStats.topGames,
          opening: openingStats.opening,
          children: [...new Set([...node.children, ...children])],
        };
      } else {
        // add new node
        nodes[id] = {
          id,
          explored: true,
          move: path.at(-1) || null,
          white: openingStats.white,
          draws: openingStats.draws,
          black: openingStats.black,
          averageRating: 0,
          topGames: openingStats.topGames,
          opening: openingStats.opening,
          children,
        };

        // update parent node with new child
        if (path.length > 1) {
          const parent = path.slice(0, -1);
          const parentId = pathId(parent);
          nodes[parentId]?.children.push(id);
        }
      }
    },
  },
});

export const selectDataSource = (state: RootState) => state.tree.source;
export const selectMinFrequency = (state: RootState) => state.tree.minFrequency;
export const selectLichessNodes = (state: RootState) => state.tree.lichessNodes;
export const selectMastersNodes = (state: RootState) => state.tree.mastersNodes;

export const selectTreeRoot = createSelector(
  [selectLichessNodes, selectMastersNodes, selectDataSource, selectMinFrequency],
  (lichessNodes, mastersNodes, source, minFrequency) => {
    const nodes = source === 'lichess' ? lichessNodes : mastersNodes;
    return buildTree(nodes, '', minFrequency);
  }
);

export type TreeAction = ReturnType<
  typeof treeSlice.actions[keyof typeof treeSlice.actions]
>;
export const { SetMinFrequency, SetDataSource, AddOpenings } = treeSlice.actions;
export default treeSlice.reducer;
