import { Chess } from "chess.js";

import { Move, MovePath, NormalNodeData, NormalTree, TreeNodeData, LcMoveStats, Node } from "../types/chess";
import { getECO, pathId, serializeMove } from "./chess";

export function gameCount(node: Node) {
  const { white, draws, black } = node;
  return black + draws + white;
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
  minFrequency:number,
  parentGames: number
) {
  const node = nodes[id];
  if (!node) return false;
  if (node.explored) return true;

  const frequency = gameCount(node) / parentGames * 100;
  return frequency >= minFrequency;
}

export function buildTree(
  nodes: NormalTree,
  id: string,
  minFrequency: number
): TreeNodeData | null {
  const node = nodes[id];
  if (!node) return null;

  const games = gameCount(node);
  const children = node.children.map(childId => {
    if (!filterTreeNode(nodes, childId, minFrequency, games)) return null;
    return buildTree(nodes, childId, minFrequency)
  }).filter(Boolean) as TreeNodeData[];

  return {
    ...node,
    children: orderChildren(children),
  };
}

export function processChildNodes(
  nodes: Record<string, NormalNodeData>,
  path: MovePath,
  move: Move | null,
  moveStats: LcMoveStats[],
): string[] {
  const children: string[] = [];

  for (const stats of moveStats) {
    const childMove = serializeMove(new Chess(move?.after).move(stats.san));
    const childPath = [...path, childMove];
    const childId = pathId(childPath);
    
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
      opening: getECO(childPath),
      children: [],
    };
  }
  
  return children;
}
