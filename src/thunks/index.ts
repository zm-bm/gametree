import { Dispatch } from "@reduxjs/toolkit";
import { Move } from "chess.js";
import { MakeGameMove } from "../redux/gameSlice";
import { UPDATE_FEN } from "../redux/engineSlice";

export const MakeMove = (move: Move) => (dispatch: Dispatch) => {
  dispatch(MakeGameMove(move));
  dispatch(UPDATE_FEN(move.after));
}
