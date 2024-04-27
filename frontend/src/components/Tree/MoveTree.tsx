import { useEffect, useMemo, useState, } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontalStep } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { MoveNode, TreeNode } from "../../chess";
import { useContext } from "react";
import { OpeningsContext } from '../App';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Chess } from 'chess.js';
import { Zoom } from '@visx/zoom';
import { Text } from '@visx/text';

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

/** Handles rendering Root, Parent, and other Nodes. */
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
        fontSize={12}
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


const defaultMargin = { top: 10, left: 40, right: 40, bottom: 10 };
export type TreeProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function MoveTree({ margin = defaultMargin }: TreeProps) {
  const { parentRef, width, height } = useParentSize()
  const openings = useContext(OpeningsContext)
  const moveTree = useSelector((state: RootState) => state.game.moveTree)
  const moveKey = useSelector((state: RootState) => state.game.key)
  const [current, setCurrent] = useState(0);

  const nodeHeight = height/24;
  const nodeWidth = 140;
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  const initialTransform = {
    scaleX: 1,
    scaleY: 1,
    translateX: (xMax / 3),
    translateY: (yMax / 2),
    skewX: 0,
    skewY: 0,
  };

  const root = useMemo(() => {
    var name = 1

    function makeLegalTreeNodes(node: MoveNode): TreeNode[] {
      const chess = new Chess(node.move?.after)
      return chess.moves().map(m => {
        const move = chess.move(m)
        const treeNode = {
          name: name++,
          attributes: { move }
        }
        chess.undo()
        return treeNode
      })
    }

    const generateGameTree = (
      moveNode: MoveNode,
      openTree?: TreeNode,
    ): TreeNode => {
      const children = moveNode.children.map(c => moveTree[c])
      const bookChildren: TreeNode[] = openTree?.children
        ? openTree?.children
                   .map(c => ({ name: name++, attributes: c.attributes }))
        : []
      const legalMoves = (moveNode.key === moveKey)
        ? makeLegalTreeNodes(moveNode)
        : []

      if (moveKey === moveNode.key)
        setCurrent(name)
      return {
        name: name++,
        attributes: openTree ? openTree.attributes
          : { move: moveNode.move || undefined },
        children: [
          ...children.map(c => {
            const t = openTree?.children?.find(n => n.attributes?.move?.san === c.move?.san)
            return generateGameTree(c, t)
          }),
          ...bookChildren,
          // ...legalMoves,
        ]
      }
    };
    
    const tree = generateGameTree(moveTree[0], openings)
    return hierarchy(tree)
  }, [moveTree, openings, moveKey])

  const toCurrentNodeTransform = () => {
    const node = root.descendants().find(node => node.data.name === current);
    if (!node) return initialTransform;
    return {
      scaleX: 1,
      scaleY: 1,
      // @ts-ignore
      translateX: -node.y + (xMax / 2),
      // @ts-ignore
      translateY: -node.x + (yMax / 2),
      skewX: 0,
      skewY: 0,
    };
  };

  return (
    <div ref={parentRef} className='w-full h-full border-l border-gray-400 overflow-hidden'>
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 4}
        scaleYMin={1 / 4}
        scaleXMax={2}
        scaleYMax={2}
        initialTransformMatrix={initialTransform}
      >
        {(zoom) => {
          useEffect(() => {
            zoom.setTransformMatrix(initialTransform) 
          }, [initialTransform])
          useEffect(() => {
            console.log(current)
            zoom.setTransformMatrix(toCurrentNodeTransform()) 
          }, [current])

          return (
            <div className='relative'>
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                ref={zoom.containerRef}
              >
                <g transform={zoom.toString()}>
                  <Tree<TreeNode> root={root} nodeSize={[nodeHeight+4, width/4]} >
                    {(tree) => (
                      <Group top={margin.top} left={margin.left}>
                        {tree.links().map((link, i) => (
                          <LinkHorizontalStep
                            key={`link-${i}`}
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
