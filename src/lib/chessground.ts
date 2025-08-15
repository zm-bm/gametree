import { useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Chess, Square, SQUARES } from "chess.js";
import { Color, Key } from 'chessground/types';
import { Config } from "chessground/config";

import { AppDispatch, RootState } from "../store";
import { selectFen, selectCurrentMove, SetPromotionTarget, selectHover } from "../redux/gameSlice";
import { serializeMove } from "../lib/chess";
import { MakeMove } from "../thunks";
import { C } from "vitest/dist/chunks/reporters.d.BFLkQcL6.js";

function isPromotion(chess: Chess, from: Key, dest: Key) {
  const piece = chess.get(from as Square);
  return (
    piece?.type === 'p' &&
    ((piece.color === 'w' && dest[1] === '8') ||
      (piece.color === 'b' && dest[1] === '1'))
  );
}

export function useFenColor(fen: string) {
  return useMemo(() => fen.split(' ').at(1) || '', [fen]);
};

export function useAutoShapes(fen: string) {
  const engineFen = useSelector((state: RootState) => state.engine.fen);
  const engineOutput = useSelector((state: RootState) => state.engine.output.at(0));

  return useMemo(() => {
    const bestMove = engineOutput?.pv?.[0];
    if (!bestMove || fen !== engineFen)
      return [];

    return [{
      orig: bestMove.slice(0, 2) as Square,
      dest: bestMove.slice(2, 4) as Square,
      brush: 'paleGreen',
    }];
  }, [fen, engineFen, engineOutput]);
};

export function useBoardDisplay(fen: string) {
  const hover = useSelector((state: RootState) => selectHover(state));
  const currentMove = useSelector((state: RootState) => selectCurrentMove(state));

  return useMemo(() => {
    const displayFen = hover ? hover.fen : fen;

    let displayMove: Square[] = [];
    if (hover) displayMove = [hover.move.slice(0, 2) as Square, hover.move.slice(2, 4) as Square];
    else if (currentMove) displayMove = [currentMove.from, currentMove.to];

    return {
      displayFen,
      displayMove,
      check: new Chess(displayFen).inCheck(),
    };
  }, [fen, currentMove, hover]);
}

export function useMoveCallback() {
  const dispatch = useDispatch<AppDispatch>();
  const fen = useSelector((state: RootState) => selectFen(state));

  return useCallback((from: Key, to: Key) => {
    const chess = new Chess(fen);
    if (isPromotion(chess, from, to)) {
      dispatch(SetPromotionTarget([from as Square, to as Square]));
    } else {
      const move = chess.move({ from, to });
      if (move) {
        dispatch(MakeMove(serializeMove(move)));
      }
    }
  }, [fen, dispatch]);
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
  const orientation = useSelector((state: RootState) => state.game.orientation);
  const fen = useSelector((state: RootState) => selectFen(state));

  const { displayFen, displayMove, check } = useBoardDisplay(fen);
  const autoShapes = useAutoShapes(fen);
  const { turnColor, dests } = useChessState(fen);
  const moveCallback = useMoveCallback();

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
