import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { hierarchy } from '@visx/hierarchy';

import { MoveTreeContext } from "../../contexts/MoveTreeContext";
import { SVGDefs } from './SVGDefs';
import { Minimap } from '../Minimap/Minimap';
import { RootState } from '../../store';
import { selectPath } from '../../redux/gameSlice';
import { useGetOpeningsQuery } from '../../redux/openingsApi';
import { selectDataSource, selectTreeRoot } from '../../redux/treeSlice';
import { ZoomContext } from '../../contexts/ZoomContext';
import { useTreeNavigation } from '../../hooks/useTreeNavigation';
import { useTreeTooltip } from '../../hooks/useTreeTooltip';
import { MoveTreeSvg } from './MoveTreeSvg';
import { TreeGrid } from './TreeGrid';
import { ZoomControls } from './ZoomControls';
import { TreeTooltip } from '../Tooltip/TreeTooltip';
import { TreeLegend } from '../TreeControls/TreeLegend';
import '../../styles/MoveTree.css';

export const MoveTree = () => {
  const { height, width, rowHeight, columnWidth } = useContext(MoveTreeContext);
  const { zoom, transformRef } = useContext(ZoomContext);
  const path = useSelector((state: RootState) => selectPath(state))
  const treeRoot = useSelector((state: RootState) => selectTreeRoot(state));
  const source = useSelector((state: RootState) => selectDataSource(state));
  const root = useMemo(() => treeRoot ? hierarchy(treeRoot) : null, [treeRoot]);
  const nodeSize = useMemo(() => [rowHeight, columnWidth], [rowHeight, columnWidth]);
  const svgTransform = useMemo(() => zoom.toString(), [zoom]);
  const svgStyle = useMemo(() => ({ cursor: zoom.isDragging ? 'grabbing' : 'grab' }), [zoom.isDragging]);
  const tooltip = useTreeTooltip();

  const { 
    spring,
    currentNodeRef, 
    updateCurrentNode,
    updateSpring,
    handleZoom,
    panToNode,
  } = useTreeNavigation({ zoom, transformRef, width, height, source });

  // Fetch openings data based on the current path and source
  const { isFetching, isSuccess } = useGetOpeningsQuery({ path, source });

  useEffect(() => {
    if (isSuccess && !isFetching && currentNodeRef.current) {
      panToNode(currentNodeRef.current);
    }
  }, [isSuccess, isFetching, currentNodeRef, panToNode]);

  // TODO: add spring to zoom context -> update spring on wheel events
  const onWheel = useCallback(() => setTimeout(updateSpring, 20), [updateSpring]);
  const zoomIn = useCallback(() => handleZoom('in'), [handleZoom]);
  const zoomOut = useCallback(() => handleZoom('out'), [handleZoom]);

  return (
    <div className='relative' ref={tooltip.tooltipContainerRef}>
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

        {/* Move tree group */}
        <g transform={svgTransform}>
          <TreeGrid />
          <MoveTreeSvg
            root={root}
            nodeSize={nodeSize as [number, number]}
            currentNodeRef={currentNodeRef}
            showTooltip={tooltip.showTooltip}
            hideTooltip={tooltip.hideTooltip}
            onCurrentNodeChange={updateCurrentNode}
          />
        </g>
      </svg>

      { root && <Minimap root={root} spring={spring} width={260} height={260}  /> }
      <ZoomControls zoomIn={zoomIn} zoomOut={zoomOut} />
      {/* <div className="absolute top-2 right-2 backdrop-blur-sm bg-white/90 rounded-xl shadow-lg border border-gray-200 w-[260px] overflow-hidden transition-all duration-200 hover:shadow-xl">
        <TreeLegend />
      </div> */}
      <TreeTooltip {...tooltip} />
    </div>
  );
};
