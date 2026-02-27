import { useCallback, useContext, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { animated } from "react-spring";
import { FluidValue } from '@react-spring/shared';

import { cn } from "@/shared/lib/cn";
import { RootState, useAppDispatch } from "@/store";
import { selectCurrentId, selectTreeSource } from "@/store/selectors";
import { nav, tree } from "@/store/slices";
import { TreeNodeData } from "@/shared/types";
import { TreeDimensionsContext } from "../context/TreeDimensionsContext";
import { TreeNodeText } from "./TreeNodeText";
import { TreeNodeButtons } from "./TreeNodeButtons";
import { TreeNodeLoadingIndicator } from "./TreeNodeLoadingIndicator";

const AnimatedGroup = animated(Group);

interface Props {
  node: HierarchyPointNode<TreeNodeData>;
  x: FluidValue<number>;
  y: FluidValue<number>;
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
  const currentNodeId = useSelector((s: RootState) => selectCurrentId(s));
  const source = useSelector((s: RootState) => selectTreeSource(s))
  const [hovered, setHovered] = useState(false);
  
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
          dispatch(tree.actions.setNodeCollapsed({ nodeId: node.parent?.data.id || '', source, value: false }));
        }
      },
      'data-fen': node.data.move?.after || DEFAULT_POSITION,
      'data-move': node.data.move?.lan || '',
      'data-id': node.data.id,
    };
  }, [node, minimap, isPlaceholder, source, dispatch]);

  const rectProps = useMemo(() => ({
    x: -nodeRadius,
    y: -nodeRadius,
    rx: 6,
    ry: 6,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    fill: currentNodeId === id ? 'url(#currentNodeGradient)' : 'url(#moveGradient)',
    filter: currentNodeId === id ? 'url(#currentNodeFilter)' : 'url(#nodeFilter)',
    className: cn('stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10', { 
      ['stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60']: minimap,
      ['transition-all duration-200 hover:scale-110 hover:brightness-125']: !minimap,
    }),
  }), [nodeRadius, minimap, currentNodeId, id]);

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
        <rect {...rectProps} />
        {!minimap && (
          <TreeNodeText
            move={node.data.move}
            isPlaceholder={isPlaceholder}
            fontSize={fontSize}
          />
        )}
        {loading && <TreeNodeLoadingIndicator radius={nodeRadius - 2} />}
      </g>

      {/* Collapsed nodes badge */}
      {badgeProps && (
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
