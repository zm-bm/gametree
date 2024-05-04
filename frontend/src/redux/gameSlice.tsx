import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { Move } from 'chess.js';

type GotoTarget = {
  index: number
  fen: string
}

export interface GameState {
  moves: Move[],
  currentMove: number,
}

const initialState: GameState = {
  moves: [],
  currentMove: 0,
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
    },
    GOTO_MOVE(state, action: PayloadAction<GotoTarget>) {
      state.currentMove = action.payload.index;
    },
    SET_GAME(state, action: PayloadAction<Move[]>) {
      state.moves = action.payload;
      state.currentMove = state.moves.length;
    },
  },
});

export const { MAKE_MOVE, GOTO_MOVE, SET_GAME } = gameSlice.actions;
export default gameSlice.reducer;
