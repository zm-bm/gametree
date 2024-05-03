import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { GOTO_MOVE } from "../redux/actions";
import { DEFAULT_POSITION } from "chess.js";

export const useMoveActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const promotionTarget = useSelector((state: RootState) => state.board.promotionTarget);
  const currentMove = useSelector((state: RootState) => state.game.currentMove);
  const moves = useSelector((state: RootState) => state.game.moves);

  const undo = useCallback(() => {
    if (promotionTarget) return;
    if (currentMove === 0) return;

    const index = currentMove - 1;
    dispatch(GOTO_MOVE({
      index,
      fen: moves[index].before,
    }))
  }, [promotionTarget, moves, currentMove]);

  const redo = useCallback(() => {
    if (promotionTarget) return;
    if (currentMove === moves.length) return;

    const index = currentMove + 1;
    dispatch(GOTO_MOVE({
      index,
      fen: moves[currentMove].after,
    }))
  }, [promotionTarget, moves, currentMove]);

  const rewind = useCallback(() => {
    if (promotionTarget) return;
    if (currentMove === 0) return;

    dispatch(GOTO_MOVE({
      index: 0,
      fen: DEFAULT_POSITION,
    }))
  }, [promotionTarget, moves, currentMove]);

  const forward = useCallback(() => {
    if (promotionTarget) return;
    if (currentMove === moves.length) return;

    const index = moves.length;
    dispatch(GOTO_MOVE({
      index,
      fen: moves[index-1].after,
    }))
  }, [promotionTarget, moves, currentMove]);

  return { undo, redo, rewind, forward };
}