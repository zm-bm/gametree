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
