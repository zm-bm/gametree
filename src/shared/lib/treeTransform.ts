import { Id, NormalNodeData, NormalTree, TreeNodeData, TreeSource } from "@/shared/types";

function sourceGameCount(node: NormalNodeData, source: TreeSource) {
  return node.stats[source].total;
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

// build hierarchical tree from normalized nodes
export function buildTree(
  nodes: NormalTree,
  id: Id,
  frequencyMin: number,
  source: TreeSource,
): TreeNodeData | null {
  const node = nodes[id];
  if (!node) return null;

  const selectedStats = node.stats[source];
  const numGames = selectedStats.total;
  let children = node.children.map(childId => {
    return filterTreeNodes(nodes, childId, frequencyMin, numGames, source)
      ? buildTree(nodes, childId, frequencyMin, source)
      : null;
  }).filter(Boolean) as TreeNodeData[];
  children = orderTreeNodes(children);

  return {
    ...node,
    ...selectedStats,
    children: node.collapsed ? [] : children,
    childCount: children.length,
  };
}
