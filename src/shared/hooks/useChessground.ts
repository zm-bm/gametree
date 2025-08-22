import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Chess, Square, SQUARES } from "chess.js";
import { Color, Key } from 'chessground/types';
import { Config } from "chessground/config";

import { AppDispatch, RootState } from "@/store";
import { nav, ui } from "@/store/slices";
import {
  selectBoardOrientation,
  selectCurrentFen,
  selectCurrentMove,
  selectEngineOutput
} from "@/store/selectors";
import { serializeMove } from "@/shared/lib/chess";

export function useFenColor(fen: string) {
  return useMemo(() => fen.split(' ').at(1) || '', [fen]);
};

export function useBoardDisplay(fen: string) {
  // const hoverNodeId = useSelector((s: RootState) => selectHoverId(s));
  const currentMove = useSelector((s: RootState) => selectCurrentMove(s));

  return useMemo(() => {
    // const displayFen = hover ? hover.fen : fen;
    const displayFen = fen;

    // let displayMove: Square[] = [];
    // if (hover) displayMove = [hover.move.slice(0, 2) as Square, hover.move.slice(2, 4) as Square];
    // else if (currentMove) displayMove = [currentMove.from, currentMove.to];
    const displayMove = currentMove ? [currentMove.from, currentMove.to] : [];

    return {
      displayFen,
      displayMove,
      check: new Chess(displayFen).inCheck(),
    };
  }, [fen, currentMove]);
}

export function useChessState(fen: string) {
  return useMemo(() => {
    const chess = new Chess(fen);

    const dests = new Map();
    SQUARES.forEach(s => {
      const moves = chess.moves({ square: s, verbose: true });
      if (moves.length) {
        dests.set(s, moves.map(m => m.to));
      }
    });

    return {
      turnColor: chess.turn() === 'w' ? 'white' : 'black' as Color,
      dests,
    };
  }, [fen]);
}

export function useChessgroundConfig(): Config {
  const dispatch = useDispatch<AppDispatch>();
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const fen = useSelector((s: RootState) => selectCurrentFen(s));
  const engineOutput = useSelector((s: RootState) => selectEngineOutput(s));

  const { displayFen, displayMove, check } = useBoardDisplay(fen);

  const autoShapes = useMemo(() => {
    const bestMove = engineOutput?.pv?.[0];
    if (!bestMove)
      return [];

    return [{
      orig: bestMove.slice(0, 2) as Square,
      dest: bestMove.slice(2, 4) as Square,
      brush: 'blue',
    }];
  }, [engineOutput]);

  const { turnColor, dests } = useChessState(fen);

  const moveCallback = useCallback((from: Key, to: Key) => {
    const chess = new Chess(fen);
    const move = chess.move(`${from}${to}`);
    if (!move.promotion) {
      dispatch(nav.actions.commitMove(serializeMove(move)));
    } else {
      dispatch(ui.actions.setPromotionTarget([from as Square, to as Square]));
    }
  }, [fen, dispatch]);

  return useMemo(() => {
    return {
      fen: displayFen,
      lastMove: displayMove,
      orientation,
      turnColor,
      check,
      movable: { dests, free: false },
      events: { move: moveCallback },
      drawable: { autoShapes }
    }
  }, [displayFen, displayMove, turnColor, check, dests, orientation, autoShapes, moveCallback]);
}
