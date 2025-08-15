import { Color, PieceSymbol, Square } from "chess.js";
import { TreeSource } from "../redux/openingsApi";

export type TreeSource = 'masters' | 'lichess';

export type ECO = {
  eco: string;
  name: string;
  uci: string;
};

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

export type MovePath = Move[];

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

export type LcMoveStats = {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
};

export type LcOpeningStats = {
  white: number;
  draws: number;
  black: number;
  topGames: LcGame[];
  opening: ECO | null;
  moves: LcMoveStats[];
};

type NodeData = {
  id: string;
  explored: boolean;
  move: Move | null;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
  topGames: LcGame[];
  opening: ECO | null;
};

export type NormalNodeData = NodeData & {
  children: string[];
}

export type NormalTree = Record<string, NormalNodeData>;

export type TreeNodeData = NodeData & {
  children: TreeNodeData[];
};
