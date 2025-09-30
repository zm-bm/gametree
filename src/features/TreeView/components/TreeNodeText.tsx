import { useMemo } from "react";
import { Move } from "@/shared/types";

const PIECE_SYMBOLS: Record<string, string> = {
  k: "♚",
  q: "♛",
  r: "♜",
  b: "♝",
  n: "♞",
};

const textStyle: React.CSSProperties = {
  pointerEvents: "none",
  userSelect: "none",
  fontFamily: "'Noto Sans', 'Segoe UI Symbol', sans-serif",
};

interface Props {
  move: Move | null;
  isPlaceholder: boolean;
  fontSize: number;
}

export const TreeNodeText  = ({ move, isPlaceholder, fontSize }: Props) => {

  const { symbol, notation } = useMemo(() => {
    if (!move?.san)
      return { symbol: undefined, notation: "" };
    if (move.san === "O-O" || move.san === "O-O-O")
      return { symbol: undefined, notation: move.san };

    const symbol = PIECE_SYMBOLS[move.piece] ?? undefined;
    const notation = symbol ? move.san.substring(1) : move.san;
    return { symbol, notation };
  }, [move?.san, move?.piece]);

  if (!move && !isPlaceholder) return null;
  return (
    <text
      x={0}
      y={0}
      dx={symbol ? "-0.05em" : undefined}
      dy={fontSize / 3}
      fill="#f8fafc" // slate-50
      fontWeight={600}
      fontSize={fontSize}
      textAnchor="middle"
      dominantBaseline="text-top"
      style={textStyle}
    >
      {symbol && (
        <tspan fontSize={Math.round(fontSize * 1.2)}>
          {symbol}
        </tspan>
      )}
      <tspan dx={symbol ? "-0.1em" : undefined}>
        {notation || (isPlaceholder ? "..." : "")}
      </tspan>
    </text>
  );
};
