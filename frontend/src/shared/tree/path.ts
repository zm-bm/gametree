import type { Id, Move, TreeStore } from "@/types";

export function getChildPathId(parentId: Id, move: Move) {
  return [parentId, move.lan].filter(Boolean).join(",");
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

export function findNearestExistingAncestorId(nodes: TreeStore, nodeId: Id): Id | null {
  let cursor: Id | null = nodeId;

  while (cursor !== null) {
    if (nodes[cursor]) return cursor;
    if (cursor === "") return null;

    const lastComma = cursor.lastIndexOf(",");
    cursor = lastComma === -1 ? "" : cursor.slice(0, lastComma);
  }

  return null;
}

export function getNodeFen(nodes: TreeStore, nodeId: Id, fallbackFen: string): string {
  return nodes[nodeId]?.move?.after || fallbackFen;
}

export function getParentPathId(nodeId: Id): Id | null {
  const lastComma = nodeId.lastIndexOf(",");
  if (lastComma === -1) return nodeId ? "" : null;
  return nodeId.slice(0, lastComma);
}

export function getSiblingNodeIds(nodes: TreeStore, currentId: Id): Id[] {
  const parentId = getParentPathId(currentId);
  if (parentId === null || parentId === currentId) return [];
  return nodes[parentId]?.children || [];
}