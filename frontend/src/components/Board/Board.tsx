import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as cg from 'chessground/types';
import { Config } from "chessground/config";
import { Chess, Square } from "chess.js";

import { useDimensions } from "../../hooks/useDimensions";
import BaseBoard from "./BaseBoard";
import { AppDispatch, RootState } from "../../store";
import { getDests, isPromotion } from "../../chess";
import { SET_PROMOTION_TARGET } from "../../redux/boardSlice";
import { MAKE_MOVE } from "../../redux/actions";
import PromotionOverlay from "./PromotionOverlay";

const Board = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [ref, dimensions] = useDimensions()
  const fen = useSelector((state: RootState) => state.board.fen);
  const orientation = useSelector((state: RootState) => state.board.orientation);
  const infos = useSelector((state: RootState) => state.engine.infos);

  const autoShapes = useMemo(() => {
    const info = infos.at(0);
    if (info) {
      const bestMove = info.pv.at(0);
      if (bestMove) {
        return [{
          orig: bestMove.from,
          dest: bestMove.to,
          brush: 'paleGreen',
        }]
      }
    }
    return [];
  }, [infos])

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
      drawable: { autoShapes }
    }
  }, [fen, orientation, autoShapes])

  return (
    <div className="w-full" ref={ref}>
      <div
        data-testid='board-wrapper'
        style={{ height: size, width: size, position: 'relative' }}
      >
        <BaseBoard config={config} />
        <PromotionOverlay size={size} />
      </div>
    </div>
  )
}

export default Board;
