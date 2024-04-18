import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as cg from 'chessground/types';
import { Config } from "chessground/config";
import { Chess, Square } from "chess.js";

import { useDimensions } from "../hooks/useDimensions";
import BaseBoard from "./BaseBoard";
import { AppDispatch, RootState } from "../store";
import { getDests, isPromotion } from "../chess";
import { SET_PROMOTION_TARGET } from "../redux/boardSlice";
import { MAKE_MOVE } from "../redux/actions";

const BoardPane = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [ref, dimensions] = useDimensions()
  const fen = useSelector((state: RootState) => state.board.fen);
  const orientation = useSelector((state: RootState) => state.board.orientation);

  // ensure chessground board height/width is multiple of 8 (bc chess board)
  const size = useMemo(() => {
    return (Math.floor(dimensions.width / 8) * 8)
  }, [dimensions])

  // move handler for chessground board
  const move = useCallback((from: cg.Key, to: cg.Key) => {
    const chess = new Chess(fen);
    if (isPromotion(chess, from, to)) {
      dispatch(SET_PROMOTION_TARGET([from as Square, to as Square]))
    } else {
      const move = chess.move({ from, to })
      dispatch(MAKE_MOVE(move))
    }
  }, [fen])

  // config for chessground board
  const config: Config = useMemo(() => {
    const chess = new Chess(fen);
    return {
      fen,
      orientation,
      turnColor: chess.turn() === 'w' ? 'white' : 'black',
      check: chess.inCheck(),
      movable: { dests: getDests(chess), free: false },
      events: { move },
    }
  }, [fen, orientation])

  return (
    <div className="h-full w-full" ref={ref}>
      <div
        data-testid='board-wrapper'
        style={{ height: size, width: size, position: 'relative' }}
      >
        <BaseBoard config={config} />
      </div>
    </div>
  )
}

export default BoardPane;
