import { Id, Move } from "./chess";
import { SourceStats } from "./openings";

export type TreeSource = "otb" | "online";
export type TreeWinRateComparison = "relative" | "absolute";

export type NodeStats = Record<TreeSource, SourceStats>;

type BaseTreeNode = {
  id: Id;
  childrenLoaded: boolean;
  loading: boolean;
  move: Move | null;
  edgeStats: NodeStats;
  positionStats: NodeStats;
};

export type TreeStoreNode = BaseTreeNode & {
  children: string[];
};

export type TreeStore = Record<Id, TreeStoreNode>;

export type TreeViewNode = BaseTreeNode & SourceStats & {
  children: TreeViewNode[];
  childCount: number;
};

export type TreeView = Record<Id, TreeViewNode>;
