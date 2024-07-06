import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { buildTreeNode } from "../chess";
import { LichessOpenings, TreeNode } from "../types/chess";
import { TreeSource } from "./openingsApi";
import { Move } from "chess.js";

interface AddOpeningsArgs {
  openings: LichessOpenings,
  moves: Move[],
}

export interface TreeState {
  root: TreeNode | null,
  source: TreeSource ,
}

const initialState: TreeState = {
  root: null,
  source: 'masters',
};

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {
    SET_SOURCE(state, action: PayloadAction<TreeSource>) {
      state.source = action.payload;
      state.root = null;
    },
    ADD_OPENINGS(state, action: PayloadAction<AddOpeningsArgs>) {
      const { moves, openings } = action.payload;

      // build tree
      const node = buildTreeNode(openings, moves);
      if (!state.root) {
        state.root = node;
      } else {
        let head = state.root;

        // iterate through moves to find location in tree
        moves.forEach((move, i) => {
          const child = head.children.find(node => node.attributes.move?.lan === move.lan);
          if (child) {
            head = child;
          } else if (i === moves.length - 1) {
            // if last move not found, add it to tree
            head.children.push(node);
            return;
          } else {
            // path not found, do nothing
            return;
          }
        });

        // update head and add children if none (in case query has been made already)
        head.attributes.topGames = node.attributes.topGames;
        if (head.children.length === 0) {
          head.children = node.children;
        }
      }
    }
  },
});

export type TreeAction = ReturnType<typeof treeSlice.actions[keyof typeof treeSlice.actions]>;
export const { SET_SOURCE, ADD_OPENINGS } = treeSlice.actions;
export default treeSlice.reducer;
