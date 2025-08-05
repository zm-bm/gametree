import { Color, PieceSymbol, Square } from "chess.js";

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
  before?: string;
  after?: string;
};

export type MoveNode = {
  key: number;
  move: Move | null;
  parent: number | null;
  children: number[];
};

type LichessPlayer = {
  name: string | null;
  rating: number | null;
};

type LichessWinner = "black" | "white" | null;

type LichessGame = {
  id: string;
  uci: string;
  winner: LichessWinner;
  white: LichessPlayer;
  black: LichessPlayer;
  year: number;
  month: string;
};

type LichessOpening = {
  eco: string;
  name: string;
  uci: string;
};

export type LichessMove = {
  uci: string;
  san: string;
  white: number;
  draws: number;
  black: number;
  averageRating: number;
};

export type LichessOpenings = {
  white: number;
  draws: number;
  black: number;
  topGames: LichessGame[];
  opening: LichessOpening | null;
  moves: LichessMove[];
};

export type TreeNode = {
  name: string;
  attributes: {
    white: number;
    draws: number;
    black: number;
    topGames: LichessGame[] | null;
    opening: LichessOpening | null;
    averageRating: number | null;
    move: Move | null;
  };
  children: TreeNode[];
};
