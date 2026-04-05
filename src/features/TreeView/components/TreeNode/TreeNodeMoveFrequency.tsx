import { memo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { useSelector } from "react-redux";

import { RootState } from "@/store";
import { selectTreeSource } from "@/store/selectors";
import { TreeViewNode } from "@/types";

export interface TreeNodeMoveFrequencyProps {
  node: HierarchyPointNode<TreeViewNode>;
  nodeRectSize: number;
  frequencyTextColor: string;
  minimap?: boolean;
  fontSize: number;
};

export const TreeNodeMoveFrequency = memo(({
  node,
  nodeRectSize,
  frequencyTextColor,
  minimap = false,
  fontSize,
}: TreeNodeMoveFrequencyProps) => {
  const treeSource = useSelector((s: RootState) => selectTreeSource(s));
  const parentEdgeTotal = node.parent?.data.total ?? 0;
  const edgeTotal = node.data.edgeStats[treeSource].total;
  const positionTotal = node.data.positionStats[treeSource].total;
  const hasTranspositionSignal = parentEdgeTotal > 0 && positionTotal > parentEdgeTotal;
  const frequencyPct = parentEdgeTotal > 0 ? (edgeTotal / parentEdgeTotal) * 100 : null;
  if (minimap || frequencyPct === null) return null;

  const frequencyLabel = `${frequencyPct.toFixed(1)}%`;
  const nodeY = -Math.round(nodeRectSize / 2);
  const topInset = Math.max(1, Math.round(nodeRectSize * 0.04));
  const frequencyFontSize = Math.max(6, Math.round(fontSize * 0.5));
  const frequencyLabelY = nodeY + topInset + frequencyFontSize;

  return (
    <text
      x={0}
      y={frequencyLabelY}
      textAnchor="middle"
      fill={frequencyTextColor}
      fillOpacity={0.82}
      style={{
        pointerEvents: hasTranspositionSignal ? "auto" : "none",
        cursor: hasTranspositionSignal ? "help" : "default",
        userSelect: "none",
        fontWeight: 500,
        fontSize: frequencyFontSize,
        fontVariantNumeric: "tabular-nums lining-nums",
      }}
    >
      {frequencyLabel}
      {hasTranspositionSignal && (
        <tspan
          dx={Math.max(2, Math.round(frequencyFontSize * 0.2))}
          fill="rgba(251,191,36,0.95)"
          fontWeight={700}
        >
          T
        </tspan>
      )}
      {hasTranspositionSignal && (
        <title>
          {`Transpositions: position total ${positionTotal} exceeds parent total ${parentEdgeTotal}.`}
        </title>
      )}
    </text>
  );
});

TreeNodeMoveFrequency.displayName = "TreeNodeMoveFrequency";
