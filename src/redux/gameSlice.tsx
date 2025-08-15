import { PayloadAction, createSelector, createSlice } from '@reduxjs/toolkit';
import { Color } from 'chessground/types';
import { DEFAULT_POSITION, Square } from 'chess.js';

import { Move, MovePath } from "../types/chess";
import { RootState } from '../store';
import { getECO } from '../lib/chess';

type HoverState = {
  fen: string,
  move: string,
} | null;

export interface GameState {
  moves: Move[],
  moveIndex: number,
  hover: HoverState,
  promotionTarget: Square[] | null,
  orientation: Color,
}

export const initialState: GameState = {
  moves: [],
  moveIndex: -1,
  hover: null,
  promotionTarget: null,
  orientation: 'white',
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    MakeGameMove(state, action: PayloadAction<Move>) {
      state.promotionTarget = null;
      if (state.moveIndex < state.moves.length - 1) {
        state.moves = state.moves.slice(0, state.moveIndex + 1);
      }
      state.moves.push(action.payload);
      state.moveIndex = state.moves.length - 1;
    },

    GotoGameNextMove(state) {
      state.promotionTarget = null;
      state.moveIndex += 1;
    },

    GotoGamePreviousMove(state) {
      state.promotionTarget = null;
      state.moveIndex -= 1;
    },

    GotoGameFirstMove(state) {
      state.promotionTarget = null;
      state.moveIndex = -1;
    },

    GotoGameLastMove(state) {
      state.promotionTarget = null;
      state.moveIndex = state.moves.length - 1;
    },

    GotoGamePath(state, action: PayloadAction<MovePath>) {
      state.promotionTarget = null;
      state.moves = action.payload;
      state.moveIndex = state.moves.length - 1;
    },

    SetPromotionTarget(state, action: PayloadAction<Square[] | null>) {
      state.promotionTarget = action.payload;
    },

    FlipOrientation(state) {
      state.orientation = state.orientation === 'white' ? 'black' : 'white';
    },

    SetHover(state, action: PayloadAction<HoverState>) {
      state.hover = action.payload;
    }
  },
});

export const selectMoves = (state: RootState) => state.game.moves;
export const selectMoveIndex = (state: RootState) => state.game.moveIndex;
export const selectFirstMove = (state: RootState) => state.game.moves[0] || null;
export const selectLastMove = (state: RootState) => state.game.moves.at(-1) || null;

export const selectNextMove = (state: RootState) => {
  const ix = Math.min(state.game.moveIndex + 1, state.game.moves.length - 1);
  return state.game.moves[ix] || null;
};

export const selectPreviousMove = (state: RootState) => {
  const ix = Math.max(state.game.moveIndex - 1, 0);
  return state.game.moves[ix] || null;
};

export const selectCurrentMove = createSelector(
  [selectMoves, selectMoveIndex],
  (moves, moveIndex) => moves[moveIndex] || null
);

export const selectPath = createSelector(
  [selectMoves, selectMoveIndex],
  (moves, moveIndex) => moves.slice(0, moveIndex + 1)
);

export const selectFen = createSelector(
  [selectCurrentMove],
  (move) => {
    return move?.after || DEFAULT_POSITION;
  }
);

export const selectEco = createSelector(
  [selectPath],
  (path) => getECO(path)
);

export const selectHover = (state: RootState) => state.game.hover;

export type GameAction = ReturnType<typeof gameSlice.actions[keyof typeof gameSlice.actions]>;

export const {
  MakeGameMove,
  GotoGameNextMove,
  GotoGamePreviousMove,
  GotoGameFirstMove,
  GotoGameLastMove,
  GotoGamePath,
  SetPromotionTarget,
  FlipOrientation,
  SetHover,
} = gameSlice.actions;

export default gameSlice.reducer;
