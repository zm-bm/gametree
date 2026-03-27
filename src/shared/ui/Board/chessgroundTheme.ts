import { CHESSGROUND_PIECE_SPRITES, ChessgroundPieceSpriteKey } from "./chessgroundPieceSprites";

export type ChessgroundTheme = {
  boardImageUrl: string;
  lastMoveHighlight: string;
  pieceSprites: Record<ChessgroundPieceSpriteKey, string>;
};

const DEFAULT_THEME: ChessgroundTheme = {
  boardImageUrl: "/board.svg",
  lastMoveHighlight: "rgba(155, 199, 0, 0.41)",
  pieceSprites: CHESSGROUND_PIECE_SPRITES,
};

let cachedTheme: ChessgroundTheme | null = null;

function extractCssUrl(value: string | null | undefined): string | null {
  if (!value) return null;

  const match = value.match(/url\((['"]?)(.*?)\1\)/);
  return match?.[2] || null;
}

function readCssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function getChessgroundTheme(): ChessgroundTheme {
  if (cachedTheme) return cachedTheme;

  const boardImageUrl = extractCssUrl(readCssVar("--cg-board-image"));
  const lastMoveHighlight = readCssVar("--cg-last-move-highlight");

  cachedTheme = {
    boardImageUrl: boardImageUrl || DEFAULT_THEME.boardImageUrl,
    lastMoveHighlight: lastMoveHighlight || DEFAULT_THEME.lastMoveHighlight,
    pieceSprites: DEFAULT_THEME.pieceSprites,
  };

  return cachedTheme;
}

export function invalidateChessgroundThemeCache() {
  cachedTheme = null;
}
