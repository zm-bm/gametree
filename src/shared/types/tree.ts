import { Id, Move } from "./chess";
import { SourceStats } from "./openings";

export type TreeSource = "otb" | "online";
export type TreeMode = "focus" | "compare";
export type TreeWinRateComparison = "relative" | "absolute";

export type NodeStats = Record<TreeSource, SourceStats>;

type NodeData = {
  id: Id;
  childrenLoaded: boolean;
  collapsed: boolean;
  loading: boolean;
  move: Move | null;
  stats: NodeStats;
};

export type NormalNodeData = NodeData & {
  children: string[];
};

export type NormalTree = Record<Id, NormalNodeData>;

type TreeNodeStats = SourceStats;

export type TreeNodeData = NodeData & TreeNodeStats & {
  children: TreeNodeData[];
  childCount: number;
};

export type Tree = Record<Id, TreeNodeData>;

export function toNodeStats(input: { otb: SourceStats; online: SourceStats }): NodeStats {
  return {
    otb: input.otb,
    online: input.online,
  };
}

export function sourceGameCount(node: NormalNodeData, source: TreeSource) {
  return node.stats[source].total;
}

export function getPathIds(currentId: Id) {
  const pathIds: Id[] = [""];
  const segments = currentId.split(",").filter(Boolean);

  let cursor = "";
  for (const segment of segments) {
    cursor = cursor ? `${cursor},${segment}` : segment;
    pathIds.push(cursor);
  }

  return new Set(pathIds);
}

export function getNextPathChildId(parentId: Id, currentId: Id) {
  if (parentId === currentId) return null;

  const prefix = parentId ? `${parentId},` : "";
  if (!currentId.startsWith(prefix)) return null;

  const remaining = currentId.slice(prefix.length);
  if (!remaining) return null;

  const nextSegment = remaining.split(",")[0];
  return parentId ? `${parentId},${nextSegment}` : nextSegment;
}

export function findNearestExistingAncestorId(nodes: NormalTree, nodeId: Id): Id | null {
  let cursor: Id | null = nodeId;

  while (cursor !== null) {
    if (nodes[cursor]) return cursor;
    if (cursor === "") return null;

    const lastComma = cursor.lastIndexOf(",");
    cursor = lastComma === -1 ? "" : cursor.slice(0, lastComma);
  }

  return null;
}

export function getNodeFen(nodes: NormalTree, id: Id, fallbackFen: string): string {
  return nodes[id]?.move?.after || fallbackFen;
}

export function pickPreferredNodeId(nodeIds: Id[], nodes: NormalTree): Id | undefined {
  if (!nodeIds.length) return undefined;

  const exploredNodeId = nodeIds.find((nodeId) => nodes[nodeId]?.childrenLoaded);
  if (exploredNodeId) return exploredNodeId;

  return nodeIds.length % 2
    ? nodeIds[Math.floor(nodeIds.length / 2)]
    : nodeIds[Math.floor(nodeIds.length / 2 - 1)];
}

export function getParentPathId(nodeId: Id): Id | null {
  const lastComma = nodeId.lastIndexOf(",");
  if (lastComma === -1) return nodeId ? "" : null;
  return nodeId.slice(0, lastComma);
}

export function getSiblingNodeIds(nodes: NormalTree, currentId: Id): Id[] {
  const parentId = getParentPathId(currentId);
  if (parentId === null || parentId === currentId) return [];
  return nodes[parentId]?.children || [];
}

export function getTreeLinkFrequency(source: TreeNodeData, target: TreeNodeData): number {
  return source.total ? target.total / source.total : 0;
}

export function getNodeWinScore(node: TreeNodeData): number {
  return node.total > 0 ? (node.white - node.black) / node.total : 0;
}
