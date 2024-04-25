import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontalStep } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { TreeNode } from "../../chess";
import { useContext } from "react";
import { OpeningsContext } from '../App';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Move } from 'chess.js';

type HierarchyNode = HierarchyPointNode<TreeNode>;

const fontFamily = 'monospace'
const white = '#ffffff';
const black = '#000000';

const nodeHeight = 20;
const nodeWidth = 40;
const centerX = -nodeWidth / 2;
const centerY = -nodeHeight / 2;

function RootNode({ node }: { node: HierarchyNode }) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={12} fill={white} stroke='black' />
    </Group>
  );
}

/** Handles rendering Root, Parent, and other Nodes. */
function Node({ node }: { node: HierarchyNode }) {
  const isRoot = node.depth === 0;
  if (isRoot) return <RootNode node={node} />;
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={nodeHeight}
        width={nodeWidth}
        y={centerY}
        x={centerX}
        fill={white}
        stroke={black}
        strokeWidth={1}
        onClick={() => {
          console.log(node);
        }}
      />
      <text
        dy=".33em"
        fontSize={12}
        fontFamily={fontFamily}
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
  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;
  const openings = useContext(OpeningsContext)
  const moveList = useSelector((state: RootState) => state.game.moveList)

  const data = useMemo(() => {
    function selectData(tree: TreeNode, n: number, moves: Move[]): TreeNode {
      const current = moves.at(0)
      if (current && current.san === tree.attributes?.move) {
        return {
          name: tree.name,
          attributes: tree.attributes,
          children: tree.children?.map(child => selectData(child, n, moves.slice(1)))
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
          children: tree.children?.map(child => selectData(child, n - 1, moves))
        };
      }
    }

    const tree = selectData(openings, 2, moveList);
    return hierarchy(tree)
  }, [openings, moveList]);

  return (
    <div ref={parentRef} className='w-full h-full border-l border-gray-400 overflow-hidden'>
      <svg width={width} height={height}>
        <Tree<TreeNode> root={data} size={[yMax, xMax]}>
          {(tree) => (
            <Group top={margin.top} left={margin.left}>
              {tree.links().map((link, i) => {
                console.log(link)
                return (
                  <>
                    <LinkHorizontalStep
                      key={`link-${i}`}
                      data={link}
                      stroke={black}
                      strokeWidth="1"
                      fill="none"
                    />
                    <text
                      x={(link.source.y + link.target.y + 10) / 2}
                      y={link.target.x - 5}
                    >
                      {link.target.data.name}
                    </text>
                  </>
                )
              })}
              {tree.descendants().map((node, i) => (
                <Node key={`node-${i}`} node={node} />
              ))}
            </Group>
          )}
        </Tree>
      </svg>
    </div>
  );
}
