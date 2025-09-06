import { useCallback, useContext, useMemo } from 'react';
import { SpringRef } from 'react-spring';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from "@visx/hierarchy/lib/types"
import { Tree } from '@visx/hierarchy';
import { Group } from '@visx/group'

import { TreeNodeData } from "@/shared/types";
import { cn } from '@/shared/lib/cn';
import { useTreeMinimap } from '../../hooks';
import { ZoomContext, TreeDimensionsContext } from "../../context";
import { SVGDefs } from '../SVGDefs';
import { TreeContents } from '../TreeContents';
import { separation } from '../../lib/separation';

interface Props {
  tree: HierarchyNode<TreeNodeData> | null,
  spring: SpringRef<TransformMatrix>,
};

export const TreeMinimap = ({ tree, spring }: Props) => {
  const { nodeSize, width, height } = useContext(TreeDimensionsContext);
  const { zoom: { transformMatrix, isDragging, setTransformMatrix, dragStart, dragEnd }} = useContext(ZoomContext);

  const minimapSize = useMemo(() => Math.round(Math.min(width, height) * 0.3), [width, height]);
  const nodes = useMemo(() => tree ? tree.descendants() as HierarchyPointNode<TreeNodeData>[] : [], [tree]);

  const { transform, viewport, centerViewport } = useTreeMinimap({
    spring,
    nodes,
    minimapWidth: minimapSize,
    minimapHeight: minimapSize,
    treeWidth: width,
    treeHeight: height,
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
      className={cn([
        'treeview-card border-none border-t border-l rounded-none rounded-tl-md',
        'bg-opacity-5 backdrop-blur-lg hover:bg-lightmode-200/90 dark:hover:bg-darkmode-800/90',
      ])}
      width={minimapSize}
      height={minimapSize}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      onTouchEnd={handleMouseUp}
      cursor={isDragging ? 'grabbing' : 'grab'}
      shapeRendering="crispEdges"
    >
      <SVGDefs />
      <g>
        { tree && transform &&
          <Tree<TreeNodeData>
            root={tree}
            nodeSize={nodeSize}
            separation={separation}
          >
            {(tree) => (
              <Group transform={transform.matrix}>
                <TreeContents
                  tree={tree}
                  nodeSize={nodeSize}
                  minimap={true}
                />
              </Group>
            )}
          </Tree>
        }
        { viewport &&
          <rect
            className={cn([
              'stroke-[0.75] stroke-lightmode-950/50 dark:stroke-darkmode-50/50',
              'fill-lightmode-950/10 dark:fill-darkmode-100/10'
            ])}
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
