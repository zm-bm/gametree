import { Color, PieceSymbol, Square } from "chess.js";

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
