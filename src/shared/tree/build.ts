import type { Id, TreeSource, TreeStore, TreeViewNode } from "@/types";
import { getNextPathChildId, getPathIds } from "./path";
import { sourceGameCount } from "./stats";

function limitTreeNodeIds(
  nodes: TreeStore,
  nodeIds: Id[],
  moveLimit: number,
  source: TreeSource,
  requiredIds: Set<Id> = new Set(),
) {
  if (moveLimit <= 0) return nodeIds;

  const maxMoves = Math.floor(moveLimit);
  const sortByFrequency = (leftId: Id, rightId: Id) => sourceGameCount(nodes[rightId], source) - sourceGameCount(nodes[leftId], source);

  if (requiredIds.size === 0) {
    return [...nodeIds]
      .sort(sortByFrequency)
      .slice(0, maxMoves);
  }

  const required = nodeIds.filter((nodeId) => requiredIds.has(nodeId));
  const optional = nodeIds
    .filter((nodeId) => !requiredIds.has(nodeId))
    .sort(sortByFrequency)
    .slice(0, Math.max(0, maxMoves - required.length));

  return [...required, ...optional];
}

export function orderTreeNodes(nodes: TreeViewNode[]) {
  const orderedNodes: TreeViewNode[] = [];
  let start = 0;
  let end = nodes.length - 1;

  nodes.sort((a, b) => a.total - b.total);
  for (let index = 0; index < nodes.length; index++) {
    if (index % 2 === 0) {
      orderedNodes[end--] = nodes[index];
    } else {
      orderedNodes[start++] = nodes[index];
    }
  }
  return orderedNodes;
}

export function filterTreeNodes(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  parentGames: number,
  source: TreeSource,
) {
  const node = nodes[nodeId];
  if (!node) return false;
  if (node.childrenLoaded) return true;

  if (parentGames <= 0) return false;

  const frequency = sourceGameCount(node, source) / parentGames * 100;
  return frequency >= frequencyMin;
}

export function buildShallowNode(nodes: TreeStore, nodeId: Id, source: TreeSource): TreeViewNode | null {
  const node = nodes[nodeId];
  if (!node) return null;

  const selectedStats = node.edgeStats[source];
  return {
    ...node,
    ...selectedStats,
    children: [],
    childCount: 0,
  };
}

function addFocusContext(
  nodes: TreeStore,
  currentId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  visibleNodeIds: Set<Id>,
) {
  const currentPathIds = [...getPathIds(currentId)];

  for (const pathNodeId of currentPathIds) {
    visibleNodeIds.add(pathNodeId);

    const node = nodes[pathNodeId];
    if (!node) continue;

    const nextPathChildId = getNextPathChildId(pathNodeId, currentId);
    const requiredChildIds = new Set<Id>();
    if (nextPathChildId) {
      requiredChildIds.add(nextPathChildId);
    }

    const parentGames = node.edgeStats[source].total;
    const candidateChildIds = node.children.filter((childId) => (
      childId === nextPathChildId || filterTreeNodes(nodes, childId, frequencyMin, parentGames, source)
    ));

    if (nextPathChildId && nodes[nextPathChildId] && !candidateChildIds.includes(nextPathChildId)) {
      candidateChildIds.push(nextPathChildId);
    }

    const visibleChildIds = limitTreeNodeIds(nodes, candidateChildIds, moveLimit, source, requiredChildIds);
    for (const childId of visibleChildIds) {
      visibleNodeIds.add(childId);
    }
  }
}

function addAncestorChain(nodeId: Id, visibleNodeIds: Set<Id>) {
  for (const pathNodeId of getPathIds(nodeId)) {
    visibleNodeIds.add(pathNodeId);
  }
}

function addPinnedChildren(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  visibleNodeIds: Set<Id>,
) {
  visibleNodeIds.add(nodeId);
  const node = nodes[nodeId];
  if (!node) return;

  const parentGames = node.edgeStats[source].total;
  const candidateChildIds = node.children.filter((childId) => (
    filterTreeNodes(nodes, childId, frequencyMin, parentGames, source)
  ));
  const visibleChildIds = limitTreeNodeIds(nodes, candidateChildIds, moveLimit, source);

  for (const childId of visibleChildIds) {
    visibleNodeIds.add(childId);
  }
}

function buildVisibleNodeIds(
  nodes: TreeStore,
  currentId: Id,
  pinnedNodeIds: Id[],
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
) {
  const visibleNodeIds = new Set<Id>();

  addFocusContext(nodes, currentId, frequencyMin, moveLimit, source, visibleNodeIds);

  for (const pinnedNodeId of pinnedNodeIds) {
    if (!nodes[pinnedNodeId]) continue;
    addAncestorChain(pinnedNodeId, visibleNodeIds);
    addPinnedChildren(nodes, pinnedNodeId, frequencyMin, moveLimit, source, visibleNodeIds);
  }

  return visibleNodeIds;
}

function buildVisibleTree(
  nodes: TreeStore,
  nodeId: Id,
  source: TreeSource,
  visibleNodeIds: Set<Id>,
): TreeViewNode | null {
  const node = nodes[nodeId];
  if (!node || !visibleNodeIds.has(nodeId)) return null;

  const selectedStats = node.edgeStats[source];
  const children = orderTreeNodes(
    node.children
      .map((childId) => buildVisibleTree(nodes, childId, source, visibleNodeIds))
      .filter(Boolean) as TreeViewNode[]
  );

  return {
    ...node,
    ...selectedStats,
    children,
    childCount: children.length,
  };
}

export function treeBuild(
  nodes: TreeStore,
  nodeId: Id,
  pinnedNodes: Id[],
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
): TreeViewNode | null {
  const visibleNodeIds = buildVisibleNodeIds(nodes, currentId, pinnedNodes, frequencyMin, moveLimit, source);
  return buildVisibleTree(nodes, nodeId, source, visibleNodeIds);
}