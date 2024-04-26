import { useEffect, useMemo, } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { TreeNode } from "../../chess";
import { useContext } from "react";
import { OpeningsContext } from '../App';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Move } from 'chess.js';
import { Zoom } from '@visx/zoom';

type HierarchyNode = HierarchyPointNode<TreeNode>;

const fontFamily = 'monospace'
const white = '#ffffff';
const black = '#000000';
const fontSize = 14

const nodeHeight = 20;
const nodeWidth = 40;
const centerX = -nodeWidth / 2;
const centerY = -nodeHeight / 2;

function RootNode({ node }: { node: HierarchyNode }) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={20} />
    </Group>
  );
}

/** Handles rendering Root, Parent, and other Nodes. */
function Node({ node, isHighlighted }: { node: HierarchyNode, isHighlighted: boolean }) {
  const isRoot = node.depth === 0;
  if (isRoot) return <RootNode node={node} />;
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y} style={{ cursor: 'pointer' }}>
      <rect
        height={nodeHeight}
        width={nodeWidth}
        y={centerY}
        x={centerX}
        rx={5}
        fill={white}
        stroke={black}
        strokeWidth={1}
        onClick={() => {
          console.log(node);
        }}
      />
      <text
        dy=".33em"
        fontSize={fontSize}
        fontFamily={fontFamily}
        fontWeight={isHighlighted ? 700 : 400}
        textAnchor="middle"
        fill={black}
        style={{ pointerEvents: 'none' }}
      >
        { node.data.attributes?.move }
      </text>
    </Group>
  );
}


const defaultMargin = { top: 10, left: 80, right: 80, bottom: 10 };
export type TreeProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function MoveTree({ margin = defaultMargin }: TreeProps) {
  const { parentRef, width, height } = useParentSize()
  const openings = useContext(OpeningsContext)
  const moveList = useSelector((state: RootState) => state.game.moveList)

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

  const [root, currentNode] = useMemo(() => {
    let node;

    function buildTree(tree: TreeNode, n: number, moves: Move[]): TreeNode {
      const current = moves.at(0)
      if (current && current.san === tree.attributes?.move) {
        node = tree
        return {
          name: tree.name,
          attributes: tree.attributes,
          children: tree.children?.map(child => buildTree(child, n, moves.slice(1)))
        }
      } else if (n === 1) {
        return {
          name: tree.name,
          attributes: tree.attributes,
        };
      } else {
        return {
          name: tree.name,
          attributes: tree.attributes,
          children: tree.children?.map(child => buildTree(child, n - 1, moves))
        };
      }
    }

    const tree = buildTree(openings, 2, moveList);
    return [hierarchy(tree), node || tree]
  }, [openings, moveList]);

  const toCurrentNodeTransform = () => {
    const node = root.descendants().find(node => node.data.name === currentNode?.name);
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
            console.log(currentNode)
            zoom.setTransformMatrix(toCurrentNodeTransform()) 
          }, [currentNode])

          return (
            <div className='relative'>
              <svg
                width={width}
                height={height}
                style={{ cursor: zoom.isDragging ? 'grabbing' : 'grab', touchAction: 'none' }}
                ref={zoom.containerRef}
              >
                <g transform={zoom.toString()}>
                  <Tree<TreeNode> root={root} nodeSize={[nodeHeight+4, width/5]} >
                    {(tree) => (
                      <Group top={margin.top} left={margin.left}>
                        {tree.links().map((link, i) => (
                          <LinkHorizontal
                            key={`link-${i}`}
                            data={link}
                            stroke={black}
                            fill="none"
                          />
                        ))}
                        {tree.descendants().map((node, i) => (
                          <Node
                            key={`node-${i}`}
                            node={node}
                            isHighlighted={currentNode.name === node.data.name}
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
