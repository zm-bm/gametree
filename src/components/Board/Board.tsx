import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Key } from 'chessground/types';
import { Config } from "chessground/config";
import { Chess, Square } from "chess.js";

import { useDimensions } from "../../hooks/useDimensions";
import BaseBoard from "./BaseBoard";
import { AppDispatch, RootState } from "../../store";
import { getDests, isPromotion } from "../../chess";
import { SetPromotionTarget, selectFen, selectLastMove } from "../../redux/gameSlice";
import PromotionOverlay from "./PromotionOverlay";
import { MakeMove } from "../../thunks";

const Board = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [ref, dimensions] = useDimensions()
  const orientation = useSelector((state: RootState) => state.game.orientation);
  const engineFen = useSelector((state: RootState) => state.engine.fen);
  const bestMove = useSelector((state: RootState) => state.engine.infos.at(-1)?.pv.at(0));
  const lastMove = useSelector((state: RootState) => selectLastMove(state))
  const fen = useSelector((state: RootState) => selectFen(state))

  const autoShapes = useMemo(() => {
    if (bestMove && fen === engineFen) {
      return [{
        orig: bestMove.from,
        dest: bestMove.to,
        brush: 'paleGreen',
      }];
    }
    return [];
  }, [bestMove, fen, engineFen])

  // ensure chessground board height/width is multiple of 8 (bc chess board)
  const size = useMemo(() => {
    return (Math.floor(dimensions.width / 8) * 8)
  }, [dimensions])

  // move handler for chessground board
  const move = useCallback((from: Key, to: Key) => {
    const chess = new Chess(fen);
    if (isPromotion(chess, from, to)) {
      dispatch(SetPromotionTarget([from as Square, to as Square]))
    } else {
      const move = chess.move({ from, to })
      dispatch(MakeMove(move))
    }
  }, [fen, dispatch])

  // config for chessground board
  const config: Config = useMemo(() => {
    const chess = new Chess(fen);
    return {
      fen,
      orientation,
      turnColor: chess.turn() === 'w' ? 'white' : 'black',
      check: chess.inCheck(),
      lastMove: lastMove ? [lastMove.from, lastMove.to] : [],
      movable: { dests: getDests(chess), free: false },
      events: { move },
      drawable: { autoShapes }
    }
  }, [fen, orientation, autoShapes, lastMove, move])

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
