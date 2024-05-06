import { useCallback, useContext, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { localPoint } from '@visx/event';
import { useTooltip, useTooltipInPortal  } from '@visx/tooltip';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { hierarchy } from '@visx/hierarchy';

import { SvgDefs } from './SvgDefs';
import useAnimateTransform from '../../hooks/useAnimateTransform';
import { TreeG } from './TreeG';
import { TreeNode } from '../../chess';
import { TreeTooltip } from './TreeTooltip';
import { TreeDimsContext, ZoomState, defaultTransformMatrix } from "./MoveTree";
import { RootState } from '../../store';
import { TreeMinimap } from './TreeMinimap';
import { selectMovesList } from '../../redux/gameSlice';
import { useGetOpeningByMovesQuery } from '../../redux/openingsApi';

interface Props {
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
}
export const TreeSvg = ({ zoom }: Props) => {
  const { height, width } = useContext(TreeDimsContext);
  const [options, setOptions] = useState(false);

  const moves = useSelector((state: RootState) => selectMovesList(state))
  useGetOpeningByMovesQuery(moves);

  // build move tree / coordinates
  const treeRoot = useSelector((state: RootState) => state.game.root)
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
  useAnimateTransform(initialMatrix, targetMatrix, zoom, 500);

  const tooltip = useTooltip<HierarchyPointNode<TreeNode>>();
  const { containerRef } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  })
  const showNodeTooltip = useCallback((node: HierarchyPointNode<TreeNode>): React.MouseEventHandler => {
    return (event) => {
      const coords = localPoint(event);
        if (coords) {
          const { transformMatrix: m } = zoom;
          tooltip.showTooltip({
            tooltipLeft: node.y * m.scaleX + m.translateX,
            tooltipTop: node.x * m.scaleY + m.translateY,
            tooltipData: node,
          });
        }
    };
  }, [zoom]);

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
        <TreeG
          root={root}
          zoom={zoom}
          setTargetMatrix={setTargetMatrix}
          showNodeTooltip={showNodeTooltip}
          hideTooltip={tooltip.hideTooltip}
        />
        <TreeMinimap
          root={root}
          zoom={zoom}
        />
      </svg>
      <TreeTooltip
        tooltip={tooltip}
        transformMatrix={zoom.transformMatrix}
      />
      <div className='absolute top-0 right-0 flex flex-col p-1'>
        <button
          className='btn-primary'
          onClick={() => setOptions(!options)}
        >
          { options ? 'Hide' : 'Show' } Options
        </button>
        {
          options &&
          <div> hello!</div>
        }
      </div>
    </div>
  );
};
