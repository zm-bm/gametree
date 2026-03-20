import { Chess, DEFAULT_POSITION, Square } from "chess.js";

import { OpeningMove, OpeningTotals, TreeStoreNode, TreeStore, Id, toNodeStats } from "@/shared/types";
import { serializeMove } from "./chess";
import { getChildId, getMoveFromId, getParentId } from "./id";

export function buildNodes(
  nodes: TreeStore,
  nodeId: Id,
  openingData: OpeningTotals,
) {
  const rootPositionStats = toNodeStats(openingData);

  let node = nodes[nodeId];

  if (node) {
    const parentId = getParentId(nodeId);
    const hasParentEdge = Boolean(parentId && nodes[parentId]?.children.includes(nodeId));

    node = {
      ...node,
      childrenLoaded: true,
      edgeStats: nodeId === "" || !hasParentEdge ? rootPositionStats : node.edgeStats,
      positionStats: rootPositionStats,
    };
  } else {
    node = {
      id: nodeId,
      childrenLoaded: true,
      collapsed: false,
      loading: false,
      move: getMoveFromId(nodeId),
      edgeStats: rootPositionStats,
      positionStats: rootPositionStats,
      children: [],
    };
  }

  const childNodes = buildChildNodes(nodes, node, openingData.moves);
  const children = childNodes.map(child => child.id);
  node.children = [...new Set([...node.children, ...children])];
  
  return [node, ...childNodes];
}

export function buildChildNodes(
  nodes: TreeStore,
  parentNode: TreeStoreNode,
  moveDataArray: OpeningMove[],
) {
  const children: TreeStoreNode[] = [];
  const chess = new Chess(parentNode?.move?.after || DEFAULT_POSITION);

  for (const moveData of moveDataArray) {
    const { uci } = moveData;
    const from = uci.slice(0, 2) as Square;
    const to = uci.slice(2, 4) as Square;
    const promotion = uci.length > 4 ? uci.slice(4) : undefined;
    const childMove = serializeMove(chess.move({ from, to, promotion }));
    chess.undo();
    const childId = getChildId(parentNode.id, childMove);
    const childEdgeStats = toNodeStats(moveData);

    const existingNode = nodes[childId];
    if (existingNode) {
      children.push({
        ...existingNode,
        move: existingNode.move || childMove,
        edgeStats: childEdgeStats,
        positionStats: existingNode.childrenLoaded ? existingNode.positionStats : childEdgeStats,
      });
      continue;
    }

    children.push({
      id: childId,
      childrenLoaded: false,
      collapsed: false,
      loading: false,
      move: childMove,
      edgeStats: childEdgeStats,
      positionStats: childEdgeStats,
      children: [],
    });
  }
  
  return children;
}

export const addNodesToTree = (nodes: TreeStore, nodeId: Id, openingData: OpeningTotals) => {
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

