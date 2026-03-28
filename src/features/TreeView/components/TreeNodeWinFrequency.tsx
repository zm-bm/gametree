import { memo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeViewNode } from "@/shared/types";
import { COLORS } from "../lib/colors";

const FONT_WEIGHT = 600;
const MIN_LABEL_PERCENT = 10;
const BAR_HORIZONTAL_PAD_RATIO = 0.02;
const BAR_BOTTOM_INSET_RATIO = 0.08;
const LABEL_SIDE_INSET = 0.5;
const APPROX_GLYPH_WIDTH_FACTOR = 0.6;

function getFittedLabel(value: number, segmentWidth: number, fontSize: number) {
  const fullText = `${value}%`;
  const compactText = `${value}`;
  const availableWidth = Math.max(0, segmentWidth - LABEL_SIDE_INSET * 2);

  const fullTextWidth = fullText.length * fontSize * APPROX_GLYPH_WIDTH_FACTOR;
  if (availableWidth >= fullTextWidth) {
    return { text: fullText, textLength: undefined as number | undefined };
  }

  const compactTextWidth = compactText.length * fontSize * APPROX_GLYPH_WIDTH_FACTOR;
  if (availableWidth >= compactTextWidth) {
    return { text: compactText, textLength: undefined as number | undefined };
  }

  return {
    text: compactText,
    textLength: Math.max(1, availableWidth),
  };
}

type TreeNodeWinFrequencyProps = {
  node: HierarchyPointNode<TreeViewNode>;
  nodeSize: number;
  barTrackColor: string;
  barStrokeColor: string;
  minimap?: boolean;
  boardOrientation: "white" | "black";
  fontSize: number;
};

