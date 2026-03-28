import { Id } from "./chess";
import {
  getNextPathChildId,
  getPathIds,
  TreeStore,
  TreeViewNode,
  TreeSource,
  sourceGameCount,
} from "./tree";

function getRequiredPinnedPathIds(pinnedNodes: Id[]) {
  const pinnedPathIds = new Set<Id>();

  for (const pinnedNodeId of pinnedNodes) {
    for (const pathId of getPathIds(pinnedNodeId)) {
      pinnedPathIds.add(pathId);
    }
  }

  return pinnedPathIds;
}

function getPinnedChildIds(parentNodeId: Id, pinnedNodes: Id[]) {
  const pinnedChildIds = new Set<Id>();

  for (const pinnedNodeId of pinnedNodes) {
    const pinnedChildId = getNextPathChildId(parentNodeId, pinnedNodeId);
    if (pinnedChildId) {
      pinnedChildIds.add(pinnedChildId);
    }
  }

  return pinnedChildIds;
}

/**
 * Cap the number of children shown for a node.
 *
 * When required ids are provided (focus path), those children are preserved
 * even if they would otherwise be pruned by the move limit.
 */
export function limitTreeNodes(nodes: TreeViewNode[], moveLimit: number, requiredIds: Set<Id> = new Set()) {
  if (moveLimit <= 0) return nodes;

  const maxMoves = Math.floor(moveLimit);
  if (requiredIds.size === 0) {
    return [...nodes]
      .sort((a, b) => b.total - a.total)
      .slice(0, maxMoves);
  }

  const required = nodes.filter((node) => requiredIds.has(node.id));
  const optional = nodes
    .filter((node) => !requiredIds.has(node.id))
    .sort((a, b) => b.total - a.total)
    .slice(0, Math.max(0, maxMoves - required.length));

  return [...required, ...optional];
}

/**
 * Arrange children so highest-frequency moves end up near the visual center.
 */
export function orderTreeNodes(nodes: TreeViewNode[]) {
  const orderedNodes: TreeViewNode[] = [];
  let start = 0;
  let end = nodes.length - 1;

  nodes.sort((a, b) => a.total - b.total);
  for (let i = 0; i < nodes.length; i++) {
    if (i % 2 === 0) {
      orderedNodes[end--] = nodes[i];
    } else {
      orderedNodes[start++] = nodes[i];
    }
  }
  return orderedNodes;
}

/**
 * Decide whether a child should be included based on frequency threshold.
 *
 * Already-loaded nodes are always included so explored branches remain visible.
 */
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

/**
 * Build a non-recursive node used for one-ply leaf rendering.
 */
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

/**
 * Build one visible child.
 *
 * Recurses along the current path and any pinned paths, while keeping
 * unrelated off-path children shallow.
 */
function buildTreeBranchChild(
  nodes: TreeStore,
  parentNodeId: Id,
  childId: Id,
  pinnedNodes: Id[],
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
  pinnedPathIds: Set<Id>,
  parentGames: number,
  nextPathChildId: Id | null,
): TreeViewNode | null {
  const isCurrentPathChild = childId === nextPathChildId || currentPathIds.has(childId);
  const isPinnedPathChild = pinnedPathIds.has(childId);
  const shouldInclude = isCurrentPathChild || isPinnedPathChild || filterTreeNodes(nodes, childId, frequencyMin, parentGames, source);
  if (!shouldInclude) return null;

  // At the current node, keep non-pinned siblings shallow to preserve the compact layout.
  if (parentNodeId === currentId && !isPinnedPathChild) {
    return buildShallowNode(nodes, childId, source);
  }

  // Continue recursion only along the current path or a pinned branch.
  if (isCurrentPathChild || isPinnedPathChild) {
    return buildTreeBranch(nodes, childId, pinnedNodes, frequencyMin, moveLimit, source, currentId, currentPathIds, pinnedPathIds);
  }

  return buildShallowNode(nodes, childId, source);
}

/**
 * Build visible children for a branch.
 *
 * Keeps the next current-path child and any pinned-path child visible even if
 * they are missing from local children due to partial loading, and protects
 * those required children from move-limit pruning.
 */
function buildTreeBranchChildren(
  nodes: TreeStore,
  nodeId: Id,
  pinnedNodes: Id[],
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
  pinnedPathIds: Set<Id>,
): TreeViewNode[] {
  const node = nodes[nodeId];
  if (!node || (!currentPathIds.has(nodeId) && !pinnedPathIds.has(nodeId))) return [];

  const nextPathChildId = getNextPathChildId(nodeId, currentId);
  const pinnedChildIds = getPinnedChildIds(nodeId, pinnedNodes);

  // Include all loaded children plus required path continuations to prevent
  // branch drop-off when parent/child segments load asynchronously.
  const candidateChildIds = new Set(node.children);
  if (nextPathChildId) {
    candidateChildIds.add(nextPathChildId);
  }
  for (const pinnedChildId of pinnedChildIds) {
    candidateChildIds.add(pinnedChildId);
  }

  // Never prune the current-path or pinned-path continuation, even when moveLimit is tight.
  const requiredChildIds = new Set<Id>();
  if (nextPathChildId) {
    requiredChildIds.add(nextPathChildId);
  }
  for (const pinnedChildId of pinnedChildIds) {
    requiredChildIds.add(pinnedChildId);
  }

  const parentGames = node.edgeStats[source].total;
  const children = [...candidateChildIds]
    .map((childId) => buildTreeBranchChild(
      nodes,
      nodeId,
      childId,
      pinnedNodes,
      frequencyMin,
      moveLimit,
      source,
      currentId,
      currentPathIds,
      pinnedPathIds,
      parentGames,
      nextPathChildId,
    ))
    .filter(Boolean) as TreeViewNode[];

  return orderTreeNodes(limitTreeNodes(children, moveLimit, requiredChildIds));
}

export function buildTreeBranch(
  nodes: TreeStore,
  nodeId: Id,
  pinnedNodes: Id[],
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
  pinnedPathIds: Set<Id>,
): TreeViewNode | null {
  const node = nodes[nodeId];
  if (!node) return null;

  const selectedStats = node.edgeStats[source];
  const children = buildTreeBranchChildren(nodes, nodeId, pinnedNodes, frequencyMin, moveLimit, source, currentId, currentPathIds, pinnedPathIds);

  return {
    ...node,
    ...selectedStats,
    children,
    childCount: children.length,
  };
}

/**
 * Public tree builder used by selectors.
 */
export function treeBuild(
  nodes: TreeStore,
  nodeId: Id,
  pinnedNodes: Id[],
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
): TreeViewNode | null {
  const currentPathIds = getPathIds(currentId);
  const pinnedPathIds = getRequiredPinnedPathIds(pinnedNodes);
  return buildTreeBranch(nodes, nodeId, pinnedNodes, frequencyMin, moveLimit, source, currentId, currentPathIds, pinnedPathIds);
}
