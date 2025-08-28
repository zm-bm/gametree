import { useCallback, useContext, useMemo } from 'react';
import { SpringRef } from 'react-spring';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from "@visx/hierarchy/lib/types"
import { Tree } from '@visx/hierarchy';
import { Group } from '@visx/group'

import { TreeNodeData } from "@/shared/types";
import { useTreeMinimap } from './useTreeMinimap';
import { MinimapTree } from './MinimapTree';
import { SVGDefs } from '../SVGDefs';
import { ZoomContext, MoveTreeContext } from "../../context";
import { separation } from '../../lib/separation';
import { cn } from '@/shared/lib/cn';

interface Props {
  tree: HierarchyNode<TreeNodeData> | null,
  spring: SpringRef<TransformMatrix>,
  size: number,
};

const minimapClass = [
  'treeview-card backdrop-blur-lg',
  'border-none border-t border-l',
  'rounded-none rounded-tl-md',
  'hover:bg-lightmode-200/90 dark:hover:bg-darkmode-800/90',
];

const viewportClass = [
  'stroke-[0.75] stroke-lightmode-950/50 dark:stroke-darkmode-50/50',
  'fill-lightmode-950/10 dark:fill-darkmode-100/10'
];

export const Minimap = ({ tree, spring, size }: Props) => {
  const treeDimensions = useContext(MoveTreeContext);
  const { rowHeight, columnWidth } = treeDimensions;
  const { zoom } = useContext(ZoomContext);
  const { transformMatrix, isDragging, setTransformMatrix, dragStart, dragEnd } = zoom;
  const nodeSize = useMemo(() => [rowHeight, columnWidth], [rowHeight, columnWidth]);
  const nodes = useMemo(() => tree ? tree.descendants() as HierarchyPointNode<TreeNodeData>[] : [], [tree]);
  const svgStyle = useMemo(() => ({ cursor: isDragging ? 'grabbing' : 'grab' }), [isDragging]);

  const { transform, viewport, centerViewport } = useTreeMinimap({
    spring,
    nodes,
    minimapWidth: size,
    minimapHeight: size,
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
    <svg
      className={cn(minimapClass, 'bg-opacity-5')}
      width={size}
      height={size}
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
        { tree && transform &&
          <Tree<TreeNodeData>
            root={tree}
            nodeSize={nodeSize as [number, number]}
            separation={separation}
          >
            {(tree) => (
              <Group transform={transform.matrix}>
                <MinimapTree tree={tree} />
              </Group>
            )}
          </Tree>
        }
        { viewport &&
          <rect
            className={cn(viewportClass)}
            x={viewport.x}
            y={viewport.y}
            width={viewport.width}
            height={viewport.height}
            rx={6}
            ry={6}
            z={100}
            filter="url(#minimapGlow)"
            vectorEffect="non-scaling-stroke"
          />
        }
      </g>
    </svg>
  );
};
