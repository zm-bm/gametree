import React, { useCallback, useContext, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";

import { RootState, AppDispatch } from "@/store";
import { selectCurrentId } from "@/store/selectors";
import { ui } from "@/store/slices";
import { TreeNodeData, NodeTooltipData } from "@/shared/types";
import { gameCount } from "@/shared/lib/tree";
import { MoveTreeContext } from "../../context/MoveTreeContext";
import { TreeNodeText } from "./TreeNodeText";
import { cn } from "@/shared/lib/cn";

const GRADIENTS = {
  current: 'url(#currentNodeGradient)',
  hover: 'url(#hoverNodeGradient)',
  default: 'url(#moveGradient)',
};

const FILTERS = {
  current: 'url(#currentNodeFilter)',
  hover: 'url(#hoverNodeFilter)',
  default: 'url(#nodeFilter)',
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
  'transition-all duration-500 hover:scale-110',
  'stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10',
];
const minimapNodeClass = 'stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60';

export const TreeNode = ({
  node,
  minimap = false,
  showTooltip,
  hideTooltip,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { fontSize, nodeRadius } = useContext(MoveTreeContext);
  const [isHovered, setIsHovered] = useState(false);
  const currentNodeId = useSelector((s: RootState) => selectCurrentId(s));
  const isCurrentNode = currentNodeId === node.data.id;

  const onMouseEnter = useCallback((e: React.MouseEvent<SVGGElement>) => {
    setIsHovered(true);
    showTooltip?.(e);
  }, [showTooltip]);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    if (hideTooltip) hideTooltip();
  }, [hideTooltip]);

  const onClick = useCallback(() => {
    dispatch(ui.actions.setCurrent(node.data.id))
  }, [dispatch, node]);

  const groupProps = useMemo(() => ({
    style: minimap ? undefined : { cursor: 'pointer' },
    onMouseEnter: minimap ? undefined : onMouseEnter,
    onMouseMove: minimap ? undefined : onMouseEnter,
    onMouseLeave: minimap ? undefined : onMouseLeave,
    onClick: minimap ? undefined : onClick,
    'data-tooltip': minimap ? undefined : (getToolTipData ? JSON.stringify(getToolTipData(node)) : undefined),
    'data-fen': minimap ? undefined : (node.data.move?.after || DEFAULT_POSITION),
    'data-move': minimap ? undefined : (node.data.move?.lan || ''),
    'data-id': minimap ? undefined : node.data.id,
  }), [minimap, onMouseEnter, onMouseLeave, onClick, node]);

  const rectProps = useMemo(() => ({
    x: -nodeRadius,
    y: -nodeRadius,
    rx: 8,
    ry: 8,
    width: nodeRadius * 2,
    height: nodeRadius * 2,
    fill: isCurrentNode ? GRADIENTS.current : isHovered ? GRADIENTS.hover : GRADIENTS.default,
    filter: isHovered ? FILTERS.hover : isCurrentNode ? FILTERS.current : FILTERS.default,
    className: cn(nodeClass, { [minimapNodeClass]: minimap }),
  }), [nodeRadius, isHovered, isCurrentNode, minimap]);

  return (
    <Group {...groupProps} top={node.x} left={node.y}>
      <rect {...rectProps} />
      {!minimap && <TreeNodeText move={node.data.move} fontSize={fontSize} />}
    </Group>
  );
};
