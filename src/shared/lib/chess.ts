import { Move as ChessMove } from "chess.js";

import eco from './eco.json'
import { LcOpening, Move, MovePath } from "@/shared/types";

export function pathId(moves: MovePath) {
  return moves.map(m => m.lan).join(',');
}

export function serializeMove(move: ChessMove): Move {
  return {
    color: move.color,
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured || undefined,
    promotion: move.promotion || undefined,
    san: move.san,
    lan: move.lan,
    before: move.before,
    after: move.after,
  };
}

export const book = eco as LcOpening[];

export function getECO(path: MovePath) {
  if (path.length === 0) return null;

  for (let i = path.length; i > 0; i--) {
    const subPath = path.slice(0, i);
    const uciString = subPath.map(move => move.lan).join(',');
    const ecoEntry = book.find(entry => entry.uci === uciString);
    if (ecoEntry) return ecoEntry;
  }

  return null;
}
