import { useCallback, useContext } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { openingsApi } from '@/store/openingsApi';
import { selectCurrentId, selectTree, selectTreeSource } from '@/store/selectors';
import { TreeContainer } from './TreeContainer';
import { SVGDefs } from './SVGDefs';
import { TreeGrid } from './TreeGrid';
import { useTreeNavigation } from '../hooks';
import { TreeZoomControls, TreeLegend, TreeDPad, TreeChips, TreeMinimap } from './Overlays';
import { TreeDimensionsContext, ZoomContext } from "../context";

export const Tree = () => {
  const { height, width } = useContext(TreeDimensionsContext);
  const { zoom, transformRef } = useContext(ZoomContext);
  const currentNodeId = useSelector((state: RootState) => selectCurrentId(state))
  const source = useSelector((state: RootState) => selectTreeSource(state));
  const tree = useSelector((state: RootState) => selectTree(state));

  const { spring, updateSpring, handleZoom } = useTreeNavigation({ zoom, transformRef, width, height });
  const { isError } = openingsApi.useGetNodesQuery({ nodeId: currentNodeId, source });

  // TODO: add spring to zoom context -> update spring on wheel events
  const onWheel = useCallback(() => setTimeout(updateSpring, 20), [updateSpring]);

  return (
    <div className='relative h-full'>
      <svg
        className='touch-none'
        width={width}
        height={height}
        cursor={zoom.isDragging ? 'grabbing' : 'grab'}
        ref={zoom.containerRef}
        onMouseUp={updateSpring}
        onTouchEnd={updateSpring}
        onWheel={onWheel}
      >
        <SVGDefs/>

        <g transform={zoom.toString()}>
          <TreeGrid />
          <TreeContainer
            root={tree}
          />
        </g>
      </svg>

      {/* top left overlays */}
      <div className="absolute top-2 left-2">
        <TreeChips openingsError={isError} />
      </div>

      {/* top right overlays */}
      <div className="absolute top-2 right-2">
        <TreeLegend />
      </div>

      {/* bottom left overlays */}
      <div className="absolute bottom-2 left-2">
        <TreeZoomControls handleZoom={handleZoom} />
      </div>

      {/* bottom right overlays */}
      <div className="absolute bottom-0 right-0 space-y-2 flex flex-col items-end">
        <TreeDPad />
        <TreeMinimap tree={tree} spring={spring} />
      </div>
    </div>
  );
};
