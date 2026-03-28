import { memo } from "react";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";

import { TreeViewNode } from "@/shared/types";

type TreeNodeCollapsedBadgeProps = {
  node: HierarchyPointNode<TreeViewNode>;
  nodeRadius: number;
  minimap?: boolean;
};

export const TreeNodeCollapsedBadge = memo(({ node, nodeRadius, minimap = false }: TreeNodeCollapsedBadgeProps) => {
  if (minimap || !node.data.childrenLoaded || !node.data.collapsed) return null;

  const label = `+${Math.min(node.data.childCount, 99)}`;
  const badgeHeight = 16;
  const badgeWidth = Math.max(22, label.length * 7 + 10);
  const badgeX = nodeRadius + 4 + badgeWidth / 2;

  return (
    <g
      transform={`translate(${badgeX},0)`}
      className="cursor-pointer select-none"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <rect
        x={-badgeWidth / 2}
        y={-badgeHeight / 2}
        rx={badgeHeight / 2}
        ry={badgeHeight / 2}
        width={badgeWidth}
        height={badgeHeight}
        filter="drop-shadow(0 0 2px rgba(255,255,255,0.2))"
        className="fill-slate-800/70 dark:fill-slate-200/70 stroke-white/10 dark:stroke-white/20"
        strokeWidth={1}
      />
      <text
        x={0}
        y={4}
        textAnchor="middle"
        className="text-[10px] font-semibold fill-white/85 dark:fill-gray-700/85"
      >
        {label}
      </text>
    </g>
  );
});

TreeNodeCollapsedBadge.displayName = "TreeNodeCollapsedBadge";
