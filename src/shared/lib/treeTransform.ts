import { Id, NormalNodeData, NormalTree, TreeNodeData } from "@/shared/types";

// return total games for a node
export function gameCount(node: TreeNodeData | NormalNodeData) {
  const { white, draws, black } = node;
  return black + draws + white;
}

// return tree nodes with most frequent moves in the middle
function orderTreeNodes(nodes: TreeNodeData[]) {
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

// return true if node should be included in tree
function filterTreeNodes(
  nodes: NormalTree,
  id: Id,
  frequencyMin:number,
  parentGames: number
) {
  const node = nodes[id];
  if (!node) return false;
  if (node.childrenLoaded) return true;

  const frequency = gameCount(node) / parentGames * 100;
  return frequency >= frequencyMin;
}

// build hierarchical tree from normalized nodes
export function buildTree(
  nodes: NormalTree,
  id: Id,
  frequencyMin: number,
): TreeNodeData | null {
  const node = nodes[id];
  if (!node) return null;

  const numGames = gameCount(node);
  let children = node.children.map(childId => {
    return filterTreeNodes(nodes, childId, frequencyMin, numGames)
      ? buildTree(nodes, childId, frequencyMin)
      : null;
  }).filter(Boolean) as TreeNodeData[];
  children = orderTreeNodes(children);

  return {
    ...node,
    children: node.collapsed ? [] : children,
    childCount: children.length,
  };
}
