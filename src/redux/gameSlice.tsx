import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Color } from 'chessground/types';
import { DEFAULT_POSITION, Move, Square } from 'chess.js';

import { MoveNode } from "../types/chess";
import { RootState } from '../store';
import { SetDataSource } from './openingsTreeSlice';

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

function findChildKey(state: GameState, parent: MoveNode, child: Move) {
  // find the move key of move from a parent move node
  return state.moveTree[parent.key].children.find(
    ix => state.moveTree[ix].move?.lan === child.lan
  );
}

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    /**
     * Make a chess move from the current position
     * 
     * @param state 
     * @param {Move} action.payload - chess.js move
     */
    MakeGameMove(state, action: PayloadAction<Move>) {
      state.promotionTarget = null;

      // check for the move in the moveTree
      const previousMove = state.moveTree[state.currentMove];
      const existingKey = findChildKey(state, previousMove, action.payload);
      if (existingKey === undefined) {
        // if it's a new move, add it to move tree and update key
        const key = state.moveTree.length;
        previousMove.children.push(key);
        state.moveTree.push({
          key,
          move: action.payload,
          parent: state.currentMove,
          children: [],
        });
        state.currentMove = key;
      } else {
        // otherwise it's been made before so just update key
        state.currentMove = existingKey;
      }
    },

    /**
     * Go to a position given by a move key 
     * 
     * @param state 
     * @param {number} action.payload - move key
     */
    GotoGameMove(state, action: PayloadAction<number>) {
      state.promotionTarget = null;

      if (0 <= action.payload && action.payload < state.moveTree.length) {
        state.currentMove = action.payload;
      }
    },

    /**
     * Go to a position given by a list of moves
     * 
     * @param state 
     * @param {Move[]} action.payload - array of moves
     */
    GotoGamePath(state, action: PayloadAction<Move[]>) {
      state.promotionTarget = null;

      // walk the move tree
      let key =  0;
      for (const move of action.payload) {
        const child = findChildKey(state, state.moveTree[key], move);

        if (child) {
          key = child;
        } else {
          // if child / path not found, add move to the tree
          // and update currentMove with new key
          const newMoveKey = state.moveTree.length;
          state.moveTree[key].children.push(newMoveKey);
          state.moveTree.push({
            key: newMoveKey,
            parent: key,
            move,
            children: [],
          });
          state.currentMove = newMoveKey;
          return;
        }
      }

      // otherwise this is an existing path so update currentMove
      state.currentMove = key;
    },

    SetPromotionTarget(state, action: PayloadAction<Square[] | null>) {
      state.promotionTarget = action.payload;
    },

    FlipOrientation(state) {
      state.orientation = state.orientation === 'white' ? 'black' : 'white';
    },
  },
  extraReducers(builder) {
    builder.addCase(SetDataSource, (state) => {
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
  GotoGameMove,
  GotoGamePath,
  SetPromotionTarget,
  FlipOrientation,
} = gameSlice.actions;
export default gameSlice.reducer;
