import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { animated } from "react-spring";
import { FluidValue } from '@react-spring/shared';

import { RootState, useAppDispatch } from "@/store";
import { selectBoardOrientation, selectCurrentVisibleId, selectTreeSource } from "@/store/selectors";
import { nav, tree } from "@/store/slices";
import { TreeSource, TreeViewNode } from "@/shared/types";
import { TreeDimensionsContext } from "../context/TreeDimensionsContext";
import { TreeNodeButtons } from "./TreeNodeButtons";
import { TreeNodeLoadingIndicator } from "./TreeNodeLoadingIndicator";
import { useMedia } from "@/shared/hooks";
import { TreeNodeStatsLayer } from "./TreeNodeStatsLayer";
import { buildTreeNodeOverlay, getTreeNodeStatColors } from "../lib/treeNodeOverlay";

const AnimatedGroup = animated(Group);

interface Props {
  node: HierarchyPointNode<TreeViewNode>;
  x: FluidValue<number> | number;
  y: FluidValue<number> | number;
  minimap?: boolean;
}

export const TreeNode = ({
  node,
  x,
  y,
  minimap = false,
}: Props) => {
  const { id, loading } = node.data;
  const isPlaceholder = node.parent?.data.collapsed ?? false;

  const dispatch = useAppDispatch();
  const { fontSize, nodeRadius } = useContext(TreeDimensionsContext);
  const currentNodeId = useSelector((s: RootState) => selectCurrentVisibleId(s));
  const source = useSelector((s: RootState) => selectTreeSource(s));
  const boardOrientation = useSelector((s: RootState) => selectBoardOrientation(s));
  const [hovered, setHovered] = useState(false);
  const prefersDark = useMedia("(prefers-color-scheme: dark)");
  const [darkClassActive, setDarkClassActive] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const sync = () => setDarkClassActive(root.classList.contains("dark"));

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  const isDarkMode = darkClassActive || prefersDark;

  const statsOverlay = useMemo(() => {
    return buildTreeNodeOverlay({
      minimap,
      isPlaceholder,
      node,
      source: source as TreeSource,
      nodeRadius,
      fontSize,
      boardOrientation,
      hovered,
      currentNodeId,
      id,
    });
  }, [minimap, isPlaceholder, node, source, nodeRadius, fontSize, boardOrientation, hovered, currentNodeId, id]);

  const statColors = useMemo(() => getTreeNodeStatColors(isDarkMode), [isDarkMode]);
  
  const nodeProps = useMemo(() => {
    if (minimap) return {};
    
    return {
      cursor: 'pointer',
      onClick: () => {
        if (!isPlaceholder) {
          // Navigate to the selected node
          dispatch(nav.actions.navigateToId(node.data.id));
        } else {
          // Expand the parent node
          dispatch(tree.actions.setNodeCollapsed({ nodeId: node.parent?.data.id || '', value: false }));
        }
      },
      'data-fen': node.data.move?.after || DEFAULT_POSITION,
      'data-move': node.data.move?.lan || '',
      'data-id': node.data.id,
    };
  }, [node, minimap, isPlaceholder, dispatch]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);

  const badgeProps = useMemo(() => {
    const hasHidden = node.data.childrenLoaded && node.data.collapsed;
    
    if (!hasHidden) return null;
    
    const label = `+${Math.min(node.data.childCount, 99)}`;
    const badgeH = 16;
    const badgeW = Math.max(22, label.length * 7 + 10);
    const badgeX = nodeRadius + 4 + badgeW/2; // right edge of parent
    
    return {
      label,
      badgeH,
      badgeW,
      badgeX,
    };
  }, [node.data.childrenLoaded, node.data.collapsed, node.data.childCount, nodeRadius]);

  return (
    <AnimatedGroup
      top={x}
      left={y}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Button drawer */}
      {!minimap && !isPlaceholder && hovered && (
        <TreeNodeButtons
          node={node}
          nodeRadius={nodeRadius}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Move node*/}
      <g {...nodeProps}>
        {!minimap && (
          <rect
            x={statsOverlay?.hoverHitboxX ?? -nodeRadius}
            y={statsOverlay?.hoverHitboxY ?? -nodeRadius}
            width={statsOverlay?.hoverHitboxWidth ?? nodeRadius * 2}
            height={statsOverlay?.hoverHitboxHeight ?? nodeRadius * 2}
            fill="transparent"
            style={{ pointerEvents: "all" }}
          />
        )}

        {!minimap && (
          <>
            {statsOverlay && (
              <TreeNodeStatsLayer
                statsOverlay={statsOverlay}
                node={node}
                nodeRadius={nodeRadius}
                isDarkMode={isDarkMode}
                currentNodeId={currentNodeId}
                id={id}
                hovered={hovered}
                fontSize={fontSize}
                statColors={statColors}
              />
            )}
          </>
        )}
        {minimap && (
          <g>
            <rect
              x={-nodeRadius}
              y={-nodeRadius}
              rx={3}
              ry={3}
              width={nodeRadius * 2}
              height={nodeRadius * 2}
              fill={currentNodeId === id ? "url(#currentNodeGradient)" : "url(#moveGradient)"}
              stroke={currentNodeId === id ? "rgba(245,158,11,0.95)" : isDarkMode ? "rgba(255,255,255,0.3)" : "rgba(15,23,42,0.25)"}
              strokeWidth={currentNodeId === id ? 1.4 : 0.8}
              style={{ pointerEvents: "none" }}
            />
          </g>
        )}
        {loading && <TreeNodeLoadingIndicator radius={nodeRadius - 2} />}
      </g>

      {/* Collapsed nodes badge */}
      {!minimap && badgeProps && (
        <g
          transform={`translate(${badgeProps.badgeX},0)`}
          className="cursor-pointer select-none"
          onClick={(e)=>{ e.stopPropagation();  }}
        >
          <rect
            x={-badgeProps.badgeW/2}
            y={-badgeProps.badgeH/2}
            rx={badgeProps.badgeH/2}
            ry={badgeProps.badgeH/2}
            width={badgeProps.badgeW}
            height={badgeProps.badgeH}
            filter="drop-shadow(0 0 2px rgba(255,255,255,0.2))"
            className="fill-slate-800/70 dark:fill-slate-200/70
                      stroke-white/10 dark:stroke-white/20"
            strokeWidth={1}
          />
          <text
            x={0}
            y={4}
            textAnchor="middle"
            className="text-[10px] font-semibold fill-white/85 dark:fill-gray-700/85"
          >
              {badgeProps.label}
          </text>
        </g>
      )}
    </AnimatedGroup>
  );
};
