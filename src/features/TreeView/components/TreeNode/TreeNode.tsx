import React, { useCallback, useContext, useMemo, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DEFAULT_POSITION } from "chess.js";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { UseTooltipParams } from "@visx/tooltip/lib/hooks/useTooltip";
import { animated, useSpring } from "react-spring";

import { RootState, AppDispatch } from "@/store";
import { selectCurrentId } from "@/store/selectors";
import { nav } from "@/store/slices";
import { TreeNodeData, NodeTooltipData } from "@/shared/types";
import { gameCount } from "@/shared/lib/tree";
import { MoveTreeContext } from "../../context/MoveTreeContext";
import { TreeNodeText } from "./TreeNodeText";
import { cn } from "@/shared/lib/cn";

const GRADIENTS = {
  current: 'url(#currentNodeGradient)',
  hover: 'url(#hoverNodeGradient)',
  default: 'url(#moveGradient)',
  loading: 'url(#loadingNodeGradient)',
};

const FILTERS = {
  current: 'url(#currentNodeFilter)',
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

const AnimatedGroup = animated(Group);

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
  const isFirstRender = useRef(true);
  useEffect(() => { isFirstRender.current = false; }, []);

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
    fill: loading ? GRADIENTS.loading :
          isCurrent ? GRADIENTS.current :
          GRADIENTS.default,
    filter: isCurrent ? FILTERS.current :
            FILTERS.default,
    className: cn([
      'transition-all duration-200 hover:scale-110',
      'stroke-[0.75] stroke-lightmode-900/10 dark:stroke-darkmode-400/10',
    ], { 
      ['stroke-1 stroke-lightmode-900/30 dark:stroke-darkmode-400/60']: minimap,
      ['animate-breathe']: loading,
      ['hover:fill-[url(#hoverNodeGradient)]']: !minimap && !loading,
    }),
  }), [nodeRadius, isCurrent, minimap, loading]);

  const springs = useSpring({
    immediate: loading || id.startsWith('loading:'),
    to: { 
      y: node.y, 
      x: node.x 
    },
    config: { tension: 170, friction: 26 },
  });

  return (
    <AnimatedGroup
      {...groupProps}
      top={springs.x}
      left={springs.y}
    >
      <rect {...rectProps} />
      {!minimap && !loading && <TreeNodeText move={node.data.move} fontSize={fontSize} />}
    </AnimatedGroup>
  );
};
