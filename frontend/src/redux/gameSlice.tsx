import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Move } from 'chess.js';
import { openingsApi } from "./openingsApi";
import { MoveNode, TreeNode, buildTreeNode } from "../chess";
import { RootState } from '../store';

type GotoTarget = {
  key: number
  fen: string
}

export interface GameState {
  moveTree: MoveNode[],
  currentMove: number,
  root: TreeNode | null,
}

export const rootNode = {
  key: 0,
  move: null,
  parent: null,
  children: [],
}
const initialState: GameState = {
  moveTree: [rootNode],
  currentMove: 0,
  root: null,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    MAKE_MOVE(state, action: PayloadAction<Move>) {
      const prev = state.moveTree[state.currentMove];
      const existingKey = prev.children.find(
        ix => state.moveTree[ix].move?.lan === action.payload.lan
      )

      // update move tree
      if (existingKey === undefined) {
        // if new move, add to move tree + update key
        const key = state.moveTree.length
        prev.children.push(key)
        state.moveTree.push({
          key,
          move: action.payload,
          parent: state.currentMove,
          children: [],
        })
        state.currentMove = key
      } else {
        // if previously made move, update key
        state.currentMove = existingKey
      }
    },
    GOTO_MOVE(state, action: PayloadAction<GotoTarget>) {
      state.currentMove = action.payload.key;
    },
    GOTO_PATH(state, action: PayloadAction<Move[]>) {
      const { moveTree } = state;
      var parent = 0;
      for (var move of action.payload) {
        var child = moveTree[parent].children.find(ix => moveTree[ix].move?.lan === move.lan)
        if (child) {
          parent = child;
        } else {
          const key = state.moveTree.length;
          moveTree[parent].children.push(key)
          state.moveTree.push({
            key,
            move,
            parent,
            children: [],
          })
          state.currentMove = key
          return;
        }
      }
      state.currentMove = parent;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      openingsApi.endpoints.getOpeningByMoves.matchFulfilled,
      (state, action) => {
        // update moves / current move
        const moves = action.meta.arg.originalArgs;

        // build tree
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
              return;
            } else {
              // path not found, do nothing
              return;
            }
          });

          // update head and add children if none (in case query has been made already)
          head.attributes.topGames = node.attributes.topGames;
          if (head.children.length === 0)
            head.children = node.children;
        }
      }
    )
  }
});

const selectMoveTree = (state: RootState) => state.game.moveTree;
const selectCurrentMove = (state: RootState) => state.game.currentMove;

export const selectMovesList = createSelector(
  [selectMoveTree, selectCurrentMove],
  (moveTree, currentMove) => {
    const moves: Move[] = [];
    let current = moveTree[currentMove];
    while (current.move !== null && current.parent !== null) {
      moves.unshift(current.move)
      current = moveTree[current.parent]
    }
    return moves;
  }
)


export const { MAKE_MOVE, GOTO_MOVE, GOTO_PATH } = gameSlice.actions;
export default gameSlice.reducer;
