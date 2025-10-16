import { Chess, DEFAULT_POSITION } from "chess.js";

import { Move, Id } from "@/shared/types";
import { serializeMove } from "./chess";

export const getPlaceholderId = (nodeId: Id) => {
  return `${nodeId}-placeholder`;
}

export const getParentId = (nodeId: Id) => {
  const parts = nodeId.split(',');
  if (parts.length > 0) {
    parts.pop();
    return parts.join(',');
  }
  return null;
};

export const getChildId = (parentId: Id, move: Move) => {
  return [parentId, move.lan].filter(Boolean).join(',');
}

export const getMoveFromId = (nodeId: Id) => {
  try {
    const chess = new Chess(DEFAULT_POSITION);
    const moves = nodeId.split(',');
    moves.forEach(move => move && chess.move(move));
    const move = chess.history({ verbose: true }).at(-1) || null;
    return move ? serializeMove(move) : null;
  } catch {
    console.error('Failed to get move for nodeId:', nodeId);
    return null;
  }
}

export const getFenFromId = (nodeId: Id) => {
  const move = getMoveFromId(nodeId);
  return move?.after || DEFAULT_POSITION;
}
