import { useEffect, useMemo  } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { useParentSize } from '@visx/responsive';
import { useContext } from "react";
import { useSelector } from 'react-redux';
import { Zoom } from '@visx/zoom';
import { scaleLinear } from '@visx/scale';
import { TransformMatrix } from '@visx/zoom/lib/types';

import { Node } from './Node';
import { Link } from './Link';
import { generateGameTree } from './helpers';
import { TreeNode } from "../../chess";
import { RootState } from '../../store';
import { OpeningsContext } from '../App';

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

  const root = useMemo(() => {
    const tree = generateGameTree(moveTree, openings);
    return hierarchy(tree);
  }, [moveTree, openings])

  function currentNodeTranslation(matrix: TransformMatrix) {
    const node = root.descendants().find(node => node.data.name === currentNode);
    return {
      // @ts-ignore
      translateX: (-node?.y * matrix.scaleX) + (xMax / 3),
      // @ts-ignore
      translateY: (-node?.x * matrix.scaleY) + (yMax / 2),
    }
  }

  return (
    <div ref={parentRef} className='w-full h-full border-l border-gray-400 overflow-hidden bg-white'>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 8}
        scaleYMin={1 / 8}
        scaleXMax={8}
        scaleYMax={8}
      >
        {(zoom) => {
          useEffect(() => {
            zoom.setTranslate(currentNodeTranslation(zoom.transformMatrix))
          }, [currentNode, xMax, yMax])

          return (
            <div className='relative'>
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                ref={zoom.containerRef}
              >
                <g transform={zoom.toString()}>
                  <Tree<TreeNode> root={root} nodeSize={[nodeHeight, nodeWidth]} >
                    {(tree) => (
                      <Group top={margin.top} left={margin.left}>
                        {tree.links().map((link, i) => (
                          <Link
                            key={`link-${i}`}
                            link={link}
                            r={nodeRadius}
                            fontSize={fontSize}
                            nodeWidth={nodeWidth}
                          />
                        ))}
                        {tree.descendants().map((node, i) => (
                          <Node
                            key={`node-${i}`}
                            node={node}
                            r={nodeRadius}
                            fontSize={fontSize}
                            isHighlighted={currentNode === node.data.name}
                          />
                        ))}
                      </Group>
                    )}
                  </Tree>
                </g>
              </svg>
              <div className="absolute top-1 right-1 flex flex-col gap-1">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => zoom.setTranslate(currentNodeTranslation(zoom.transformMatrix))}
                >to current</button>
              </div>
            </div>
          )
        }} 
      </Zoom>
    </div>
  );
}
