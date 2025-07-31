import { useContext, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { useTooltipInPortal } from '@visx/tooltip';
import { hierarchy } from '@visx/hierarchy';
import { useSpring } from '@react-spring/web'

import { ZoomState } from "../types/tree";
import { TreeDimsContext } from "../contexts/TreeContext";
import { SvgDefs } from './SvgDefs';
import { TreeG } from './TreeG';
import { TreeMinimap } from './TreeMinimap';
import { RootState } from '../store';
import { selectMovesList } from '../redux/gameSlice';
import { useGetOpeningsQuery } from '../redux/openingsApi';
import { TreePanel } from './TreePanel';

const defaultTransformMatrix: TransformMatrix = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
};

interface Props {
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
}

export const TreeSvg = ({ zoom }: Props) => {
  const { height, width } = useContext(TreeDimsContext);
  const moves = useSelector((state: RootState) => selectMovesList(state))
  const source = useSelector((state: RootState) => state.openings.source);
  const treeRoot = useSelector((state: RootState) => state.openings.root)

  // query for openings and add to store
  useGetOpeningsQuery({ moves, source });

  // create tree hierarchy
  const root = useMemo(() => treeRoot ? hierarchy(treeRoot) : null, [treeRoot]);

  // animate transitions by setting transform matrix
  const [, spring] = useSpring<TransformMatrix>(() => ({
    ...defaultTransformMatrix,
    onChange: ({ value }) => zoom.setTransformMatrix(value as TransformMatrix),
  }));

  // create tooltip portal
  const { TooltipInPortal, containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  });

  return (
    <div className='relative' ref={containerRef}>
      {root && <svg
        width={width}
        height={height}
        style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
        ref={zoom.containerRef}
        onMouseUp={() => spring.set(zoom.transformMatrix)}
        onTouchEnd={() => spring.set(zoom.transformMatrix)}
      >
        <SvgDefs width={width} height={height} />
        <TreeG
          root={root}
          zoom={zoom}
          spring={spring}
          TooltipInPortal={TooltipInPortal}
        />
        <TreeMinimap
          root={root}
          zoom={zoom}
        />
      </svg>}

      <TreePanel />
    </div>
  );
};

