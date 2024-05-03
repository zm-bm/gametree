import { useCallback, useState } from 'react';
import { ProvidedZoom, TransformMatrix } from '@visx/zoom/lib/types';
import { localPoint } from '@visx/event';
import { useTooltip, useTooltipInPortal  } from '@visx/tooltip';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { SvgDefs } from './SvgDefs';
import useAnimateTransform from '../../hooks/useAnimateTransform';
import { MoveTreeG } from './MoveTreeG';
import { TreeNode } from '../../chess';
import { MoveTreeTooltip } from './MoveTreeTooltip';

export type ZoomState = {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
}

export const margin = { top: 10, left: 40, right: 40, bottom: 10 };
const defaultMatrix: TransformMatrix = {
  translateX: 0, translateY: 0,
  scaleX: 1, scaleY: 1,
  skewX: 0, skewY: 0,
};

interface Props {
  width: number,
  height: number,
  zoom: ProvidedZoom<SVGSVGElement> & ZoomState,
}
export const MoveTreeSvg = ({ width, height, zoom }: Props) => {
  const [initialMatrix, setInitialMatrix] = useState<TransformMatrix>(defaultMatrix);
  const [targetMatrix, setTargetMatrix] = useState<TransformMatrix>(defaultMatrix);
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
            tooltipLeft: (node.y + margin.left) * m.scaleX + m.translateX,
            tooltipTop: (node.x + margin.top) * m.scaleY + m.translateY,
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
        <SvgDefs />
        <MoveTreeG
          width={width}
          height={height}
          zoom={zoom}
          setTargetMatrix={setTargetMatrix}
          showNodeTooltip={showNodeTooltip}
          hideTooltip={tooltip.hideTooltip}
        />
      </svg>
      <MoveTreeTooltip tooltip={tooltip} />
    </div>
  );
};
