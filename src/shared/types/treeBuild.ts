import { Id } from "./chess";
import {
  getNextPathChildId,
  getPathIds,
  TreeStore,
  TreeMode,
  TreeViewNode,
  TreeSource,
  sourceGameCount,
} from "./tree";

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

  const selectedStats = node.stats[source];
  return {
    ...node,
    ...selectedStats,
    collapsed: false,
    children: [],
    childCount: 0,
  };
}

/**
 * Build compare-mode children for a branch, applying threshold, move limit,
 * and visual ordering.
 */
function buildCompareBranchChildren(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
): TreeViewNode[] {
  const node = nodes[nodeId];
  if (!node) return [];

  const parentGames = node.stats[source].total;
  const children = node.children
    .map((childId) => {
      return filterTreeNodes(nodes, childId, frequencyMin, parentGames, source)
        ? buildCompareBranch(nodes, childId, frequencyMin, moveLimit, source)
        : null;
    })
    .filter(Boolean) as TreeViewNode[];

  return orderTreeNodes(limitTreeNodes(children, moveLimit));
}

export function buildCompareBranch(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
): TreeViewNode | null {
  const node = nodes[nodeId];
  if (!node) return null;

  const selectedStats = node.stats[source];
  const children = buildCompareBranchChildren(nodes, nodeId, frequencyMin, moveLimit, source);

  return {
    ...node,
    ...selectedStats,
    children: node.collapsed ? [] : children,
    childCount: children.length,
  };
}

/**
 * Build one focus-mode child.
 *
 * Recurses only on the active path and keeps off-path children shallow.
 */
function buildFocusBranchChild(
  nodes: TreeStore,
  parentNodeId: Id,
  childId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
  parentGames: number,
  nextPathChildId: Id | null,
): TreeViewNode | null {
  const isPathChild = childId === nextPathChildId || currentPathIds.has(childId);
  const shouldInclude = isPathChild || filterTreeNodes(nodes, childId, frequencyMin, parentGames, source);
  if (!shouldInclude) return null;

  // At the current node, render only one ply of children to keep focus mode compact.
  if (parentNodeId === currentId) {
    return buildShallowNode(nodes, childId, source);
  }

  // Continue recursion only along the path to the current position.
  if (isPathChild) {
    return buildFocusBranch(nodes, childId, frequencyMin, moveLimit, source, currentId, currentPathIds);
  }

  return buildShallowNode(nodes, childId, source);
}

/**
 * Build focus-mode children for a branch.
 *
 * Keeps the next path child visible even if it is missing from local children
 * due to partial loading, and protects that path child from move-limit pruning.
 */
function buildFocusBranchChildren(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
): TreeViewNode[] {
  const node = nodes[nodeId];
  if (!node || !currentPathIds.has(nodeId)) return [];

  const nextPathChildId = getNextPathChildId(nodeId, currentId);

  // Include all loaded children plus the next path child to prevent path drop-off
  // when parent/child segments load asynchronously.
  const candidateChildIds = new Set(node.children);
  if (nextPathChildId) {
    candidateChildIds.add(nextPathChildId);
  }

  // Never prune the path continuation, even when moveLimit is tight.
  const requiredChildIds = new Set<Id>();
  if (nextPathChildId) {
    requiredChildIds.add(nextPathChildId);
  }

  const parentGames = node.stats[source].total;
  const children = [...candidateChildIds]
    .map((childId) => buildFocusBranchChild(
      nodes,
      nodeId,
      childId,
      frequencyMin,
      moveLimit,
      source,
      currentId,
      currentPathIds,
      parentGames,
      nextPathChildId,
    ))
    .filter(Boolean) as TreeViewNode[];

  return orderTreeNodes(limitTreeNodes(children, moveLimit, requiredChildIds));
}

export function buildFocusBranch(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
): TreeViewNode | null {
  const node = nodes[nodeId];
  if (!node) return null;

  const selectedStats = node.stats[source];
  const children = buildFocusBranchChildren(nodes, nodeId, frequencyMin, moveLimit, source, currentId, currentPathIds);

  return {
    ...node,
    ...selectedStats,
    collapsed: false,
    children,
    childCount: children.length,
  };
}

/**
 * Public tree builder used by selectors.
 *
 * Dispatches to compare/focus branch builders and computes focus path context
 * only when needed.
 */
export function treeBuild(
  nodes: TreeStore,
  nodeId: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  mode: TreeMode,
  currentId: Id,
): TreeViewNode | null {
  if (mode === "focus") {
    const currentPathIds = getPathIds(currentId);
    return buildFocusBranch(nodes, nodeId, frequencyMin, moveLimit, source, currentId, currentPathIds);
  }

  return buildCompareBranch(nodes, nodeId, frequencyMin, moveLimit, source);
}
