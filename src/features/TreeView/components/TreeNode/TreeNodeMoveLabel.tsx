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
  fontSize: number;
}

export const TreeNodeMoveLabel = ({ move, fontSize }: Props) => {
  const { symbol, notation } = useMemo(() => {
    if (!move?.san) return { symbol: undefined, notation: "" };
    if (move.san === "O-O" || move.san === "O-O-O") return { symbol: undefined, notation: move.san };

    const symbol = PIECE_SYMBOLS[move.piece] ?? undefined;
    const notation = symbol ? move.san.substring(1) : move.san;
    return { symbol, notation };
  }, [move?.san, move?.piece]);

  if (!move) return null;

  const moveLabelFontSize = Math.max(11, Math.round(fontSize * 0.78));
  const symbolFontSize = Math.round(moveLabelFontSize * 1.18);

  return (
    <text
      x={0}
      y={0}
      dx={symbol ? "-0.04em" : undefined}
      fill="#f8fafc"
      fontWeight={650}
      fontSize={moveLabelFontSize}
      textAnchor="middle"
      dominantBaseline="middle"
      style={textStyle}
    >
      {symbol && <tspan fontSize={symbolFontSize}>{symbol}</tspan>}
      <tspan dx={symbol ? "-0.08em" : undefined}>{notation}</tspan>
    </text>
  );
};
