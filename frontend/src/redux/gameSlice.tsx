import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Move } from 'chess.js';
import { openingsApi } from "./openingsApi";
import { TreeNode, buildTreeNode } from "../chess";

type GotoTarget = {
  index: number
  fen: string
}

export interface GameState {
  // move list
  moves: Move[],
  currentMove: number,
  // openings tree
  root: TreeNode | null,
  currentNode: string
}

const initialState: GameState = {
  moves: [],
  currentMove: 0,
  root: null,
  currentNode: '',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    MAKE_MOVE(state, action: PayloadAction<Move>) {
      if (state.currentMove !== state.moves.length) {
        state.moves = state.moves.slice(0, state.currentMove)
      }
      state.moves.push(action.payload)
      state.currentMove = state.moves.length;
      state.currentNode = state.moves.slice(0, state.currentMove)
                                     .map(m => m.lan)
                                     .join(',');
    },
    GOTO_MOVE(state, action: PayloadAction<GotoTarget>) {
      state.currentMove = action.payload.index;
      state.currentNode = state.moves.slice(0, state.currentMove)
                                     .map(m => m.lan)
                                     .join(',');
    },
    SET_GAME(state, action: PayloadAction<Move[]>) {
      state.moves = action.payload;
      state.currentMove = state.moves.length;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      openingsApi.endpoints.getOpeningByMoves.matchFulfilled,
      (state, action) => {
        const moves = action.meta.arg.originalArgs;
        const node = buildTreeNode(action.payload, moves);

        if (!state.root) {
          state.root = node;
        } else {
          var head = state.root;

          // iterate through moves to find location in tree
          moves.forEach((move, i) => {
            var child = head.children.find(node => node.attributes.move?.lan === move.lan);
            if (child) {
              head = child;
            } else if (i === moves.length - 1) {
              // if last move not found, add it to tree
              head.children.push(node);
              state.currentNode = node.name;
              return;
            } else {
              // path not found, do nothing
              return;
            }
          });

          // update head and add children if none (in case query has been made already)
          head.attributes.topGames = node.attributes.topGames;
          state.currentNode = node.name;
          if (head.children.length === 0)
            head.children = node.children;
        }
      }
    )
  }
});

export const { MAKE_MOVE, GOTO_MOVE, SET_GAME } = gameSlice.actions;
export default gameSlice.reducer;
