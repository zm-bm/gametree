import { useCallback, useEffect, useMemo, useState } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { useParentSize } from '@visx/responsive';
import { useContext } from "react";
import { useSelector } from 'react-redux';
import { Zoom } from '@visx/zoom';
import { scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { localPoint } from '@visx/event';

import { Node } from './Node';
import { Link } from './Link';
import { countGames, generateGameTree } from './helpers';
import { TreeNode } from "../../chess";
import { RootState } from '../../store';
import { OpeningsContext } from '../App';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { SvgDefs } from './SvgDefs';
import useAnimateTransform from '../../hooks/useAnimateTransform';
import BaseBoard from '../Board/BaseBoard';

const nodeRadiusScale = scaleLinear({ domain: [300, 1200], range: [12, 24] })
const nodeWidthScale = scaleLinear({ domain: [300, 1200], range: [80, 360] })
const fontSizeScale = scaleLinear({ domain: [300, 1200], range: [8, 16] })

const defaultMatrix: TransformMatrix = {
  translateX: 0, translateY: 0,
  scaleX: 1, scaleY: 1,
  skewX: 0, skewY: 0,
};
const defaultMargin = { top: 10, left: 40, right: 40, bottom: 10 };

type TreeProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
};
export default function MoveTree({ margin = defaultMargin }: TreeProps) {
  const { parentRef, width, height } = useParentSize({ initialSize: { width: 800, height: 600 }});
  const openings = useContext(OpeningsContext);
  const moveTree = useSelector((state: RootState) => state.game.moveTree);
  const moveList = useSelector((state: RootState) => state.game.moveList);
  const currentNode = moveList.map(mv => mv.san).join(',');

  const nodeRadius = nodeRadiusScale(height);
  const nodeWidth = nodeWidthScale(width);
  const fontSize = fontSizeScale(height);
  const nodeHeight = nodeRadius * 2.2; // 
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const root = useMemo(() => {
    const tree = generateGameTree(moveTree, openings);
    return hierarchy(tree);
  }, [moveTree, openings])

  return (
    <div
      ref={parentRef}
      className='w-full h-full border-l border-neutral-400 dark:border-neutral-500 overflow-hidden'
    >
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 8}
        scaleYMin={1 / 8}
        scaleXMax={8}
        scaleYMax={8}
      >
        {(zoom) => {
          const [initialMatrix, setInitialMatrix] = useState<TransformMatrix>(defaultMatrix);
          const [targetMatrix, setTargetMatrix] = useState<TransformMatrix>(defaultMatrix);
          useAnimateTransform(initialMatrix, targetMatrix, zoom, 500);

          const {
            tooltipData,
            tooltipLeft,
            tooltipTop,
            tooltipOpen,
            showTooltip,
            hideTooltip,
          } = useTooltip<HierarchyPointNode<TreeNode>>();
          const { containerRef: tooltipRef, TooltipInPortal } = useTooltipInPortal({
            debounce: 200,
            detectBounds: true,
            scroll: false,
          })

          const handleMouseMove = useCallback(
            (node: HierarchyPointNode<TreeNode>): React.MouseEventHandler =>
              (event) => {
                const coords = localPoint(event);
                if (coords) {
                  showTooltip({
                    tooltipLeft: coords.x,
                    tooltipTop: coords.y,
                    tooltipData: node,
                  });
                }
              }, []);
          const onMouseLeave = () => hideTooltip()
          const updateInitialMatrix = () => setInitialMatrix(zoom.transformMatrix)

          return (
            <div className='relative' ref={tooltipRef}>
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
                <g transform={zoom.toString()}>
                  <Tree<TreeNode>
                    root={root}
                    nodeSize={[nodeHeight, nodeWidth]}
                  >
                    {(tree) => {
                      useEffect(() => {
                        const node = tree.descendants().find(node => node.data.name === currentNode);
                        if (node) {
                          setTargetMatrix({
                            ...zoom.transformMatrix,
                            translateX: (-node.y * zoom.transformMatrix.scaleX) + (xMax * 0.33),
                            translateY: (-node.x * zoom.transformMatrix.scaleY) + (yMax * 0.5),
                          })
                        }
                      }, [currentNode, xMax, yMax])

                      return (
                        <Group top={margin.top} left={margin.left}>
                          {tree.links().map((link, i) => (
                            <Link
                              key={`link-${i}`}
                              link={link}
                              r={nodeRadius}
                              fontSize={fontSize}
                              nodeWidth={nodeWidth}
                              onMouseMove={handleMouseMove(link.target)}
                              onMouseLeave={onMouseLeave}
                            />
                          ))}
                          {tree.descendants().map((node, i) => (
                            <Node
                              key={`node-${i}`}
                              node={node}
                              r={nodeRadius}
                              fontSize={fontSize}
                              isCurrentNode={currentNode === node.data.name}
                              onMouseMove={handleMouseMove(node)}
                              onMouseLeave={onMouseLeave}
                            />
                          ))}
                        </Group>
                      )
                    }}
                  </Tree>
                </g>
              </svg>
              {(tooltipOpen && tooltipData && tooltipTop && tooltipLeft) &&  (
                <TooltipInPortal
                  key={Math.random()}
                  top={(tooltipTop)}
                  left={(tooltipLeft)}
                >
                  Total games: <strong>{countGames(tooltipData.data)}</strong>
                  { 
                    // (() => { console.log(tooltipData); return <div></div>})()
                  }
                  <div className='relative h-[240px] w-[240px]'>
                    <BaseBoard 
                      config={{
                        fen: tooltipData.data.attributes.move?.after,
                      }}
                    />
                  </div>
                </TooltipInPortal>
              )}
            </div>
          )
        }}
      </Zoom>
    </div>
  );
}
