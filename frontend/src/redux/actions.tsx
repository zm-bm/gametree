import { createAction } from "@reduxjs/toolkit";
import { Move } from "chess.js";

export const MAKE_MOVE = createAction<Move>('common/MAKE_MOVE');

