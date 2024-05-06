import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Move } from 'chess.js';
import { MoveNode } from "../chess";
import { RootState } from '../store';
import { SET_SOURCE } from './treeSlice';

type GotoTarget = {
  key: number
  fen: string
}

export interface GameState {
  moveTree: MoveNode[],
  currentMove: number,
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
  extraReducers(builder) {
    builder.addCase(SET_SOURCE, (state) => {
      state.currentMove = 0;
      state.moveTree = [rootNode];
    });
  },
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
