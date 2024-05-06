import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { GOTO_MOVE } from "../redux/gameSlice";
import { DEFAULT_POSITION } from "chess.js";

export const useMoveActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentMove = useSelector((state: RootState) => state.game.currentMove);
  const moveTree = useSelector((state: RootState) => state.game.moveTree);
  const lastTime = useRef(0);

  function throttle() {
    const now = Date.now();
    if (now - lastTime.current > 500) {
      lastTime.current = now;
      return false;
    }
    return true;
  }

  const undo = useCallback(() => {
    if (throttle()) return;
    const parent = moveTree[currentMove].parent;
    if (parent !== null) {
      dispatch(GOTO_MOVE({
        key: parent,
        fen: moveTree[parent].move?.after || DEFAULT_POSITION,
      }));
    }
  }, [currentMove, moveTree]);

  const redo = useCallback(() => {
    if (throttle()) return;
    const child = moveTree[currentMove].children.at(0);
    if (child !== undefined) {
      dispatch(GOTO_MOVE({
        key: child,
        fen: moveTree[child].move?.after || DEFAULT_POSITION,
      }));
    }
  }, [currentMove, moveTree]);

  const rewind = useCallback(() => {
    if (throttle()) return;
    dispatch(GOTO_MOVE({ key: 0, fen: DEFAULT_POSITION }));
  }, []);

  const forward = useCallback(() => {
    if (throttle()) return;
    let key = currentMove;
    while (moveTree[key].children.at(0) !== undefined) {
      key = moveTree[key].children.at(0) || key
    }
    const fen = moveTree[key].move?.after || DEFAULT_POSITION;
    dispatch(GOTO_MOVE({ key, fen }))
  }, [currentMove]);

  return { undo, redo, rewind, forward };
}