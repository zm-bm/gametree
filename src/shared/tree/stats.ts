import type {
  NodeStats,
  SourceStats,
  TreeSource,
  TreeStoreNode,
  TreeViewNode,
} from "../../types";

export function toNodeStats(input: { otb: SourceStats; online: SourceStats }): NodeStats {
  return {
    otb: input.otb,
    online: input.online,
  };
}

export function sourceGameCount(node: TreeStoreNode, source: TreeSource) {
  return node.edgeStats[source].total;
}

export function getTreeLinkFrequency(source: TreeViewNode, target: TreeViewNode): number {
  return source.total ? target.total / source.total : 0;
}

export function getNodeWinScore(node: TreeViewNode): number {
  return node.total > 0 ? (node.white - node.black) / node.total : 0;
}