export const TreeNodeWinFrequency = memo(({
  node,
  nodeSize,
  barTrackColor,
  barStrokeColor,
  minimap = false,
  boardOrientation,
  fontSize,
}: TreeNodeWinFrequencyProps) => {
  if (minimap) return null;

  const nodeX = -Math.round(nodeSize / 2);
  const nodeY = -Math.round(nodeSize / 2);
  const edgeTotal = node.data.total;
  const whiteCount = node.data.white;
  const blackCount = node.data.black;
  const drawCount = node.data.draws;

  const barHorizontalPad = Math.max(1, Math.round(nodeSize * BAR_HORIZONTAL_PAD_RATIO));
  const barBottomInset = Math.max(2, Math.round(nodeSize * BAR_BOTTOM_INSET_RATIO));
  const barWidth = Math.max(14, nodeSize - barHorizontalPad * 2);
  const barHeight = Math.max(5, Math.round(nodeSize * 0.12));
  const barX = nodeX + (nodeSize - barWidth) / 2;
  const barY = nodeY + nodeSize - barHeight - barBottomInset;
  const barClipId = `tree-node-bar-clip-${node.data.id.replace(/[^a-zA-Z0-9_-]/g, "_") || "root"}`;

  const winCount = boardOrientation === "white" ? whiteCount : blackCount;
  const lossCount = boardOrientation === "white" ? blackCount : whiteCount;
  const winPct = edgeTotal > 0 ? (winCount / edgeTotal) * 100 : 0;
  const drawPct = edgeTotal > 0 ? (drawCount / edgeTotal) * 100 : 0;
  const lossPct = edgeTotal > 0 ? (lossCount / edgeTotal) * 100 : 0;

  const winWidth = (barWidth * winPct) / 100;
  const drawWidth = (barWidth * drawPct) / 100;
  const lossWidth = Math.max(0, barWidth - winWidth - drawWidth);

  const winPctRounded = Math.round(winPct);
  const drawPctRounded = Math.round(drawPct);
  const lossPctRounded = Math.round(lossPct);

  const percentagesFontSize = Math.max(5, Math.round(fontSize * 0.34));

  const winLabel = winPctRounded >= MIN_LABEL_PERCENT
    ? getFittedLabel(winPctRounded, winWidth, percentagesFontSize)
    : null;
  const drawLabel = drawPctRounded >= MIN_LABEL_PERCENT
    ? getFittedLabel(drawPctRounded, drawWidth, percentagesFontSize)
    : null;
  const lossLabel = lossPctRounded >= MIN_LABEL_PERCENT
    ? getFittedLabel(lossPctRounded, lossWidth, percentagesFontSize)
    : null;

  const percentagesLabelY = barY + barHeight / 2 + 0.5;
  const winLabelX = barX + winWidth / 2;
  const drawLabelX = barX + winWidth + drawWidth / 2;
  const lossLabelX = barX + winWidth + drawWidth + lossWidth / 2;

  return (
    <>
      <defs>
        <clipPath id={barClipId}>
          <rect
            x={0}
            y={0}
            width={barWidth}
            height={barHeight}
            rx={Math.max(2, Math.round(barHeight / 2))}
            ry={Math.max(2, Math.round(barHeight / 2))}
          />
        </clipPath>
      </defs>

      <g transform={`translate(${barX},${barY})`}>
        <rect
          x={0}
          y={0}
          width={barWidth}
          height={barHeight}
          rx={Math.max(2, Math.round(barHeight / 2))}
          ry={Math.max(2, Math.round(barHeight / 2))}
          fill={barTrackColor}
          stroke={barStrokeColor}
          strokeWidth={0.5}
          style={{ pointerEvents: "none" }}
        />

        <g clipPath={`url(#${barClipId})`}>
          {winPct > 0 && (
            <rect
              x={0}
              y={0}
              width={winWidth}
              height={barHeight}
              fill={COLORS.win || "#2e7d32"}
              opacity={0.95}
              style={{ pointerEvents: "none" }}
            />
          )}

          {drawPct > 0 && (
            <rect
              x={winWidth}
              y={0}
              width={drawWidth}
              height={barHeight}
              fill={COLORS.draw || "#9e9e9e"}
              opacity={0.95}
              style={{ pointerEvents: "none" }}
            />
          )}

          {lossPct > 0 && (
            <rect
              x={winWidth + drawWidth}
              y={0}
              width={lossWidth}
              height={barHeight}
              fill={COLORS.lose || "#a50026"}
              opacity={0.95}
              style={{ pointerEvents: "none" }}
            />
          )}
        </g>
      </g>

      {winLabel && (
        <text
          x={winLabelX}
          y={percentagesLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          textLength={winLabel.textLength}
          lengthAdjust={winLabel.textLength ? "spacingAndGlyphs" : undefined}
          fill="rgba(248,250,252,0.97)"
          style={{
            pointerEvents: "none",
            userSelect: "none",
            fontWeight: FONT_WEIGHT,
            fontSize: percentagesFontSize,
            fontVariantNumeric: "tabular-nums lining-nums",
            paintOrder: "stroke",
            stroke: "rgba(2,6,23,0.55)",
            strokeWidth: 0.7,
          }}
        >
          {winLabel.text}
        </text>
      )}

      {drawLabel && (
        <text
          x={drawLabelX}
          y={percentagesLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          textLength={drawLabel.textLength}
          lengthAdjust={drawLabel.textLength ? "spacingAndGlyphs" : undefined}
          fill="rgba(15,23,42,0.9)"
          style={{
            pointerEvents: "none",
            userSelect: "none",
            fontWeight: FONT_WEIGHT,
            fontSize: percentagesFontSize,
            fontVariantNumeric: "tabular-nums lining-nums",
            paintOrder: "stroke",
            stroke: "rgba(248,250,252,0.72)",
            strokeWidth: 0.55,
          }}
        >
          {drawLabel.text}
        </text>
      )}

      {lossLabel && (
        <text
          x={lossLabelX}
          y={percentagesLabelY}
          textAnchor="middle"
          dominantBaseline="middle"
          textLength={lossLabel.textLength}
          lengthAdjust={lossLabel.textLength ? "spacingAndGlyphs" : undefined}
          fill="rgba(248,250,252,0.97)"
          style={{
            pointerEvents: "none",
            userSelect: "none",
            fontWeight: FONT_WEIGHT,
            fontSize: percentagesFontSize,
            fontVariantNumeric: "tabular-nums lining-nums",
            paintOrder: "stroke",
            stroke: "rgba(2,6,23,0.55)",
            strokeWidth: 0.7,
          }}
        >
          {lossLabel.text}
        </text>
      )}
    </>
  );
});

TreeNodeWinFrequency.displayName = "TreeNodeWinFrequency";
