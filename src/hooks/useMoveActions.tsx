import { useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { GotoMove } from "../thunks";

export const useMoveActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentMove = useSelector((state: RootState) => state.game.currentMove);
  const moveTree = useSelector((state: RootState) => state.game.moveTree);
  const lastTime = useRef(0);

  function throttle() {
    const now = Date.now();
    if (now - lastTime.current > 250) {
      lastTime.current = now;
      return false;
    }
    return true;
  }

  const undo = useCallback(() => {
    if (throttle()) return;
    const parent = moveTree[currentMove].parent;
    if (parent !== null) {
      dispatch(GotoMove(parent));
    }
  }, [currentMove, moveTree, dispatch]);

  const redo = useCallback(() => {
    if (throttle()) return;
    const child = moveTree[currentMove].children.at(0);
    if (child !== undefined) {
      dispatch(GotoMove(child));
    }
  }, [currentMove, moveTree, dispatch]);

  const rewind = useCallback(() => {
    if (throttle()) return;
    dispatch(GotoMove(0));
  }, [dispatch]);

  const forward = useCallback(() => {
    if (throttle()) return;
    let key = currentMove;
    while (moveTree[key].children.at(0) !== undefined) {
      key = moveTree[key].children.at(0) || key
    }
    dispatch(GotoMove(key))
  }, [currentMove, moveTree, dispatch]);

  return { undo, redo, rewind, forward };
}