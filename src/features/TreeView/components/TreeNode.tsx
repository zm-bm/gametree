import React, { useCallback, useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { animated } from "react-spring";
import { FluidValue } from '@react-spring/shared';

import { cn } from "@/shared/lib/cn";
import { RootState, AppDispatch } from "@/store";
import { selectCurrentId } from "@/store/selectors";
import { nav } from "@/store/slices";
import { TreeNodeData, NodeTooltipData } from "@/shared/types";
import { gameCount } from "@/shared/lib/tree";
import { TreeDimensionsContext } from "../context/TreeDimensionsContext";
import { TreeNodeText } from "./TreeNodeText";
import { TreeNodeButtons } from "./TreeNodeButtons";
import { TreeNodeLoadingIndicator } from "./TreeNodeLoadingIndicator";

const AnimatedGroup = animated(Group);

/**
 * Extracts tooltip data from a tree node
 */
const getToolTipData = (node: HierarchyPointNode<TreeNodeData>): NodeTooltipData => {
  return {
    white: node.data.white,
    draws: node.data.draws,
    black: node.data.black,
    parent: node.parent ? gameCount(node.parent.data) : 0,
    rating: node.data.averageRating,
    eco: node.data.opening?.eco,
    name: node.data.opening?.name,
  };
};

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
  const dispatch = useDispatch<AppDispatch>();
  const { fontSize, nodeRadius } = useContext(TreeDimensionsContext);
  const currentNodeId = useSelector((s: RootState) => selectCurrentId(s));
  const [hovered, setHovered] = useState(false);

  const { id, loading } = node.data;
  const isCurrent = currentNodeId === id;

  const handleNodeClick = useCallback(() => {
    dispatch(nav.actions.navigateToId(id));
  }, [dispatch, id]);

  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  
  // Memoize node properties
  const nodeProps = useMemo(() => {
    if (minimap) return {};
    
    return {
      cursor: 'pointer',
      onClick: handleNodeClick,
      'data-tooltip': JSON.stringify(getToolTipData(node)),
      'data-fen': (node.data.move?.after || DEFAULT_POSITION),
      'data-move': (node.data.move?.lan || ''),
      'data-id': node.data.id,
    };
  }, [node, minimap, handleNodeClick]);

  // Memoize rectangle properties
  const rectProps = useMemo(() => ({
    x: -nodeRadius,
    y: -nodeRadius,
    rx: 6,
    ry: 6,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    fill: isCurrent ? 'url(#currentNodeGradient)' : 'url(#moveGradient)',
    filter: isCurrent ? 'url(#currentNodeFilter)' : 'url(#nodeFilter)',
    className: cn('stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10', { 
      ['stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60']: minimap,
      ['transition-all duration-200 hover:scale-110 hover:brightness-125']: !minimap,
    }),
  }), [nodeRadius, isCurrent, minimap]);


  return (
    <AnimatedGroup
      top={x}
      left={y}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Button drawer */}
      {!minimap && hovered && (
        <TreeNodeButtons
          node={node}
          nodeRadius={nodeRadius}
          onMouseLeave={handleMouseLeave}
        />
      )}

      {/* Move node*/}
      <g {...nodeProps}>
        <rect {...rectProps} />
        {!minimap && <TreeNodeText move={node.data.move} fontSize={fontSize} />}
        {loading && <TreeNodeLoadingIndicator radius={nodeRadius - 2} />}
      </g>
    </AnimatedGroup>
  );
};
