import { createSlice } from "@reduxjs/toolkit";
import { openingsApi } from "./openingsApi";
import { ECO, TreeNode, buildTreeNode } from "../chess";
import eco from '../eco.json'

export const book = eco as ECO[];

export interface TreeState {
  root: TreeNode | null,
}

const initialState: TreeState = {
  root: null
}

const treeSlice = createSlice({
  name: 'tree',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addMatcher(
      openingsApi.endpoints.getOpeningByMoves.matchFulfilled,
      (state, action) => {
        const moves = action.meta.arg.originalArgs;
        const node = buildTreeNode(action.payload, moves);

        if (!state.root) {
          state.root = node
        } else {
          var head = state.root
          for (var i in moves) {
            var child = head.children.find(node => node.attributes.move?.lan === moves[i].lan)
            if (child) {
              head = child
            } else {
              head.children.push(node)
              return
            }
          }
          head.attributes.topGames = node.attributes.topGames
          head.children = node.children
        }
      }
    )
  }
});

export const { } = treeSlice.actions;
export default treeSlice.reducer;
