import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { buildTreeNode } from "../lib/chess";
import { Move, LichessOpenings, TreeNode } from "../types/chess";
import { TreeSource } from "./openingsApi";

interface AddOpeningsArgs {
  openings: LichessOpenings,
  moves: Move[],
}

export interface TreeState {
  root: TreeNode | null,
  source: TreeSource ,
  minFrequency: number,
  minWinRate: number,
}

export const initialState: TreeState = {
  root: null,
  source: 'masters',
  minFrequency: 0.5,
  minWinRate: 10,
};

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    SetMinFrequency(state, action: PayloadAction<number>) {
      state.minFrequency = action.payload;
    },
    SetMinWinRate(state, action: PayloadAction<number>) {
      state.minWinRate = action.payload;
    },
    /**
     * Add an openings node to the tree
     * 
     * @param state 
     * @param {LichessOpenings} action.payload.openings - lichess openings
     * @param {Move[]} action.payload.moves - move list defining the position of the openings
     */
    AddOpenings(state, action: PayloadAction<AddOpeningsArgs>) {
      const { moves, openings } = action.payload;
      const node = buildTreeNode(openings, moves);

      if (!state.root) {
        // if tree is empty
        state.root = node;
      } else {
        let cur = state.root;

        // iterate through moves to find location in tree
        moves.forEach((move, i) => {
          const child = cur.children.find(node => node.attributes.move?.lan === move.lan);
          if (child) {
            cur = child;
          } else if (i === moves.length - 1) {
            // if last move not found, add it to tree
            cur.children.push(node);
            return;
          } else {
            // path not found, do nothing
            return;
          }
        });

        // update head and add children if none (in case query has been made already)
        cur.attributes.topGames = node.attributes.topGames;
        if (cur.children.length === 0) {
          cur.children = node.children;
        }
      }
    },

    /**
     * Change the openings data source key
     * 
     * @param state 
     * @param {TreeSource} action.payload 
     */
    SetDataSource(state, action: PayloadAction<TreeSource>) {
      state.source = action.payload;
      state.root = null;
    },
  },
});

export type TreeAction = ReturnType<
  typeof treeSlice.actions[keyof typeof treeSlice.actions]
>;
export const { SetDataSource, AddOpenings } = treeSlice.actions;
export default treeSlice.reducer;
