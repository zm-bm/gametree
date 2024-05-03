import { createSlice } from '@reduxjs/toolkit';
import { GOTO_MOVE, MAKE_MOVE } from './actions';
import { Move } from 'chess.js';

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
  },
  extraReducers(builder) {
    builder.addCase(GOTO_MOVE, (state, action) => {
      state.currentMove = action.payload.index;
    })
    builder.addCase(MAKE_MOVE, (state, action) => {
      if (state.currentMove !== state.moves.length) {
        state.moves = state.moves.slice(0, state.currentMove)
      }
      state.moves.push(action.payload)
      state.currentMove = state.moves.length;
    })
  },
});

export const {} = gameSlice.actions;
export default gameSlice.reducer;