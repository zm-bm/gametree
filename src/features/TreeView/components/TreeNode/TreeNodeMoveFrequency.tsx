import { memo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeViewNode } from "@/shared/types";

type TreeNodeMoveFrequencyProps = {
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
  const parentEdgeTotal = node.parent?.data.total ?? 0;
  const edgeTotal = node.data.total;
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
        pointerEvents: "none",
        userSelect: "none",
        fontWeight: 500,
        fontSize: frequencyFontSize,
        fontVariantNumeric: "tabular-nums lining-nums",
      }}
    >
      {frequencyLabel}
    </text>
  );
});

TreeNodeMoveFrequency.displayName = "TreeNodeMoveFrequency";
