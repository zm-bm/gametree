import { Chess, DEFAULT_POSITION } from "chess.js";

import { NormalNodeData, NormalTree, LcMoveData, Id, LcOpeningData } from "@/shared/types";
import { serializeMove } from "./chess";
import { getChildId, getMoveFromId, getParentId } from "./id";

export function buildNodes(
  nodes: NormalTree,
  nodeId: Id,
  openingData: LcOpeningData,
) {
  let node = nodes[nodeId];

  if (node) {
    node = {
      ...node,
      childrenLoaded: true,
      topGames: openingData.topGames,
      opening: openingData.opening,
    };
  } else {
    node = {
      id: nodeId,
      childrenLoaded: true,
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
      childrenLoaded: false,
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

export const addNodesToTree = (nodes: NormalTree, nodeId: Id, openingData: LcOpeningData) => {
  // Build and add new nodes to tree
  const newNodes = buildNodes(nodes, nodeId, openingData);
  for (const node of newNodes) {
    nodes[node.id] = node;
  }

  // Update parent node
  const parentId = getParentId(nodeId);
  if (parentId && nodes[parentId]) {
    if (!nodes[parentId].children.includes(nodeId)) {
      nodes[parentId].children.push(nodeId);
    }
  }
};

