import { useCallback, useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { openingsApi } from '../../store/openingsApi';
import { MoveTreeContext, ZoomContext } from "../../contexts";
import { useTreeNavigation, useTreeTooltip } from '../../hooks';
import { selectCurrentId, selectTree, selectTreeSource } from '../../store/selectors';
import { RootState } from '../../store';
import { SVGDefs } from './SVGDefs';
import { Minimap } from '../Minimap/Minimap';
import { MoveTreeSvg } from './MoveTreeSvg';
import { TreeGrid } from './TreeGrid';
import { ZoomControls } from './ZoomControls';
import { TreeTooltip } from '../Tooltip/TreeTooltip';
import { TreeLegend } from './TreeLegend';
import { TreeDPad } from './TreeDPad';
import '../../styles/MoveTree.css';
import { TreeChips } from './TreeChips';

export const MoveTree = () => {
  const { height, width, rowHeight, columnWidth } = useContext(MoveTreeContext);
  const { zoom, transformRef } = useContext(ZoomContext);
  const currentNodeId = useSelector((state: RootState) => selectCurrentId(state))
  const source = useSelector((state: RootState) => selectTreeSource(state));
  const tree = useSelector((state: RootState) => selectTree(state));
  const nodeSize = useMemo(() => [rowHeight, columnWidth], [rowHeight, columnWidth]);
  const svgTransform = useMemo(() => zoom.toString(), [zoom]);
  const svgStyle = useMemo(() => ({ cursor: zoom.isDragging ? 'grabbing' : 'grab' }), [zoom.isDragging]);
  const tooltip = useTreeTooltip();
  const minimapSize = useMemo(() => Math.round(Math.min(width, height) * 0.3), [width, height]);
  const { spring, updateSpring, handleZoom } = useTreeNavigation({ zoom, transformRef, width, height });

  // Fetch openings data based on the current path and source
  const { isFetching: _f, isSuccess: _s } = openingsApi.useGetOpeningsQuery({ nodeId: currentNodeId, source });

  // TODO: add spring to zoom context -> update spring on wheel events
  const onWheel = useCallback(() => setTimeout(updateSpring, 20), [updateSpring]);
  const zoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom('out'), [handleZoom]);

  return (
    <div className='relative h-full' ref={tooltip.tooltipContainerRef}>
      <svg
        className='touch-none'
        width={width}
        height={height}
        style={svgStyle}
        ref={zoom.containerRef}
        onMouseUp={updateSpring}
        onTouchEnd={updateSpring}
        onWheel={onWheel}
      >
        <SVGDefs/>

        <g transform={svgTransform}>
          <TreeGrid />
          <MoveTreeSvg
            root={tree}
            nodeSize={nodeSize as [number, number]}
            showTooltip={tooltip.showTooltip}
            hideTooltip={tooltip.hideTooltip}
          />
        </g>
      </svg>


      {/* top left overlays */}
      <div className="absolute top-2 left-2 flex flex-row gap-1">
        <TreeChips />
      </div>

      {/* top right overlays */}
      <div className="absolute top-2 right-2">
        <TreeLegend />
      </div>

      {/* bottom left overlays */}
      <div className="absolute bottom-2 left-2">
        <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />
      </div>

      {/* bottom right overlays */}
      <div className="absolute bottom-0 right-0 space-y-2 flex flex-col items-end">
        <TreeDPad />
        <Minimap tree={tree} spring={spring} size={minimapSize} />
      </div>

      <TreeTooltip {...tooltip} />
    </div>
  );
};
