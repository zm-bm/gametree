import { Color, PieceSymbol, Square } from "chess.js";
import { TransformMatrix } from "@visx/zoom/lib/types";

export type Move = {
  color: Color;
  from: Square;
  to: Square;
  piece: PieceSymbol;
  captured?: PieceSymbol;
  promotion?: PieceSymbol;
  san: string;
  lan: string;
  before: string;
  after: string;
};

export type Id = string;
export type MovePath = Move[];
export type TreeSource = 'otb' | 'online';
export type TreeWinRateScale = 'relative' | 'absolute';

export type OpeningBookEntry = {
  eco: string;
  name: string;
  uci: string;
};

export type SourceStats = {
  white: number;
  draws: number;
  black: number;
  total: number;
};

export type OpeningMove = {
  uci: string;
  otb: SourceStats;
  online: SourceStats;
  total: number;
};

export type OpeningTotals = {
  play: string[];
  otb: SourceStats;
  online: SourceStats;
  moves: OpeningMove[];
};

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
}

export type NormalTree = Record<Id, NormalNodeData>;

type TreeNodeStats = SourceStats;

export type TreeNodeData = NodeData & TreeNodeStats & {
  children: TreeNodeData[];
  childCount: number;
};

export type Tree = Record<Id, TreeNodeData>;

export type ZoomState = {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
};

export type EngineOutput = {
  depth: number,
  seldepth: number,
  multipv?: number,
  cp?: number
  mate?: number,
  pv?: string[],
  time?: number,
  speed?: number,
  hashfull?: number,
  tbhits?: number,
};

export type NodeTooltipData = {
  white: number;
  draws: number;
  black: number;
  parent: number;
  rating?: number;
  eco?: string;
  name?: string;
};
