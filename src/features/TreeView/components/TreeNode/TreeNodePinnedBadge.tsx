import { FaThumbtack } from "react-icons/fa6";

export interface TreeNodePinnedBadgeProps {
  nodeRectSize: number;
  isDarkMode: boolean;
}

export const TreeNodePinnedBadge = ({ nodeRectSize, isDarkMode }: TreeNodePinnedBadgeProps) => {
  const pinnedBadgeSize = Math.max(8, Math.round(nodeRectSize * 0.18));
  const pinnedBadgeRadius = Math.max(2, Math.round(pinnedBadgeSize * 0.28));
  const pinnedIconSize = pinnedBadgeSize * 0.52;
  const pinnedBadgeX = nodeRectSize / 2 - pinnedBadgeSize * 0.52;
  const pinnedBadgeY = -nodeRectSize / 2 + pinnedBadgeSize * 0.52;

  return (
    <g transform={`translate(${pinnedBadgeX}, ${pinnedBadgeY})`} style={{ pointerEvents: "none" }}>
      <rect
        x={-pinnedBadgeSize / 2}
        y={-pinnedBadgeSize / 2}
        width={pinnedBadgeSize}
        height={pinnedBadgeSize}
        rx={pinnedBadgeRadius}
        ry={pinnedBadgeRadius}
        fill={isDarkMode ? "rgba(30,41,59,0.62)" : "rgba(203,213,225,0.72)"}
        stroke={isDarkMode ? "rgba(148,163,184,0.12)" : "rgba(71,85,105,0.16)"}
        strokeWidth={0.6}
      />
      <FaThumbtack
        size={pinnedIconSize}
        className="text-amber-700 dark:text-amber-300"
        x={-pinnedIconSize / 2}
        y={-pinnedIconSize / 2}
      />
    </g>
  );
};
