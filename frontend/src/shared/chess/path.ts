import { Chess, DEFAULT_POSITION } from "chess.js";

import { Id } from "@/types";
import { serializeMove } from "./move";

export type MoveLineToken = {
  plyIndex: number;
  moveNumber: number;
  prefix: string;
  san: string;
};

export function getMoveFromPathId(nodeId: Id) {
  try {
    const chess = new Chess(DEFAULT_POSITION);
    const moves = nodeId.split(",");
    moves.forEach((move) => move && chess.move(move));
    const move = chess.history({ verbose: true }).at(-1) || null;
    return move ? serializeMove(move) : null;
  } catch {
    console.error("Failed to get move for nodeId:", nodeId);
    return null;
  }
}

export function getFenFromPathId(nodeId: Id) {
  const move = getMoveFromPathId(nodeId);
  return move?.after || DEFAULT_POSITION;
}

export function getSanHistoryFromPathId(nodeId: Id) {
  try {
    const chess = new Chess(DEFAULT_POSITION);
    const moves = nodeId.split(",");
    moves.forEach((move) => move && chess.move(move));
    return chess.history();
  } catch {
    return [];
  }
}

export function buildMoveLineTokens(sanMoves: string[]): MoveLineToken[] {
  if (!sanMoves.length) return [];

  const tokens: MoveLineToken[] = [];

  for (let idx = 0; idx < sanMoves.length; idx += 1) {
    const moveNumber = Math.floor(idx / 2) + 1;
    const isWhiteMove = idx % 2 === 0;
    const hasVisibleWhiteMove = idx > 0 && (idx - 1) % 2 === 0;
    const prefix = isWhiteMove
      ? `${moveNumber}. `
      : hasVisibleWhiteMove
        ? ""
        : `${moveNumber}... `;

    tokens.push({
      plyIndex: idx,
      moveNumber,
      prefix,
      san: sanMoves[idx],
    });
  }

  return tokens;
}

export function formatMoveLine(sanMoves: string[]) {
  if (!sanMoves.length) return "Start position";

  const tokens = buildMoveLineTokens(sanMoves);
  return tokens.map((token, idx) => `${idx > 0 ? " " : ""}${token.prefix}${token.san}`).join("");
}
