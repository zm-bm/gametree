import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { GOTO_MOVE } from "../redux/gameSlice";
import { DEFAULT_POSITION } from "chess.js";

export const useMoveActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentMove = useSelector((state: RootState) => state.game.currentMove);
  const moves = useSelector((state: RootState) => state.game.moves);
  const throttle = 600;
  const lastTime = useRef(0);

  const undo = useCallback(() => {
    if (currentMove === 0) return;
    var now = Date.now()
    if (now - lastTime.current >= throttle) {
      lastTime.current = now
      const index = currentMove - 1;
      dispatch(GOTO_MOVE({
        index,
        fen: moves[index].before,
      }))
    }
  }, [moves, currentMove, lastTime]);

  const redo = useCallback(() => {
    if (currentMove === moves.length) return;

    var now = Date.now()
    if (now - lastTime.current >= throttle) {
      lastTime.current = now
      const index = currentMove + 1;
      dispatch(GOTO_MOVE({
        index,
        fen: moves[currentMove].after,
      }))
    }
  }, [moves, currentMove, lastTime]);

  const rewind = useCallback(() => {
    if (currentMove === 0) return;

    var now = Date.now()
    if (now - lastTime.current >= throttle) {
        lastTime.current = now
      dispatch(GOTO_MOVE({
        index: 0,
        fen: DEFAULT_POSITION,
      }))
    }
  }, [moves, currentMove, lastTime]);

  const forward = useCallback(() => {
    if (currentMove === moves.length) return;

    var now = Date.now()
    if (now - lastTime.current >= throttle) {
      lastTime.current = now
      const index = moves.length;
      dispatch(GOTO_MOVE({
        index,
        fen: moves[index-1].after,
      }))
    }
  }, [moves, currentMove, lastTime]);

  return { undo, redo, rewind, forward };
}