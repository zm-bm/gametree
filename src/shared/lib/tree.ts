import { Chess, DEFAULT_POSITION } from "chess.js";

import { Move, NormalNodeData, NormalTree, TreeNodeData, LcMoveStats } from "@/shared/types";
import { getECO, serializeMove } from "./chess";

export function gameCount(node: TreeNodeData | NormalNodeData) {
  const { white, draws, black } = node;
  return black + draws + white;
}

export const getParentId = (nodeId: string) => {
  const parts = nodeId.split(',');
  if (parts.length > 0) {
    parts.pop();
    return parts.join(',');
  }
  return null;
};

export const getChildId = (parentId: string, move: Move) => {
  return [parentId, move.lan].filter(Boolean).join(',');
}

export const getMove = (nodeId: string) => {
  const chess = new Chess(DEFAULT_POSITION);
  const moves = nodeId.split(',');
  moves.forEach(move => move && chess.move(move));
  const move = chess.history({ verbose: true }).at(-1) || null;
  return move ? serializeMove(move) : null;
}

export function orderChildren(nodes: TreeNodeData[]) {
  // return tree nodes with most frequent moves in the middle
  const result = [];
  let start = 0;
  let end = nodes.length - 1;

  nodes.sort((a, b) => gameCount(a) - gameCount(b));
  for (let i = 0; i < nodes.length; i++) {
    if (i % 2 === 0) {
      result[end--] = nodes[i];
    } else {
      result[start++] = nodes[i];
    }
  }
  return result;
}

function filterTreeNode(
  nodes: NormalTree,
  id: string,
  frequencyMin:number,
  parentGames: number
) {
  const node = nodes[id];
  if (!node) return false;
  if (node.explored) return true;

  const frequency = gameCount(node) / parentGames * 100;
  return frequency >= frequencyMin;
}

export function buildTree(
  nodes: NormalTree,
  id: string,
  frequencyMin: number
): TreeNodeData | null {
  const node = nodes[id];
  if (!node) return null;

  const games = gameCount(node);
  const children = node.children.map(childId => {
    if (!filterTreeNode(nodes, childId, frequencyMin, games)) return null;
    return buildTree(nodes, childId, frequencyMin)
  }).filter(Boolean) as TreeNodeData[];

  return {
    ...node,
    children: orderChildren(children),
  };
}

export function processChildNodes(
  nodes: Record<string, NormalNodeData>,
  parentId: string,
  moveStats: LcMoveStats[],
): string[] {
  const children: string[] = [];
  const parentNode = nodes[parentId];
  const chess = new Chess(parentNode?.move?.after || DEFAULT_POSITION);

  for (const stats of moveStats) {
    const childMove = serializeMove(chess.move(stats.san));
    chess.undo();
    const childId = getChildId(parentId, childMove);
    
    if (nodes[childId]) continue;
    
    children.push(childId);
    nodes[childId] = {
      id: childId,
      explored: false,
      move: childMove,
      white: stats.white,
      draws: stats.draws,
      black: stats.black,
      averageRating: stats.averageRating,
      topGames: [],
      // opening: getECO(childPath),
      opening: null,
      children: [],
    };
  }
  
  return children;
}
