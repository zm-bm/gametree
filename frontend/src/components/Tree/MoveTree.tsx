import { useEffect, useMemo, useState  } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { useParentSize } from '@visx/responsive';
import { useContext } from "react";
import { useSelector } from 'react-redux';
import { Zoom } from '@visx/zoom';
import { scaleLinear } from '@visx/scale';
import { useTooltip, useTooltipInPortal } from '@visx/tooltip';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { Lookup, animated, useSpring } from 'react-spring';

import { Node } from './Node';
import { Link } from './Link';
import { countGames, generateGameTree } from './helpers';
import { TreeNode } from "../../chess";
import { RootState } from '../../store';
import { OpeningsContext } from '../App';
import { Point, Translate } from '@visx/zoom/lib/types';
import useAnimateTranslate from '../../hooks/useAnimateTranslate';

const nodeRadiusScale = scaleLinear({ domain: [300, 1200], range: [10, 20] })
const nodeWidthScale = scaleLinear({ domain: [300, 1200], range: [80, 320] })
const fontSizeScale = scaleLinear({ domain: [300, 1200], range: [8, 14] })

const defaultMargin = { top: 10, left: 40, right: 40, bottom: 10 };
export type TreeProps = {
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
  const nodeHeight = nodeRadius * 2.5;
  const fontSize = fontSizeScale(height);
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const {
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
    showTooltip,
    hideTooltip,
  } = useTooltip<TreeNode>();
  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    detectBounds: true,
    scroll: true,
  })

  const handleMouseEnter = (node: HierarchyPointNode<TreeNode>) => 
    () => {
      showTooltip({
        tooltipLeft: node.y + margin.left,
        tooltipTop: node.x + margin.top,
        tooltipData: node.data,
      });
    };
  const onMouseLeave = () => hideTooltip()


  const root = useMemo(() => {
    const tree = generateGameTree(moveTree, openings);
    return hierarchy(tree);
  }, [moveTree, openings])

  const [styles, api] = useSpring(() => ({
    translateX: 0,
    translateY: 0,
    scaleX: 1,
    scaleY: 1,
    config: { tension: 170, friction: 26 }
  }));

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
          const [_, setTranslate] = useSpring(() => ({
            translateX: 0,
            translateY: 0,
            onChange: ({ value }) => zoom.setTranslate(value as Translate),
          }));

          return (
            <div className='relative' ref={containerRef}>
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                ref={zoom.containerRef}
              >
                <animated.g transform={zoom.toString()}>
                  <Tree<TreeNode>
                    root={root}
                    nodeSize={[nodeHeight, nodeWidth]}
                  >
                    {(tree) => {
                      useEffect(() => {
                        const node = tree.descendants().find(node => node.data.name === currentNode);
                        if (node) {
                          setTranslate.start({
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
                              onMouseEnter={handleMouseEnter(link.target)}
                              onMouseLeave={onMouseLeave}
                            />
                          ))}
                          {tree.descendants().map((node, i) => (
                            <Node
                              key={`node-${i}`}
                              node={node}
                              r={nodeRadius}
                              fontSize={fontSize}
                              isHighlighted={currentNode === node.data.name}
                              onMouseEnter={handleMouseEnter(node)}
                              onMouseLeave={onMouseLeave}
                            />
                          ))}
                        </Group>
                      )
                    }}
                  </Tree>
                </animated.g>
              </svg>
              {(tooltipOpen && tooltipData && tooltipTop && tooltipLeft) &&  (
                <TooltipInPortal
                  key={Math.random()}
                  top={(tooltipTop * zoom.transformMatrix.scaleY) + zoom.transformMatrix.translateY}
                  left={(tooltipLeft * zoom.transformMatrix.scaleX) + zoom.transformMatrix.translateX}
                >
                  Total games: <strong>{countGames(tooltipData)}</strong>
                </TooltipInPortal>
              )}
            </div>
          )
        }}
      </Zoom>
    </div>
  );
}
