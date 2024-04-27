import { useEffect, useMemo, useRef } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { MoveNode, TreeNode } from "../../chess";
import { useContext } from "react";
import { OpeningsContext } from '../App';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Chess } from 'chess.js';
import { Zoom } from '@visx/zoom';
import { Text } from '@visx/text';
import { scaleLinear } from '@visx/scale';

type HierarchyNode = HierarchyPointNode<TreeNode>;

const fontFamily = 'monospace'
const white = '#ffffff';
const black = '#000000';

function RootNode({ node }: { node: HierarchyNode }) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={20} />
    </Group>
  );
}

interface NodeProps {
  node: HierarchyNode,
  isHighlighted: boolean,
  height: number,
  width: number
}
function Node({ node, isHighlighted, height, width }: NodeProps) {
  const isRoot = node.depth === 0;
  if (isRoot) return <RootNode node={node} />;
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y} style={{ cursor: 'pointer' }}>
      <rect
        height={height}
        width={width}
        y={-height/2}
        x={-width/2}
        rx={5}
        fill={white}
        stroke={black}
        strokeWidth={1}
        onClick={() => {
          console.log(node);
        }}
      />
      <Text
        height={height}
        width={width}
        verticalAnchor='middle'
        textAnchor="middle"
        fontSize={fontSizeScale(height)}
        fontFamily={fontFamily}
        fontWeight={isHighlighted ? 700 : 400}
        fill={black}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {
          node.data.attributes?.name || node.data.attributes?.move?.san
        }
      </Text>
    </Group>
  );
}

const nodeHeightScale= scaleLinear({ domain: [300, 1200], range: [12, 50] })
const nodeWidthScale= scaleLinear({ domain: [300, 1200], range: [110, 140] })
const fontSizeScale = scaleLinear({ domain: [12, 50], range: [6, 12] })
const treeWidthScale = scaleLinear({ domain: [300, 1200], range: [150, 300] })

const defaultMargin = { top: 10, left: 40, right: 40, bottom: 10 };
export type TreeProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function MoveTree({ margin = defaultMargin }: TreeProps) {
  const { parentRef, width, height } = useParentSize({ initialSize: { width: 800, height: 600 }})
  const openings = useContext(OpeningsContext)
  const moveTree = useSelector((state: RootState) => state.game.moveTree)
  const moveKey = useSelector((state: RootState) => state.game.key)

  const nodeHeight = nodeHeightScale(height);
  const nodeWidth = nodeWidthScale(width);
  const treeWidth = treeWidthScale(width)
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  const [root, current] = useMemo(() => {
    var name = 1;
    var current;

    const generateGameTree = (
      moveNode: MoveNode,
      chess: Chess,
      openingsTree?: TreeNode,
    ): TreeNode => {
      // get list of legal moves from current position
      const moves = chess.moves()
      const children: TreeNode[] = []

      // create tree nodes for children
      moves.forEach(san => {
        // get entry from openingsTree if any
        const childOpenings = openingsTree?.children?.find(n => n.attributes?.move?.san === san)

        const madeMove = moveNode.children.find(n => moveTree[n].move?.san === san)
        if (madeMove !== undefined) {
          // if move exists in moveTree, recurse
          chess.move(san)
          children.push(generateGameTree(moveTree[madeMove], chess, childOpenings))
          chess.undo()
        } else if (childOpenings) {
          // if move exists in openingsTree, add it
          children.push({ name: name++, attributes: childOpenings.attributes })
        } else if (false && moveKey === moveNode.key) {
          // otherwise add all legal moves for current position
          const move = chess.move(san)
          children.push({ name: name++, attributes: { move } })
          chess.undo()
        }
      })

      if (moveKey === moveNode.key) {
        current = name
      }
      return {
        name: name++,
        attributes: openingsTree ? openingsTree.attributes
          : { move: moveNode.move || undefined },
        children,
      }
    };
    
    const chess = new Chess()
    const tree = generateGameTree(moveTree[0], chess, openings)
    return [hierarchy(tree), current]
  }, [moveTree, openings, moveKey])

  const toCurrentNodeTransform = () => {
    const node = root.descendants().find(node => node.data.name === current);
    return {
      scaleX: 1,
      scaleY: 1,
      // @ts-ignore
      translateX: -node?.y + (xMax / 3),
      // @ts-ignore
      translateY: -node?.x + (yMax / 2),
      skewX: 0,
      skewY: 0,
    };
  };

  return (
    <div ref={parentRef} className='w-full h-full border-l border-gray-400 overflow-hidden bg-white'>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 4}
        scaleYMin={1 / 4}
        scaleXMax={2}
        scaleYMax={2}
      >
        {(zoom) => {
          useEffect(() => {
            console.log(toCurrentNodeTransform())
            zoom.setTransformMatrix(toCurrentNodeTransform()) 
          }, [current, height, width])

          return (
            <div className='relative'>
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                ref={zoom.containerRef}
              >
                <g transform={zoom.toString()}>
                  <Tree<TreeNode> root={root} nodeSize={[nodeHeight+5, treeWidth]} >
                    {(tree) => (
                      <Group top={margin.top} left={margin.left}>
                        {
                          // (() => { console.log(tree); return <></> })()
                        }
                        {tree.links().map((link, i) => (
                          <LinkHorizontal
                            key={`link-${i}`}
                            path={({ source, target }) => {
                              const midY = source.y + (target.y - source.y) * 0.5;
                              return `M${source.y},${source.x}L${midY},${source.x}C${midY},${target.x},${midY},${target.x},${target.y},${target.x}`
                            }}
                            data={link}
                            stroke={black}
                            strokeWidth={link.target.children?.length}
                            strokeLinejoin='round'
                            fill="none"
                          />
                        ))}
                        {tree.descendants().map((node, i) => (
                          <Node
                            key={`node-${i}`}
                            node={node}
                            width={nodeWidth}
                            height={nodeHeight}
                            isHighlighted={current === node.data.name}
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
                  onClick={zoom.reset}
                >to root</button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => { zoom.setTransformMatrix(toCurrentNodeTransform()) }}
                >to current</button>
              </div>
            </div>
          )
        }} 
      </Zoom>
    </div>
  );
}
