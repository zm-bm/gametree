import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { useTooltipInPortal  } from '@visx/tooltip';
import { hierarchy } from '@visx/hierarchy';

import { SvgDefs } from './SvgDefs';
import useAnimateTransform from '../../hooks/useAnimateTransform';
import { TreeGroup } from './TreeGroup';
import { TreeDimsContext, ZoomState, defaultTransformMatrix } from "./MoveTree";
import { AppDispatch, RootState } from '../../store';
import { TreeMinimap } from './TreeMinimap';
import { selectMovesList } from '../../redux/gameSlice';
import { TreeSource, useGetOpeningsQuery } from '../../redux/openingsApi';
import { ADD_OPENINGS, SET_SOURCE } from '../../redux/treeSlice';

interface Props {
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
}
export const TreeSvg = ({ zoom }: Props) => {
  const { height, width } = useContext(TreeDimsContext);
  const dispatch = useDispatch<AppDispatch>();

  const moves = useSelector((state: RootState) => selectMovesList(state))
  const source = useSelector((state: RootState) => state.tree.source);
  const { data: openings }= useGetOpeningsQuery({ moves, source });
  useEffect(() => {
    if (openings) {
      dispatch(ADD_OPENINGS({ openings, moves }))
    }
  }, [openings])

  const treeRoot = useSelector((state: RootState) => state.tree.root)
  const root = useMemo(() => {
    if (treeRoot) {
      return hierarchy(treeRoot);
    }
  }, [treeRoot]);

  const [initialMatrix, setInitialMatrix] = useState<TransformMatrix>(defaultTransformMatrix);
  const [targetMatrix, setTargetMatrix] = useState<TransformMatrix>(defaultTransformMatrix);
  const updateInitialMatrix = useCallback(() => {
    setInitialMatrix(zoom.transformMatrix)
  }, [zoom]);
  useAnimateTransform(initialMatrix, targetMatrix, zoom, 250);

  const { TooltipInPortal, containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  })

  return root && (
    <div className='relative' ref={containerRef}>
      <svg
        width={width}
        height={height}
        style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        ref={zoom.containerRef}
        onWheel={updateInitialMatrix}
        onMouseUp={updateInitialMatrix}
        onTouchEnd={updateInitialMatrix}
      >
        <SvgDefs width={width} height={height} />
        <TreeGroup
          root={root}
          zoom={zoom}
          setTargetMatrix={setTargetMatrix}
          TooltipInPortal={TooltipInPortal}
        />
        <TreeMinimap
          root={root}
          zoom={zoom}
        />
      </svg>
      <div className='absolute top-0 right-0 flex flex-col p-1'>
        <select
          title='Data source'
          className='btn-primary'
          value={source}
          onChange={(e) => {
            dispatch(SET_SOURCE(e.target.value as TreeSource))
          }}
        >
          <option value='masters'>Masters games</option>
          <option value='lichess'>Lichess games</option>
        </select>
      </div>
    </div>
  );
};
