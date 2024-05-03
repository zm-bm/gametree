import { createAction } from "@reduxjs/toolkit";
import { Move } from "chess.js";

type MoveTarget = {
  index: number,
  fen: string
}

export const MAKE_MOVE = createAction<Move>('common/MAKE_MOVE');
export const GOTO_MOVE = createAction<MoveTarget>('common/GOTO_MOVE');
