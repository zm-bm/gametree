import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { localPoint } from '@visx/event';

import { AppDispatch } from '../store';
import { ui } from '../store/slices';

export type NodeTooltipData = {
  white: number;
  draws: number;
  black: number;
  parent: number;
  rating: number;
  eco?: string;
  name?: string;
};

export function useTreeTooltip() {
  const dispatch = useDispatch<AppDispatch>();

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
