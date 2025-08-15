import { createAsyncThunk } from "@reduxjs/toolkit";
import { Chess, DEFAULT_POSITION } from "chess.js";

import {
  GotoGameFirstMove,
  GotoGameNextMove,
  GotoGamePreviousMove,
  GotoGameLastMove,
  MakeGameMove,
  selectLastMove,
  selectNextMove,
  selectPreviousMove,
  GotoGamePath,
} from "./redux/gameSlice";

import { UpdateFen } from "./redux/engineSlice";
import { AppDispatch, RootState } from "./store";
import { Move } from "./types/chess";
import { playMoveSound } from "./lib/sound";
import { serializeMove } from "./lib/chess";

export const MakeMove = createAsyncThunk(
  'MakeMove',
  async (move: Move, { dispatch }) => {
    dispatch(MakeGameMove(move));
    dispatch(UpdateFen(move.after));
    playMoveSound();
  }
);

export const GotoNextMove = createAsyncThunk<
  void, void, { dispatch: AppDispatch, state: RootState }
>(
  'GotoNextMove',
  async (_, { dispatch, getState }) => {
    const state: RootState = getState();
    const moveIndex = state.game.moveIndex;
    const movesLength = state.game.moves.length;
    
    if (moveIndex >= movesLength - 1) return;
    
    const nextMove = selectNextMove(state);
    dispatch(UpdateFen(nextMove?.after || DEFAULT_POSITION));
    dispatch(GotoGameNextMove());
    playMoveSound();
  }
);

export const GotoPreviousMove = createAsyncThunk<
  void, void, { dispatch: AppDispatch, state: RootState }
>(
  'GotoPreviousMove',
  async (_, { dispatch, getState }) => {
    const state: RootState = getState();
    const moveIndex = state.game.moveIndex;
    
    if (moveIndex < 0) return;
    
    const previousMove = selectPreviousMove(state);
    dispatch(UpdateFen(previousMove?.after || DEFAULT_POSITION));
    dispatch(GotoGamePreviousMove());
    playMoveSound();
  }
);

export const GotoFirstMove = createAsyncThunk<
  void, void, { dispatch: AppDispatch, state: RootState }
>(
  'GotoFirstMove',
  async (_, { dispatch, getState }) => {
    const state: RootState = getState();
    const moveIndex = state.game.moveIndex;
    
    if (moveIndex === -1) return;
    
    dispatch(UpdateFen(DEFAULT_POSITION));
    dispatch(GotoGameFirstMove());
    playMoveSound();
  }
);

export const GotoLastMove = createAsyncThunk<
  void, void, { dispatch: AppDispatch, state: RootState }
>(
  'GotoLastMove',
  async (_, { dispatch, getState }) => {
    const state: RootState = getState();
    const moveIndex = state.game.moveIndex;
    const movesLength = state.game.moves.length;
    
    if (moveIndex >= movesLength - 1) return;
    
    const lastMove = selectLastMove(state);
    dispatch(UpdateFen(lastMove?.after || DEFAULT_POSITION));
    dispatch(GotoGameLastMove());
    playMoveSound();
  }
);

export const GotoPath = createAsyncThunk<
  void, string, { dispatch: AppDispatch, state: RootState }
>(
  'GotoPath',
  async (path: string, { dispatch }) => {
    const chess = new Chess();
    const moves = path.split(',').map(lan => serializeMove(chess.move(lan)));
    const fen = moves.at(-1)?.after || DEFAULT_POSITION;

    dispatch(UpdateFen(fen));
    dispatch(GotoGamePath(moves));
    playMoveSound();
  }
);
