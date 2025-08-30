import React, { useCallback, useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";

import { RootState, AppDispatch } from "@/store";
import { selectCurrentId } from "@/store/selectors";
import { nav, ui } from "@/store/slices";
import { TreeNodeData, NodeTooltipData } from "@/shared/types";
import { gameCount } from "@/shared/lib/tree";
import { MoveTreeContext } from "../../context/MoveTreeContext";
import { TreeNodeText } from "./TreeNodeText";
import { cn } from "@/shared/lib/cn";

const GRADIENTS = {
  current: 'url(#currentNodeGradient)',
  hover: 'url(#hoverNodeGradient)',
  default: 'url(#moveGradient)',
  // loading: 'url(#loadingNodeGradient)', // Add gradient for loading state
};

const FILTERS = {
  current: 'url(#currentNodeFilter)',
  hover: 'url(#hoverNodeFilter)',
  default: 'url(#nodeFilter)',
  // loading: 'url(#loadingNodeFilter)', // Add filter for loading state
};

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
  minimap?: boolean,
  showTooltip?: React.MouseEventHandler<SVGGElement>,
  hideTooltip?: UseTooltipParams<NodeTooltipData>['hideTooltip'],
}

const nodeClass = [
  'transition-all duration-200 hover:scale-110',
  'stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10',
];

export const TreeNode = ({
  node,
  minimap = false,
  showTooltip,
  hideTooltip,
}: Props) => {
  const { id, loading } = node.data;

  const dispatch = useDispatch<AppDispatch>();
  const { fontSize, nodeRadius } = useContext(MoveTreeContext);
  const currentNodeId = useSelector((s: RootState) => selectCurrentId(s));
  const isCurrent = useMemo(() => currentNodeId === id, [currentNodeId, id]);

  const onClick = useCallback(() => {
    dispatch(nav.actions.navigateToId(id));
  }, [dispatch, id]);

  const groupProps = useMemo(() => {
    return (!minimap && !loading) ? {
      style: { cursor: 'pointer' },
      onMouseEnter: showTooltip,
      onMouseMove: showTooltip,
      onMouseLeave: hideTooltip,
      onClick: onClick,
      'data-tooltip': JSON.stringify(getToolTipData(node)),
      'data-fen': (node.data.move?.after || DEFAULT_POSITION),
      'data-move': (node.data.move?.lan || ''),
      'data-id': node.data.id,
    } : {};
  }, [node, minimap, loading, showTooltip, hideTooltip, onClick]);

  const rectProps = useMemo(() => ({
    x: -nodeRadius,
    y: -nodeRadius,
    rx: 6,
    ry: 6,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    fill: loading ? GRADIENTS.default : 
          isCurrent ? GRADIENTS.current : 
          GRADIENTS.default,
    filter: loading ? FILTERS.default : 
            isCurrent ? FILTERS.current : 
            FILTERS.default,
    className: cn(nodeClass, { 
      [ 'stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60']: minimap,
      ['hover:fill-[url(#hoverNodeGradient)] hover:filter-[url(#hoverNodeFilter)]']: !minimap && !loading,
      ['animate-tree-pulse']: loading,
    }),
  }), [nodeRadius, isCurrent, minimap, loading]);

  return (
    <Group {...groupProps} top={node.x} left={node.y}>
      <rect {...rectProps} />
      {!minimap && !loading && <TreeNodeText move={node.data.move} fontSize={fontSize} />}
    </Group>
  );
};
