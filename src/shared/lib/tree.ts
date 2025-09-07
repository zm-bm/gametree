import { Chess, DEFAULT_POSITION } from "chess.js";

import { NormalNodeData, NormalTree, TreeNodeData, LcMoveData, Id, LcOpeningData } from "@/shared/types";
import { getECO, serializeMove } from "./chess";
import { getChildId, getMoveFromId } from "./id";

export function gameCount(node: TreeNodeData | NormalNodeData) {
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
  frequencyMin:number,
  parentGames: number
) {
  const node = nodes[id];
  if (!node) return false;
  if (node.collapsed) return false;
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

export function buildNodes(
  nodes: NormalTree,
  nodeId: Id,
  openingData: LcOpeningData,
) {
  let node = nodes[nodeId];

  if (node) {
    node = {
      ...node,
      explored: true,
      topGames: openingData.topGames,
      opening: openingData.opening,
    };
  } else {
    node = {
      id: nodeId,
      explored: true,
      collapsed: false,
      loading: false,
      move: getMoveFromId(nodeId),
      white: openingData.white,
      draws: openingData.draws,
      black: openingData.black,
      topGames: openingData.topGames,
      opening: openingData.opening,
      children: [],
    };
  }

  const childNodes = buildChildNodes(nodes, node, openingData.moves);
  const children = childNodes.map(child => child.id);
  node.children = [...new Set([...node.children, ...children])];
  
  return [node, ...childNodes];
}

export function buildChildNodes(
  nodes: NormalTree,
  parentNode: NormalNodeData,
  moveDataArray: LcMoveData[],
) {
  const children: NormalNodeData[] = [];
  const chess = new Chess(parentNode?.move?.after || DEFAULT_POSITION);

  for (const moveData of moveDataArray) {
    const childMove = serializeMove(chess.move(moveData.san));
    chess.undo();
    const childId = getChildId(parentNode.id, childMove);
    
    if (nodes[childId]) continue;
    
    children.push({
      id: childId,
      explored: false,
      collapsed: false,
      loading: false,
      move: childMove,
      white: moveData.white,
      draws: moveData.draws,
      black: moveData.black,
      averageRating: moveData.averageRating,
      topGames: [],
      // opening: getECO(childPath),
      opening: null,
      children: [],
    });
  }
  
  return children;
}
