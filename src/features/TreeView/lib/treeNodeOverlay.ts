import { DEFAULT_POSITION } from "chess.js";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeSource, TreeViewNode } from "@/shared/types";

const compactNumber = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export type TreeNodeOverlayStats = {
  frequencyLabel: string | null;
  gamesLabel: string;
  transpositionLabel: string | null;
  showChrome: boolean;
  moveLabelY: number;
  moveLabel: string;
  topRowFontSize: number;
  boardX: number;
  boardY: number;
  boardSize: number;
  boardFen: string;
  boardFrom?: string;
  boardTo?: string;
  winPct: number;
  drawPct: number;
  lossPct: number;
  hasTranspositions: boolean;
  barX: number;
  barY: number;
  barWidth: number;
  barHeight: number;
  winWidth: number;
  drawWidth: number;
  lossWidth: number;
  barClipId: string;
  percentagesLabelY: number;
  percentagesFontSize: number;
  winLabel: string | null;
  drawLabel: string | null;
  lossLabel: string | null;
  winLabelX: number;
  drawLabelX: number;
  lossLabelX: number;
  moveLabelFontSize: number;
  hoverHitboxX: number;
  hoverHitboxY: number;
  hoverHitboxWidth: number;
  hoverHitboxHeight: number;
};

export type TreeNodeStatColors = {
  primary: string;
  secondary: string;
  barTrack: string;
  barStroke: string;
};

type BuildTreeNodeOverlayInput = {
  minimap: boolean;
  isPlaceholder: boolean;
  node: HierarchyPointNode<TreeViewNode>;
  source: TreeSource;
  nodeRadius: number;
  fontSize: number;
  boardOrientation: "white" | "black";
  hovered: boolean;
  currentNodeId: string;
  id: string;
};

export function buildTreeNodeOverlay({
  minimap,
  isPlaceholder,
  node,
  source,
  nodeRadius,
  fontSize,
  boardOrientation,
  hovered,
  currentNodeId,
  id,
}: BuildTreeNodeOverlayInput): TreeNodeOverlayStats | null {
  if (minimap || isPlaceholder) return null;

  const edgeTotal = node.data.total;
  const parentEdgeTotal = node.parent?.data.total ?? 0;
  const positionTotal = node.data.positionStats[source].total;

  const frequency = parentEdgeTotal > 0 ? (edgeTotal / parentEdgeTotal) * 100 : null;

  const winCount = boardOrientation === "white" ? node.data.white : node.data.black;
  const lossCount = boardOrientation === "white" ? node.data.black : node.data.white;
  const winPct = edgeTotal > 0 ? (winCount / edgeTotal) * 100 : 0;
  const drawPct = edgeTotal > 0 ? (node.data.draws / edgeTotal) * 100 : 0;
  const lossPct = edgeTotal > 0 ? (lossCount / edgeTotal) * 100 : 0;

  const hasTranspositions = parentEdgeTotal > 0 && positionTotal > parentEdgeTotal;
  const transpositionDelta = hasTranspositions ? Math.max(0, positionTotal - parentEdgeTotal) : null;
  const showChrome = hovered || currentNodeId === id;

  const boardSize = Math.max(20, nodeRadius * 2);
  const boardY = -nodeRadius;
  const boardX = -nodeRadius;
  const moveLabelY = boardY - Math.max(2, Math.round(nodeRadius * 0.08));
  const barWidth = Math.max(14, Math.round(boardSize * 0.94));
  const barHeight = Math.max(6, Math.round(nodeRadius * 0.16));
  const barX = boardX + (boardSize - barWidth) / 2;
  const barY = boardY + boardSize + Math.max(3, Math.round(nodeRadius * 0.1));

  const topHitPad = Math.max(8, Math.round(nodeRadius * 0.2));
  const rightHitPad = Math.max(8, Math.round(nodeRadius * 0.2));
  const bottomHitPad = barHeight + Math.max(10, Math.round(nodeRadius * 0.24));
  const hoverHitboxX = boardX;
  const hoverHitboxY = boardY - topHitPad;
  const hoverHitboxWidth = boardSize + rightHitPad;
  const hoverHitboxHeight = boardSize + topHitPad + bottomHitPad;

  const winWidth = (barWidth * winPct) / 100;
  const drawWidth = (barWidth * drawPct) / 100;
  const lossWidth = Math.max(0, barWidth - winWidth - drawWidth);
  const moveLabel = node.data.move?.san || node.data.move?.lan || "...";
  const winPctRounded = Math.round(winPct);
  const drawPctRounded = Math.round(drawPct);
  const lossPctRounded = Math.round(lossPct);
  const barClipId = `tree-node-bar-clip-${node.data.id.replace(/[^a-zA-Z0-9_-]/g, "_") || "root"}`;

  return {
    frequencyLabel: frequency !== null ? `${frequency.toFixed(1)}%` : null,
    gamesLabel: compactNumber.format(edgeTotal),
    transpositionLabel: transpositionDelta ? `+${compactNumber.format(transpositionDelta)}` : null,
    showChrome,
    moveLabelY,
    moveLabel,
    topRowFontSize: Math.max(7, Math.round(fontSize * 0.44)),
    boardX,
    boardY,
    boardSize,
    boardFen: node.data.move?.after || DEFAULT_POSITION,
    boardFrom: node.data.move?.from,
    boardTo: node.data.move?.to,
    winPct,
    drawPct,
    lossPct,
    hasTranspositions,
    barX,
    barY,
    barWidth,
    barHeight,
    winWidth,
    drawWidth,
    lossWidth,
    barClipId,
    percentagesLabelY: barY + barHeight / 2,
    percentagesFontSize: Math.max(6, Math.round(fontSize * 0.36)),
    winLabel: winPctRounded >= 10 ? `${winPctRounded}%` : null,
    drawLabel: drawPctRounded >= 10 ? `${drawPctRounded}%` : null,
    lossLabel: lossPctRounded >= 10 ? `${lossPctRounded}%` : null,
    winLabelX: barX + winWidth / 2,
    drawLabelX: barX + winWidth + drawWidth / 2,
    lossLabelX: barX + winWidth + drawWidth + lossWidth / 2,
    moveLabelFontSize: Math.max(8, Math.round(fontSize * 0.48)),
    hoverHitboxX,
    hoverHitboxY,
    hoverHitboxWidth,
    hoverHitboxHeight,
  };
}

export function getTreeNodeStatColors(isDarkMode: boolean): TreeNodeStatColors {
  if (isDarkMode) {
    return {
      primary: "rgba(248,250,252,0.90)",
      secondary: "rgba(226,232,240,0.74)",
      barTrack: "rgba(255,255,255,0.12)",
      barStroke: "rgba(255,255,255,0.26)",
    };
  }

  return {
    primary: "rgba(15,23,42,0.88)",
    secondary: "rgba(30,41,59,0.66)",
    barTrack: "rgba(15,23,42,0.15)",
    barStroke: "rgba(15,23,42,0.25)",
  };
}
