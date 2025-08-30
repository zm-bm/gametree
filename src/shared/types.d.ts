import { Color, PieceSymbol, Square } from "chess.js";
import { TransformMatrix } from "@visx/zoom/lib/types";
export type Move = { color: Color; from: Square; to: Square;
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
export type TreeSource = 'masters' | 'lichess';

export type LcOpening = {
  eco: string;
  name: string;
  uci: string;
};

type LcPlayer = {
  name: string | null;
  rating: number | null;
};

type LcWinner = "black" | "white" | null;

type LcGame = {
  id: string;
  uci: string;
  winner: LcWinner;
  white: LcPlayer;
  black: LcPlayer;
  year: number;
  month: string;
};

export type LcMoveData = {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
};

export type LcOpeningData = {
  white: number;
  draws: number;
  black: number;
  topGames: LcGame[];
  opening: LcOpening | null;
  moves: LcMoveData[];
};

type NodeData = {
  id: Id;
  explored: boolean;
  loading: boolean;
  move: Move | null;
  white: number;
  draws: number;
  black: number;
  averageRating?: number;
  topGames: LcGame[];
  opening: LcOpening | null;
};

export type NormalNodeData = NodeData & {
  children: string[];
}

export type NormalTree = Record<Id, NormalNodeData>;

export type TreeNodeData = NodeData & {
  children: TreeNodeData[];
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
