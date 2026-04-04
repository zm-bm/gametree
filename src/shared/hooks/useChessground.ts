import { useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { Chess, Square, SQUARES } from "chess.js";
import { Color, Key } from 'chessground/types';
import { Config } from "chessground/config";

import { RootState, useAppDispatch } from "../../store";
import { nav, ui } from "../../store/slices";
import {
  selectBoardOrientation,
  selectBoardFen,
  selectCurrentMove,
  selectEngineOutput,
  selectHoverMove,
} from "../../store/selectors";
import { serializeMove } from "../chess";

export function useBoardDisplay(fen: string) {
  const currentMove = useSelector((s: RootState) => selectCurrentMove(s));
  const hoverMove = useSelector((s: RootState) => selectHoverMove(s));

  return useMemo(() => {
    const displayFen = hoverMove?.after || fen;
    const displayMove = hoverMove
      ? [hoverMove.from, hoverMove.to]
      : currentMove
        ? [currentMove.from, currentMove.to]
        : [];

    return {
      displayFen,
      displayMove,
      check: new Chess(displayFen).inCheck(),
    };
  }, [fen, currentMove, hoverMove]);
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
  const dispatch = useAppDispatch();
  const orientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const fen = useSelector((s: RootState) => selectBoardFen(s));
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

  const { turnColor, dests } = useChessState(displayFen);

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
