import {
  Id,
  NormalTree,
  TreeMode,
  TreeNodeData,
  TreeSource,
  getNextPathChildId,
  getPathIds,
  sourceGameCount,
} from "@/shared/types";

function limitTreeNodes(nodes: TreeNodeData[], moveLimit: number, requiredIds: Set<Id> = new Set()) {
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

// return tree nodes with most frequent moves in the middle
function orderTreeNodes(nodes: TreeNodeData[]) {
  const result = [];
  let start = 0;
  let end = nodes.length - 1;

  nodes.sort((a, b) => a.total - b.total);
  for (let i = 0; i < nodes.length; i++) {
    if (i % 2 === 0) {
      result[end--] = nodes[i];
    } else {
      result[start++] = nodes[i];
    }
  }
  return result;
}

// return true if node should be included in tree
function filterTreeNodes(
  nodes: NormalTree,
  id: Id,
  frequencyMin:number,
  parentGames: number,
  source: TreeSource,
) {
  const node = nodes[id];
  if (!node) return false;
  if (node.childrenLoaded) return true;

  if (parentGames <= 0) return false;

  const frequency = sourceGameCount(node, source) / parentGames * 100;
  return frequency >= frequencyMin;
}

function buildShallowNode(nodes: NormalTree, id: Id, source: TreeSource): TreeNodeData | null {
  const node = nodes[id];
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

function buildCompareTree(
  nodes: NormalTree,
  id: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
): TreeNodeData | null {
  const node = nodes[id];
  if (!node) return null;

  const selectedStats = node.stats[source];
  const numGames = selectedStats.total;
  let children = node.children
    .map((childId) => {
      return filterTreeNodes(nodes, childId, frequencyMin, numGames, source)
        ? buildCompareTree(nodes, childId, frequencyMin, moveLimit, source)
        : null;
    })
    .filter(Boolean) as TreeNodeData[];
  children = limitTreeNodes(children, moveLimit);
  children = orderTreeNodes(children);

  return {
    ...node,
    ...selectedStats,
    children: node.collapsed ? [] : children,
    childCount: children.length,
  };
}

function buildFocusTree(
  nodes: NormalTree,
  id: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  currentId: Id,
  currentPathIds: Set<Id>,
): TreeNodeData | null {
  const node = nodes[id];
  if (!node) return null;

  const selectedStats = node.stats[source];
  const numGames = selectedStats.total;
  const isPathNode = currentPathIds.has(id);
  const nextPathChildId = getNextPathChildId(id, currentId);

  let children: TreeNodeData[] = [];
  if (isPathNode) {
    const candidateChildIds = new Set(node.children);
    if (nextPathChildId) {
      candidateChildIds.add(nextPathChildId);
    }

    const requiredChildIds = new Set<Id>();
    if (nextPathChildId) {
      requiredChildIds.add(nextPathChildId);
    }

    children = [...candidateChildIds]
      .map((childId) => {
        const isPathChild = childId === nextPathChildId || currentPathIds.has(childId);
        const shouldInclude = isPathChild || filterTreeNodes(nodes, childId, frequencyMin, numGames, source);
        if (!shouldInclude) return null;

        if (id === currentId) {
          return buildShallowNode(nodes, childId, source);
        }

        if (isPathChild) {
          return buildFocusTree(nodes, childId, frequencyMin, moveLimit, source, currentId, currentPathIds);
        }

        return buildShallowNode(nodes, childId, source);
      })
      .filter(Boolean) as TreeNodeData[];

    children = limitTreeNodes(children, moveLimit, requiredChildIds);
    children = orderTreeNodes(children);
  }

  return {
    ...node,
    ...selectedStats,
    collapsed: false,
    children,
    childCount: children.length,
  };
}

// build hierarchical tree from normalized nodes
export function buildTree(
  nodes: NormalTree,
  id: Id,
  frequencyMin: number,
  moveLimit: number,
  source: TreeSource,
  mode: TreeMode,
  currentId: Id,
): TreeNodeData | null {
  if (mode === "focus") {
    const currentPathIds = getPathIds(currentId);
    return buildFocusTree(nodes, id, frequencyMin, moveLimit, source, currentId, currentPathIds);
  }

  return buildCompareTree(nodes, id, frequencyMin, moveLimit, source);
}
