import { useCallback } from 'react';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { useAppDispatch } from '@/store';
import { ui } from '@/store/slices';
import { NodeTooltipData, TreeNodeData } from '@/shared/types';
import { gameCount } from '@/shared/lib/treeTransform';

export const getToolTipData = (node: HierarchyPointNode<TreeNodeData>): NodeTooltipData => {
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

export function useTreeTooltip() {
  const dispatch = useAppDispatch();

  const {
    tooltipOpen,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    showTooltip,
    hideTooltip
  } = useTooltip<NodeTooltipData>();

  const {
    TooltipInPortal,
    containerRef
  } = useTooltipInPortal({ detectBounds: true });

  const showTooltipFn = useCallback((e: React.MouseEvent) => {
    const target = e.currentTarget as SVGElement;
    if (!target || !target.ownerSVGElement) return;

    const nodeId = target.getAttribute('data-id');
    dispatch(ui.actions.setHover(nodeId));

    const coords = localPoint(target.ownerSVGElement, e);
    const tooltipData = JSON.parse(target.getAttribute('data-tooltip') || '{}');
    showTooltip({
      tooltipLeft: coords?.x,
      tooltipTop: coords?.y,
      tooltipData,
    });
  }, [dispatch, showTooltip]);

  const hideTooltipFn = useCallback(() => {
    dispatch(ui.actions.setHover(null));
    hideTooltip();
  }, [dispatch, hideTooltip]);

  return {
    tooltipOpen,
    tooltipData,
    tooltipLeft: tooltipLeft || 0,
    tooltipTop: tooltipTop || 0,
    tooltipOffsetLeft: 4,
    tooltipOffsetTop: 4,
    TooltipInPortal,
    showTooltip: showTooltipFn,
    hideTooltip: hideTooltipFn,
    tooltipContainerRef: containerRef,
  }
};
