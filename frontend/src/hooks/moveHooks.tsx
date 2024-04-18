import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../store";
import { GOTO_MOVE } from "../redux/actions";
import { DEFAULT_POSITION } from "chess.js";

export const useMoveActions = () => {
  const dispatch = useDispatch<AppDispatch>();
  const promotionTarget = useSelector((state: RootState) => state.board.promotionTarget);
  const moveTree = useSelector((state: RootState) => state.game.moveTree);
  const key = useSelector((state: RootState) => state.game.key);

  const undo = useCallback(() => {
    if (promotionTarget) return;
    const parent = moveTree[key].parent
    if (parent !== null) {
      const fen = moveTree[parent].move?.after || DEFAULT_POSITION;
      dispatch(GOTO_MOVE({ key: parent, fen }))
    }
  }, [promotionTarget, moveTree, key]);

  const redo = useCallback(() => {
    if (promotionTarget) return;
    const child = moveTree[key].children.at(0)
    if (child !== undefined) {
      const fen = moveTree[child].move?.after || DEFAULT_POSITION;
      dispatch(GOTO_MOVE({ key: child, fen }))
    }
  }, [promotionTarget, moveTree, key]);

  const rewind = useCallback(() => {
    if (promotionTarget) return;
    dispatch(GOTO_MOVE({ key: 0, fen: DEFAULT_POSITION }))
  }, [promotionTarget]);

  const forward = useCallback(() => {
    if (promotionTarget) return;
    let k = key
    while (moveTree[k].children.at(0) !== undefined) {
      k = moveTree[k].children.at(0) || k
    }
    const fen = moveTree[k].move?.after || DEFAULT_POSITION;
    dispatch(GOTO_MOVE({ key: k, fen }))
  }, [promotionTarget, moveTree, key]);

  return { undo, redo, rewind, forward };
}