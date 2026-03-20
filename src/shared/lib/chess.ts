import { Move as ChessMove } from "chess.js";

import { Move } from "@/shared/types";

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
