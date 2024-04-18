import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DEFAULT_POSITION, Square } from 'chess.js';
import * as cg from 'chessground/types';
import { MAKE_MOVE } from './actions';

interface BoardSlice {
  fen: string,
  promotionTarget: Square[] | null,
  orientation: cg.Color,
}

const initialState: BoardSlice = {
  fen: DEFAULT_POSITION,
  promotionTarget: null,
  orientation: 'white',
};

const boardSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    SET_PROMOTION_TARGET(state, action: PayloadAction<Square[] | null>) {
      state.promotionTarget = action.payload
    },
  },
  extraReducers(builder) {
    builder.addCase(MAKE_MOVE, (state, action) => {
      state.fen = action.payload.after
    })
  },
});

export const { SET_PROMOTION_TARGET } = boardSlice.actions;
export default boardSlice.reducer;
