import { useCallback, useContext, useLayoutEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { openingsApi } from '@/store/openingsApi';
import { selectCurrentId, selectTree } from '@/store/selectors';
import type { SafeAreaEdge, SafeAreaReservedRect } from '@/features/Tree/lib/safeAreaCamera';
import { TreeContainer } from './TreeContainer';
import { SVGDefs } from './SVGDefs';
import { TreeGrid } from './TreeGrid';
import { useTreeNavigation } from '../hooks';
import { TreeZoomControls, TreeHelp, TreeDPad, TreeMinimap, TreeErrorOverlays, TreeSettings } from './Overlays';
import { TreeDimensionsContext, ZoomContext } from '../context';

const BOARD_HUD_SAFE_AREA_SELECTOR = '[data-tree-safe-area="board-hud"]';

const serializeSafeAreaRects = (rects: SafeAreaReservedRect[]) =>
  rects
    .map((rect) => [
      rect.id,
      rect.left,
      rect.top,
      rect.right,
      rect.bottom,
      rect.edges.join('|'),
    ].join(':'))
    .join(';');

const getRelativeSafeAreaRect = (
  id: string,
  element: HTMLElement | null,
  sceneElement: HTMLElement,
  edges: SafeAreaEdge[],
): SafeAreaReservedRect | null => {
  if (!element) return null;

  const sceneRect = sceneElement.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const left = Math.max(0, elementRect.left - sceneRect.left);
  const top = Math.max(0, elementRect.top - sceneRect.top);
  const right = Math.min(sceneRect.width, elementRect.right - sceneRect.left);
  const bottom = Math.min(sceneRect.height, elementRect.bottom - sceneRect.top);

  if (right <= left || bottom <= top) return null;

  return {
    id,
    left,
    top,
    right,
    bottom,
    edges,
  };
};

export const TreeScene = () => {
  const { height, width } = useContext(TreeDimensionsContext);
  const { zoom, transformRef } = useContext(ZoomContext);
  const currentNodeId = useSelector((state: RootState) => selectCurrentId(state));
  const tree = useSelector((state: RootState) => selectTree(state));
  const hasTree = Boolean(tree);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const helpControlsRef = useRef<HTMLDivElement | null>(null);
  const bottomLeftControlsRef = useRef<HTMLDivElement | null>(null);
  const bottomRightControlsRef = useRef<HTMLDivElement | null>(null);
  const [safeAreaRects, setSafeAreaRects] = useState<SafeAreaReservedRect[]>([]);

  const measureSafeAreaRects = useCallback(() => {
    const sceneElement = sceneRef.current;
    if (!sceneElement) return;

    const boardHudElement = document.querySelector<HTMLElement>(BOARD_HUD_SAFE_AREA_SELECTOR);
    const measuredRects = [
      getRelativeSafeAreaRect('board-hud', boardHudElement, sceneElement, ['left']),
      getRelativeSafeAreaRect('help', helpControlsRef.current, sceneElement, ['top', 'right']),
      getRelativeSafeAreaRect('bottom-left-controls', bottomLeftControlsRef.current, sceneElement, ['bottom']),
      getRelativeSafeAreaRect(
        'bottom-right-controls',
        bottomRightControlsRef.current,
        sceneElement,
        ['bottom', 'right'],
      ),
    ].filter((rect): rect is SafeAreaReservedRect => rect !== null);

    setSafeAreaRects((current) => {
      if (serializeSafeAreaRects(current) === serializeSafeAreaRects(measuredRects)) {
        return current;
      }

      return measuredRects;
    });
  }, []);

  useLayoutEffect(() => {
    let animationFrame = 0;
    let secondAnimationFrame = 0;

    const scheduleMeasure = () => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(measureSafeAreaRects);
    };

    const resizeObserver = typeof ResizeObserver === 'undefined'
      ? null
      : new ResizeObserver(scheduleMeasure);
    const boardHudElement = document.querySelector<HTMLElement>(BOARD_HUD_SAFE_AREA_SELECTOR);

    [
      sceneRef.current,
      boardHudElement,
      helpControlsRef.current,
      bottomLeftControlsRef.current,
      bottomRightControlsRef.current,
    ].forEach((element) => {
      if (element) resizeObserver?.observe(element);
    });

    scheduleMeasure();
    secondAnimationFrame = window.requestAnimationFrame(scheduleMeasure);
    window.addEventListener('resize', scheduleMeasure);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(secondAnimationFrame);
      window.removeEventListener('resize', scheduleMeasure);
      resizeObserver?.disconnect();
    };
  }, [height, measureSafeAreaRects, width]);

  const {
    spring,
    updateSpring,
    handleZoom,
    centerCurrent,
  } = useTreeNavigation({ zoom, transformRef, width, height, safeAreaRects });
  const {
    isError,
    isFetching,
    error,
    refetch,
  } = openingsApi.useGetNodesQuery({ nodeId: currentNodeId });

  return (
    <div ref={sceneRef} className='relative h-full'>
      <svg
        className='touch-none'
        width={width}
        height={height}
        cursor={zoom.isDragging ? 'grabbing' : 'grab'}
        ref={zoom.containerRef}
        onMouseUp={updateSpring}
        onTouchEnd={updateSpring}
      >
        <SVGDefs/>

        <g transform={zoom.toString()}>
          <TreeGrid />
          <TreeContainer
            root={tree}
          />
        </g>
      </svg>

      <TreeErrorOverlays
        hasTree={hasTree}
        isError={isError}
        isFetching={isFetching}
        error={error}
        onRetry={() => void refetch()}
      />

      {/* top right overlays */}
      <div ref={helpControlsRef} className="absolute top-2 right-2">
        <TreeHelp />
      </div>

      {/* bottom left overlays */}
      <div
        ref={bottomLeftControlsRef}
        className="absolute bottom-2 left-2 z-40 flex flex-col items-start gap-2 pointer-events-none"
        data-testid="tree-bottom-left-controls"
      >
        <TreeDPad />
        <TreeSettings />
      </div>

      {/* bottom right overlays */}
      <div
        ref={bottomRightControlsRef}
        className="absolute bottom-0 right-0 z-40 flex flex-col items-end gap-2 pointer-events-none"
        data-testid="tree-bottom-right-controls"
      >
        <div className="pointer-events-auto mx-2">
          <TreeZoomControls handleZoom={handleZoom} onCenterCurrent={centerCurrent} />
        </div>
        <TreeMinimap tree={tree} spring={spring} />
      </div>
    </div>
  );
};
