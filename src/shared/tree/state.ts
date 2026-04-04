import { Chess, DEFAULT_POSITION, Square } from "chess.js";

import type { Id, OpeningMove, OpeningTotals, TreeStore, TreeStoreNode } from "../../types";
import { getMoveFromPathId, serializeMove } from "../chess";
import { getChildPathId, getParentPathId } from "./path";
import { toNodeStats } from "./stats";

export function buildNodes(
  nodes: TreeStore,
  nodeId: Id,
  openingData: OpeningTotals,
) {
  const rootPositionStats = toNodeStats(openingData);

  let node = nodes[nodeId];

  if (node) {
    const parentId = getParentPathId(nodeId);
    const hasParentEdge = parentId !== null && Boolean(nodes[parentId]?.children.includes(nodeId));

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
      loading: false,
      move: getMoveFromPathId(nodeId),
      edgeStats: rootPositionStats,
      positionStats: rootPositionStats,
      children: [],
    };
  }

  const childNodes = buildChildNodes(nodes, node, openingData.moves);
  const children = childNodes.map((child) => child.id);
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
    const childId = getChildPathId(parentNode.id, childMove);
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
      loading: false,
      move: childMove,
      edgeStats: childEdgeStats,
      positionStats: childEdgeStats,
      children: [],
    });
  }

  return children;
}

export function addNodesToTree(nodes: TreeStore, nodeId: Id, openingData: OpeningTotals) {
  const newNodes = buildNodes(nodes, nodeId, openingData);
  for (const node of newNodes) {
    nodes[node.id] = node;
  }

  const parentId = getParentPathId(nodeId);
  if (parentId !== null && nodes[parentId] && !nodes[parentId].children.includes(nodeId)) {
    nodes[parentId].children.push(nodeId);
  }
}