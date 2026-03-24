import { memo, useMemo } from "react";

const FILES = "abcdefgh";
const PIECE_GLYPHS: Record<string, string> = {
  p: "♟",
  n: "♞",
  b: "♝",
  r: "♜",
  q: "♛",
  k: "♚",
  P: "♙",
  N: "♘",
  B: "♗",
  R: "♖",
  Q: "♕",
  K: "♔",
};

function parseFenPlacement(fen: string): Array<string | null> {
  const placement = fen.split(" ")[0] || "";
  const ranks = placement.split("/");
  if (ranks.length !== 8) return new Array(64).fill(null);

  const squares: Array<string | null> = [];
  for (const rank of ranks) {
    for (const token of rank) {
      if (/\d/.test(token)) {
        const emptyCount = Number(token);
        for (let i = 0; i < emptyCount; i++) squares.push(null);
      } else {
        squares.push(token);
      }
    }
  }

  return squares.length === 64 ? squares : new Array(64).fill(null);
}

function squareToIndex(square: string | undefined): number | null {
  if (!square || square.length !== 2) return null;

  const file = FILES.indexOf(square[0]);
  const rank = Number(square[1]);
  if (file < 0 || rank < 1 || rank > 8) return null;

  const row = 8 - rank;
  return row * 8 + file;
}

type TreeNodeMiniMoveBoardProps = {
  id: string;
  fen: string;
  from?: string;
  to?: string;
  size: number;
  isDarkMode: boolean;
  isCurrent: boolean;
};

export const TreeNodeMiniMoveBoard = memo(({
  id,
  fen,
  from,
  to,
  size,
  isDarkMode,
  isCurrent,
}: TreeNodeMiniMoveBoardProps) => {
  const squares = useMemo(() => parseFenPlacement(fen), [fen]);
  const fromIndex = useMemo(() => squareToIndex(from), [from]);
  const toIndex = useMemo(() => squareToIndex(to), [to]);

  const cellSize = size / 8;
  const cornerRadius = Math.max(0.75, size * 0.012);
  const darkSquare = isDarkMode ? "#556171" : "#9aa6b4";
  const lightSquare = isDarkMode ? "#b7c2cf" : "#d4dbe5";
  const boardStroke = isCurrent
    ? "rgba(245,158,11,0.95)"
    : isDarkMode
      ? "rgba(148,163,184,0.58)"
      : "rgba(71,85,105,0.42)";
  const moveHighlight = isDarkMode ? "rgba(134,239,172,0.38)" : "rgba(34,197,94,0.28)";
  const boardClipId = `tree-node-board-clip-${id.replace(/[^a-zA-Z0-9_-]/g, "_") || "root"}`;

  return (
    <g>
      <defs>
        <clipPath id={boardClipId}>
          <rect x={0} y={0} width={size} height={size} rx={cornerRadius} ry={cornerRadius} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${boardClipId})`}>
        {squares.map((piece, index) => {
          const row = Math.floor(index / 8);
          const col = index % 8;
          const x = col * cellSize;
          const y = row * cellSize;
          const isDarkSquare = (row + col) % 2 === 1;
          const fill = isDarkSquare ? darkSquare : lightSquare;

          return (
            <g key={index}>
              <rect x={x} y={y} width={cellSize} height={cellSize} fill={fill} style={{ pointerEvents: "none" }} />
              {piece && (
                <text
                  x={x + cellSize / 2}
                  y={y + cellSize / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    pointerEvents: "none",
                    userSelect: "none",
                    fontSize: Math.max(5, Math.round(cellSize * 0.78)),
                    fontWeight: 600,
                    fill: piece === piece.toUpperCase() ? "#f8fafc" : "#0f172a",
                  }}
                >
                  {PIECE_GLYPHS[piece] || ""}
                </text>
              )}
            </g>
          );
        })}

        {fromIndex !== null && (
          <rect
            x={(fromIndex % 8) * cellSize}
            y={Math.floor(fromIndex / 8) * cellSize}
            width={cellSize}
            height={cellSize}
            fill={moveHighlight}
            style={{ pointerEvents: "none" }}
          />
        )}

        {toIndex !== null && (
          <rect
            x={(toIndex % 8) * cellSize}
            y={Math.floor(toIndex / 8) * cellSize}
            width={cellSize}
            height={cellSize}
            fill={moveHighlight}
            style={{ pointerEvents: "none" }}
          />
        )}
      </g>

      <rect
        x={0}
        y={0}
        width={size}
        height={size}
        rx={cornerRadius}
        ry={cornerRadius}
        fill="none"
        stroke={boardStroke}
        strokeWidth={isCurrent ? 1.7 : 1}
        vectorEffect="non-scaling-stroke"
        style={{ pointerEvents: "none" }}
      />
    </g>
  );
});

TreeNodeMiniMoveBoard.displayName = "TreeNodeMiniMoveBoard";
