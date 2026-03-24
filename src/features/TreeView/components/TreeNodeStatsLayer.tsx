import { memo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeViewNode } from "@/shared/types";
import { COLORS } from "../lib/colors";
import { TreeNodeOverlayStats, TreeNodeStatColors } from "../lib/treeNodeOverlay";
import { TreeNodeMiniMoveBoard } from "./TreeNodeMiniMoveBoard";

type TreeNodeStatsLayerProps = {
  statsOverlay: TreeNodeOverlayStats;
  node: HierarchyPointNode<TreeViewNode>;
  nodeRadius: number;
  isDarkMode: boolean;
  currentNodeId: string;
  id: string;
  hovered: boolean;
  fontSize: number;
  statColors: TreeNodeStatColors;
};

export const TreeNodeStatsLayer = memo(({
  statsOverlay,
  node,
  nodeRadius,
  isDarkMode,
  currentNodeId,
  id,
  hovered,
  fontSize,
  statColors,
}: TreeNodeStatsLayerProps) => {
  return (
    <g>
      <g transform={`translate(${statsOverlay.boardX},${statsOverlay.boardY})`}>
        <TreeNodeMiniMoveBoard
          id={node.data.id}
          fen={statsOverlay.boardFen}
          from={statsOverlay.boardFrom}
          to={statsOverlay.boardTo}
          size={statsOverlay.boardSize}
          isDarkMode={isDarkMode}
          isCurrent={currentNodeId === id}
        />
      </g>

      {statsOverlay.showChrome && (
        <>
          <defs>
            <clipPath id={statsOverlay.barClipId}>
              <rect
                x={0}
                y={0}
                width={statsOverlay.barWidth}
                height={statsOverlay.barHeight}
                rx={Math.max(2, Math.round(statsOverlay.barHeight / 2))}
                ry={Math.max(2, Math.round(statsOverlay.barHeight / 2))}
              />
            </clipPath>
          </defs>

          {statsOverlay.frequencyLabel && (
            <text
              x={-nodeRadius}
              y={statsOverlay.moveLabelY}
              textAnchor="start"
              fill={statColors.primary}
              style={{
                pointerEvents: "none",
                userSelect: "none",
                fontWeight: 620,
                fontSize: Math.max(6, Math.round(statsOverlay.topRowFontSize * 0.92)),
                fontVariantNumeric: "tabular-nums lining-nums",
                letterSpacing: "0.01em",
              }}
            >
              {statsOverlay.frequencyLabel} |
            </text>
          )}

          <text
            x={nodeRadius}
            y={statsOverlay.moveLabelY}
            textAnchor="end"
            fill={statColors.secondary}
            style={{
              pointerEvents: "none",
              userSelect: "none",
              fontWeight: 500,
              fontSize: Math.max(6, Math.round(statsOverlay.topRowFontSize * 0.92)),
              fontVariantNumeric: "tabular-nums lining-nums",
              letterSpacing: "0.01em",
            }}
          >
            | {statsOverlay.gamesLabel}
          </text>

          <g transform={`translate(${statsOverlay.barX},${statsOverlay.barY})`}>
            <rect
              x={0}
              y={0}
              width={statsOverlay.barWidth}
              height={statsOverlay.barHeight}
              rx={Math.max(2, Math.round(statsOverlay.barHeight / 2))}
              ry={Math.max(2, Math.round(statsOverlay.barHeight / 2))}
              fill={statColors.barTrack}
              stroke={statColors.barStroke}
              strokeWidth={0.5}
              style={{ pointerEvents: "none" }}
            />

            <g clipPath={`url(#${statsOverlay.barClipId})`}>
              {statsOverlay.winPct > 0 && (
                <rect
                  x={0}
                  y={0}
                  width={statsOverlay.winWidth}
                  height={statsOverlay.barHeight}
                  fill={COLORS.win || "#2e7d32"}
                  opacity={0.95}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {statsOverlay.drawPct > 0 && (
                <rect
                  x={statsOverlay.winWidth}
                  y={0}
                  width={statsOverlay.drawWidth}
                  height={statsOverlay.barHeight}
                  fill={COLORS.draw || "#9e9e9e"}
                  opacity={0.95}
                  style={{ pointerEvents: "none" }}
                />
              )}

              {statsOverlay.lossPct > 0 && (
                <rect
                  x={statsOverlay.winWidth + statsOverlay.drawWidth}
                  y={0}
                  width={statsOverlay.lossWidth}
                  height={statsOverlay.barHeight}
                  fill={COLORS.lose || "#a50026"}
                  opacity={0.95}
                  style={{ pointerEvents: "none" }}
                />
              )}
            </g>
          </g>

          {statsOverlay.winLabel && (
            <text
              x={statsOverlay.winLabelX}
              y={statsOverlay.percentagesLabelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(248,250,252,0.97)"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                fontWeight: 700,
                fontSize: statsOverlay.percentagesFontSize,
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              {statsOverlay.winLabel}
            </text>
          )}

          {statsOverlay.drawLabel && (
            <text
              x={statsOverlay.drawLabelX}
              y={statsOverlay.percentagesLabelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(15,23,42,0.9)"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                fontWeight: 700,
                fontSize: statsOverlay.percentagesFontSize,
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              {statsOverlay.drawLabel}
            </text>
          )}

          {statsOverlay.lossLabel && (
            <text
              x={statsOverlay.lossLabelX}
              y={statsOverlay.percentagesLabelY}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(248,250,252,0.97)"
              style={{
                pointerEvents: "none",
                userSelect: "none",
                fontWeight: 700,
                fontSize: statsOverlay.percentagesFontSize,
                fontVariantNumeric: "tabular-nums lining-nums",
              }}
            >
              {statsOverlay.lossLabel}
            </text>
          )}
        </>
      )}

      <text
        x={0}
        y={statsOverlay.moveLabelY}
        textAnchor="middle"
        fill={isDarkMode ? "rgba(248,250,252,0.95)" : "rgba(15,23,42,0.9)"}
        style={{
          pointerEvents: "none",
          userSelect: "none",
          fontWeight: 760,
          fontSize: statsOverlay.moveLabelFontSize,
          letterSpacing: "0.01em",
        }}
      >
        {statsOverlay.moveLabel}
      </text>

      {statsOverlay.hasTranspositions && (
        <g transform={`translate(${nodeRadius - 8},${nodeRadius - 10})`}>
          <circle
            cx={0}
            cy={0}
            r={Math.max(3, Math.round(nodeRadius * 0.1))}
            fill={isDarkMode ? "rgba(252,211,77,0.92)" : "rgba(180,83,9,0.88)"}
            style={{ pointerEvents: "none" }}
          />
          {statsOverlay.transpositionLabel && (hovered || currentNodeId === id) && (
            <text
              x={-6}
              y={3}
              textAnchor="end"
              fill={isDarkMode ? "rgba(252,211,77,0.92)" : "rgba(146,64,14,0.9)"}
              style={{
                pointerEvents: "none",
                userSelect: "none",
                fontWeight: 600,
                fontSize: Math.max(6, Math.round(fontSize * 0.4)),
              }}
            >
              {statsOverlay.transpositionLabel}
            </text>
          )}
        </g>
      )}
    </g>
  );
});

TreeNodeStatsLayer.displayName = "TreeNodeStatsLayer";
