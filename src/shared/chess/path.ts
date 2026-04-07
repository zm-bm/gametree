import { Chess, DEFAULT_POSITION } from "chess.js";

import { Id } from "@/types";
import { serializeMove } from "./move";

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

export function formatMoveLine(sanMoves: string[]) {
  if (!sanMoves.length) return "Start position";

  const chunks: string[] = [];

  for (let idx = 0; idx < sanMoves.length; idx += 1) {
    const moveNo = Math.floor(idx / 2) + 1;
    const san = sanMoves[idx];

    if (idx % 2 === 0) {
      chunks.push(`${moveNo}. ${san}`);
      continue;
    }

    const hasVisibleWhiteMove = idx > 0 && (idx - 1) % 2 === 0;
    if (hasVisibleWhiteMove && chunks.length > 0) {
      chunks[chunks.length - 1] = `${chunks[chunks.length - 1]} ${san}`;
    } else {
      chunks.push(`${moveNo}... ${san}`);
    }
  }

  return chunks.join(" ");
}
