import { useContext } from 'react';
import { useSelector } from 'react-redux';

import { RootState } from '@/store';
import { openingsApi } from '@/store/openingsApi';
import { selectCurrentId, selectTree } from '@/store/selectors';
import { TreeContainer } from './TreeContainer';
import { SVGDefs } from './SVGDefs';
import { TreeGrid } from './TreeGrid';
import { useTreeNavigation } from '../hooks';
import { TreeZoomControls, TreeHelp, TreeDPad, TreeMinimap, TreeErrorOverlays, TreeSettings } from './Overlays';
import { TreeDimensionsContext, ZoomContext } from "../context";

export const Tree = () => {
  const { height, width } = useContext(TreeDimensionsContext);
  const { zoom, transformRef } = useContext(ZoomContext);
  const currentNodeId = useSelector((state: RootState) => selectCurrentId(state))
  const tree = useSelector((state: RootState) => selectTree(state));
  const hasTree = Boolean(tree);

  const {
    spring,
    updateSpring,
    handleZoom,
  } = useTreeNavigation({ zoom, transformRef, width, height });
  const {
    isError,
    isFetching,
    error,
    refetch,
  } = openingsApi.useGetNodesQuery({ nodeId: currentNodeId });

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
      <div className="absolute top-2 right-2">
        <TreeHelp />
      </div>

      {/* bottom left overlays */}
      <div
        className="absolute bottom-2 left-2 z-40 flex flex-col items-start gap-2 pointer-events-none"
        data-testid="tree-bottom-left-controls"
      >
        <TreeDPad />
        <TreeSettings />
      </div>

      {/* bottom right overlays */}
      <div
        className="absolute bottom-0 right-0 z-40 flex flex-col items-end gap-2 pointer-events-none"
        data-testid="tree-bottom-right-controls"
      >
        <div className="pointer-events-auto mx-2">
          <TreeZoomControls handleZoom={handleZoom} />
        </div>
        <TreeMinimap tree={tree} spring={spring} />
      </div>
    </div>
  );
};
