import { useCallback, useContext, useMemo } from 'react';
import { SpringRef } from 'react-spring';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from "@visx/hierarchy/lib/types"
import { Tree } from '@visx/hierarchy';
import { Group } from '@visx/group'

import { TreeNodeData } from "../../types/chess";
import { MoveTreeContext } from "../../contexts/MoveTreeContext";
import { MinimapTree } from './MinimapTree';
import { ZoomContext } from '../../contexts/ZoomContext';
import { useTreeMinimap } from '../../hooks/useTreeMinimap';
import { SVGDefs } from '../MoveTree/SVGDefs';
import { SEPARATION } from "../MoveTree/constants";

interface Props {
  root: HierarchyNode<TreeNodeData>
  spring: SpringRef<TransformMatrix>,
  width: number,
  height: number,
};

export const Minimap = ({ root, spring, width, height }: Props) => {
  const treeDimensions = useContext(MoveTreeContext);
  const { rowHeight, columnWidth } = treeDimensions;
  const { zoom } = useContext(ZoomContext);
  const { transformMatrix, isDragging, setTransformMatrix, dragStart, dragEnd } = zoom;
  const nodeSize = useMemo(() => [rowHeight, columnWidth], [rowHeight, columnWidth]);
  const nodes = useMemo(() => root.descendants() as HierarchyPointNode<TreeNodeData>[], [root]);
  const svgStyle = useMemo(() => ({ cursor: isDragging ? 'grabbing' : 'grab' }), [isDragging]);

  const { transform, viewport, centerViewport } = useTreeMinimap({
    spring,
    nodes,
    minimapWidth: width,
    minimapHeight: height,
    treeWidth: treeDimensions.width,
    treeHeight: treeDimensions.height,
    transformMatrix,
    setTransformMatrix,
  });

  const handleMouseDown = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    event.preventDefault();
    dragStart(event);
    centerViewport(event);
  }, [centerViewport, dragStart]);

  const handleTouch = useCallback((event: React.TouchEvent<SVGSVGElement>) => {
    event.preventDefault();
    centerViewport({ ...event, ...event.touches[0] });
  }, [centerViewport]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging) centerViewport(event);
  }, [isDragging, centerViewport]);

  const handleMouseUp = useCallback(() => { dragEnd() }, [dragEnd]);
  const handleMouseLeave = useCallback(() => { if (isDragging) dragEnd() }, [isDragging, dragEnd]);

  return (
    <div className="absolute bottom-0 right-0">
      <svg
        className="minimap"
        width={width}
        height={height}
        style={svgStyle}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
        onTouchEnd={handleMouseUp}
        shapeRendering="crispEdges"

      >
        <SVGDefs />
        <g>
          <Tree<TreeNodeData>
            root={root}
            nodeSize={nodeSize as [number, number]}
            separation={SEPARATION}
          >
            {(tree) => (
              <Group transform={transform.matrix}>
                <MinimapTree tree={tree} />
              </Group>
            )}
          </Tree>
          <rect
            className='minimap-viewport'
            x={viewport.x}
            y={viewport.y}
            width={viewport.width}
            height={viewport.height}
            rx={4}
            ry={4}
            z={100}
            filter="url(#minimapGlow)"
            vectorEffect="non-scaling-stroke"
          />
        </g>
      </svg>
    </div>
  );
};
