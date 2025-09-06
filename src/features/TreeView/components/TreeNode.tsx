import React, { useCallback, useContext, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
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
  node: HierarchyPointNode<TreeNodeData>,
  x: FluidValue<number>,
  y: FluidValue<number>,
  minimap?: boolean,
  showTooltip?: React.MouseEventHandler<SVGGElement>,
  hideTooltip?: UseTooltipParams<NodeTooltipData>['hideTooltip'],
}

const AnimatedGroup = animated(Group);

export const TreeNode = ({
  node,
  x,
  y,
  minimap = false,
  showTooltip,
  hideTooltip,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { fontSize, nodeRadius } = useContext(TreeDimensionsContext);
  const currentNodeId = useSelector((s: RootState) => selectCurrentId(s));
  const { id, loading } = node.data;
  const isCurrent = currentNodeId === id;
  const loadingRadius = nodeRadius - 2;

  const onClick = useCallback(() => {
    dispatch(nav.actions.navigateToId(id));
  }, [dispatch, id]);

  const groupProps = useMemo(() => {
    return !minimap ? {
      style: { cursor: 'pointer' },
      onMouseEnter: showTooltip,
      onMouseMove: showTooltip,
      onMouseLeave: hideTooltip,
      onClick,
      'data-tooltip': JSON.stringify(getToolTipData(node)),
      'data-fen': (node.data.move?.after || DEFAULT_POSITION),
      'data-move': (node.data.move?.lan || ''),
      'data-id': node.data.id,
    } : {};
  }, [node, minimap, showTooltip, hideTooltip, onClick]);

  const rectProps = useMemo(() => ({
    x: -nodeRadius,
    y: -nodeRadius,
    rx: 6,
    ry: 6,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    fill: isCurrent ? 'url(#currentNodeGradient)' :  'url(#moveGradient)',
    filter: isCurrent ? 'url(#currentNodeFilter)' :  'url(#nodeFilter)',
    className: cn('stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10', { 
      ['stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60']: minimap,
      ['transition-all duration-200 hover:scale-110 hover:brightness-125']: !minimap,
    }),
  }), [nodeRadius, isCurrent, minimap]);

  return (
    <AnimatedGroup
      {...groupProps}
      top={x}
      left={y}
    >
      <rect {...rectProps} />

      {/* Move Text */}
      {!minimap && <TreeNodeText move={node.data.move} fontSize={fontSize} />}

      {/* Loading Indicator */}
      {loading && (
        <g className="pointer-events-none">
          <circle
            r={loadingRadius}
            className="fill-none stroke-amber-700/20 dark:stroke-amber-300/20"
            style={{ strokeWidth: 1.5 }}
          />
          <circle
            r={loadingRadius}
            className={'fill-none stroke-white/90 dark:stroke-white/80 animate-spin-slow'}
            strokeDasharray={loadingRadius * Math.PI / 2}
            strokeDashoffset={loadingRadius * Math.PI / 2}
            style={{ strokeWidth: 2, strokeLinecap: 'round' }}
          />
        </g>
      )}
    </AnimatedGroup>
  );
};
