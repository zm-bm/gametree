import { useCallback, useContext, useMemo, useState } from 'react';
import { SpringRef } from 'react-spring';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { HierarchyNode, HierarchyPointNode } from "@visx/hierarchy/lib/types"
import { Tree } from '@visx/hierarchy';
import { Group } from '@visx/group'
import { BiChevronDown, BiChevronUp } from 'react-icons/bi';

import { TreeViewNode } from "@/types";
import { cn } from '@/shared/cn';
import { useTreeMinimap } from '@/features/TreeView/hooks';
import { ZoomContext, TreeDimensionsContext } from "@/features/TreeView/context";
import { SVGDefs } from '../SVGDefs';
import { TreeContents } from '../TreeContents';
import { treeSeparation } from '@/features/TreeView/lib/treeSeparation';

export interface TreeMinimapProps {
  tree: HierarchyNode<TreeViewNode> | null;
  spring: SpringRef<TransformMatrix>;
}

const MINIMAP_COLLAPSED_STORAGE_KEY = 'gtMinimapCollapsed';
const MINIMAP_SIZE_RATIO = 0.25;
const MINIMAP_SIZE_MIN = 96;
const MINIMAP_SIZE_MAX = 280;
const COLLAPSED_NOTCH_WIDTH = 40;
const COLLAPSED_NOTCH_HEIGHT = 18;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const getMinimapSize = (width: number, height: number) => {
  const shortestSide = Math.min(width, height);
  return Math.round(clamp(shortestSide * MINIMAP_SIZE_RATIO, MINIMAP_SIZE_MIN, MINIMAP_SIZE_MAX));
};

const getIsCollapsed = () => {
  const stored = localStorage.getItem(MINIMAP_COLLAPSED_STORAGE_KEY);
  if (stored === null) return true;
  return stored === '1';
};

export const TreeMinimap = ({ tree, spring }: TreeMinimapProps) => {
  const { treeNodeSpacing, width, height } = useContext(TreeDimensionsContext);
  const { zoom: { transformMatrix, isDragging, setTransformMatrix, dragStart, dragEnd }} = useContext(ZoomContext);
  const [isCollapsed, setIsCollapsed] = useState(getIsCollapsed);

  const minimapSize = useMemo(() => getMinimapSize(width, height), [width, height]);
  const nodes = useMemo(() => tree ? tree.descendants() as HierarchyPointNode<TreeViewNode>[] : [], [tree]);

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(MINIMAP_COLLAPSED_STORAGE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

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
  const minimapScale = isCollapsed ? 0.15 : 1;

  return (
    <div
      className="relative pointer-events-auto overflow-hidden transition-[width,height] duration-300 ease-in-out"
      style={{
        width: isCollapsed ? COLLAPSED_NOTCH_WIDTH : minimapSize,
        height: isCollapsed ? COLLAPSED_NOTCH_HEIGHT : minimapSize,
      }}
    >
      <button
        title={isCollapsed ? "open minimap" : "collapse minimap"}
        aria-label={isCollapsed ? "open minimap" : "collapse minimap"}
        className={cn([
          "absolute top-0 right-2 z-20 h-[18px] w-[30px] grid place-items-center",
          isCollapsed
            ? "rounded-md border rounded-b-none border-b-0"
            : "rounded-md border rounded-t-none border-t-0",
          "border-lightmode-950/40 dark:border-darkmode-100/20",
          "bg-lightmode-50/80 hover:bg-lightmode-100/90",
          "dark:bg-darkmode-900/80 dark:hover:bg-darkmode-800/90",
          "text-lightmode-700 dark:text-darkmode-100",
          "transition-colors interactive-treeview",
        ])}
        onClick={toggleCollapsed}
      >
        {isCollapsed ? <BiChevronUp size={15} /> : <BiChevronDown size={15} />}
      </button>

      <div
        className="absolute top-0 left-0 transition-[transform,opacity] duration-300 ease-in-out origin-top-left"
        style={{
          width: minimapSize,
          height: minimapSize,
          transform: `scale(${minimapScale})`,
          opacity: isCollapsed ? 0 : 1,
        }}
      >
      <svg
        className={cn([
          'treeview-card border-none border-t border-l rounded-none rounded-tl-md',
          'bg-opacity-5 backdrop-blur-lg hover:bg-lightmode-200/90 dark:hover:bg-darkmode-800/90',
        ])}
        style={{ pointerEvents: isCollapsed ? 'none' : 'auto' }}
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
            <Tree<TreeViewNode>
              root={tree}
              nodeSize={treeNodeSpacing}
              separation={treeSeparation}
            >
              {(tree) => (
                <Group transform={transform.matrix}>
                  <TreeContents tree={tree} minimap={true} />
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
      </div>
    </div>
  );
};
