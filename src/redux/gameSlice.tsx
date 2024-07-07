import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Color } from 'chessground/types';
import { DEFAULT_POSITION, Move, Square } from 'chess.js';

import { MoveNode } from "../types/chess";
import { RootState } from '../store';
import { SET_SOURCE } from './treeSlice';

type GotoTarget = {
  key: number
  fen: string
}

export interface GameState {
  moveTree: MoveNode[],
  currentMove: number,
  promotionTarget: Square[] | null,
  orientation: Color,
}

export const rootNode = {
  key: 0,
  move: null,
  parent: null,
  children: [],
}
export const initialState: GameState = {
  moveTree: [rootNode],
  currentMove: 0,
  promotionTarget: null,
  orientation: 'white',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    MakeGameMove(state, action: PayloadAction<Move>) {
      state.promotionTarget = null;
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
      state.promotionTarget = null;
      state.currentMove = action.payload.key;
    },
    GOTO_PATH(state, action: PayloadAction<Move[]>) {
      state.promotionTarget = null;
      const { moveTree } = state;
      let parent = 0;
      for (const move of action.payload) {
        const child = moveTree[parent].children.find(ix => moveTree[ix].move?.lan === move.lan)
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
    SetPromotionTarget(state, action: PayloadAction<Square[] | null>) {
      state.promotionTarget = action.payload;
    },
    FlipOrientation(state) {
      state.orientation = state.orientation === 'white' ? 'black' : 'white';
    },
  },
  extraReducers(builder) {
    builder.addCase(SET_SOURCE, (state) => {
      state.currentMove = 0;
      state.moveTree = [rootNode];
      state.promotionTarget = null;
    });
  },
});

const selectMoveTree = (state: RootState) => state.game.moveTree;
const selectCurrentMove = (state: RootState) => state.game.currentMove;

export const selectLastMove = createSelector(
  [selectMoveTree, selectCurrentMove],
  (moveTree, currentMove) => {
    return moveTree[currentMove].move;
  }
);

export const selectFen = createSelector(
  [selectMoveTree, selectCurrentMove],
  (moveTree, currentMove) => {
    return moveTree[currentMove].move?.after || DEFAULT_POSITION;
  }
);

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
);


export type GameAction = ReturnType<typeof gameSlice.actions[keyof typeof gameSlice.actions]>;
export const {
  MakeGameMove,
  GOTO_MOVE,
  GOTO_PATH,
  SetPromotionTarget,
  FlipOrientation,
} = gameSlice.actions;
export default gameSlice.reducer;
