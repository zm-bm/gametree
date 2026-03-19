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
