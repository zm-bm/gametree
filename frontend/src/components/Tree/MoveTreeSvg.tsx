import { useCallback, useState } from 'react';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { localPoint } from '@visx/event';
import { useTooltip, useTooltipInPortal  } from '@visx/tooltip';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { SvgDefs } from './SvgDefs';
import useAnimateTransform from '../../hooks/useAnimateTransform';
import { MoveTreeG } from './MoveTreeG';
import { TreeNode } from '../../chess';
import { TreeTooltip } from './TreeTooltip';
import { ZoomState, defaultTransformMatrix } from "./MoveTree";

interface Props {
  width: number,
  height: number,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
}
export const MoveTreeSvg = ({ width, height, zoom }: Props) => {
  const [initialMatrix, setInitialMatrix] = useState<TransformMatrix>(defaultTransformMatrix);
  const [targetMatrix, setTargetMatrix] = useState<TransformMatrix>(defaultTransformMatrix);
  const [options, setOptions] = useState(false);
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

  return (
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
        <MoveTreeG
          width={width}
          height={height}
          zoom={zoom}
          setTargetMatrix={setTargetMatrix}
          showNodeTooltip={showNodeTooltip}
          hideTooltip={tooltip.hideTooltip}
        />
      </svg>
      <div
        className='absolute top-0 right-0 flex flex-col p-1'
      >
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
      {/* <div
        className='absolute bottom-0 right-0'
      >

      </div> */}
      <TreeTooltip 
        tooltip={tooltip}
        transformMatrix={zoom.transformMatrix}
      />
    </div>
  );
};
