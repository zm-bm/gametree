import React, { useCallback, useContext, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";

import { TreeNodeData } from "../../types/chess";
import { AppDispatch } from "../../store";
import { SetHover } from "../../redux/gameSlice";
import { MoveTreeContext } from "../../contexts/MoveTreeContext";
import { GotoPath } from "../../thunks";
import { NodeTooltipData } from "../../hooks/useTreeTooltip";
import { TreeNodeText } from "./TreeNodeText";
import { gameCount } from "../../lib/tree";

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
  isCurrentNode: boolean,
  minimap?: boolean,
  showTooltip?: React.MouseEventHandler<SVGGElement>,
  hideTooltip?: UseTooltipParams<NodeTooltipData>['hideTooltip'],
}

export const TreeNode = ({
  node,
  isCurrentNode,
  minimap = false,
  showTooltip,
  hideTooltip,
}: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { fontSize, nodeRadius } = useContext(MoveTreeContext);
  const [isHovered, setIsHovered] = useState(false);

  const onMouseEnter = useCallback((e: React.MouseEvent<SVGGElement>) => {
    setIsHovered(true);
    showTooltip?.(e);
  }, [showTooltip]);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    dispatch(SetHover(null));
    if (hideTooltip) hideTooltip();
  }, [dispatch, hideTooltip]);

  const onClick = useCallback((e: React.MouseEvent<SVGGElement>) => {
    const path = e.currentTarget.getAttribute('data-path') || '';
    dispatch(GotoPath(path))
  }, [dispatch]);

  const groupProps = useMemo(() => ({
    style: minimap ? undefined : { cursor: 'pointer' },
    onMouseEnter: minimap ? undefined : onMouseEnter,
    onMouseMove: minimap ? undefined : onMouseEnter,
    onMouseLeave: minimap ? undefined : onMouseLeave,
    onClick: minimap ? undefined : onClick,
    'data-tooltip': minimap ? undefined : (getToolTipData ? JSON.stringify(getToolTipData(node)) : undefined),
    'data-fen': minimap ? undefined : (node.data.move?.after || DEFAULT_POSITION),
    'data-move': minimap ? undefined : (node.data.move?.lan || ''),
    'data-path': minimap ? undefined : node.data.id,
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
    className: minimap ? 'tree-node-minimap' : 'tree-node',
  }), [nodeRadius, isHovered, isCurrentNode, minimap]);

  return (
    <Group {...groupProps} top={node.x} left={node.y}>
      <rect {...rectProps} />
      {!minimap && <TreeNodeText move={node.data.move} fontSize={fontSize} />}
    </Group>
  );
};
