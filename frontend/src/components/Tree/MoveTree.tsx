import { useMemo } from 'react';
import { Group } from '@visx/group';
import { Tree, hierarchy } from '@visx/hierarchy';
import { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import { LinkHorizontal } from '@visx/shape';
import { useParentSize } from '@visx/responsive';
import { TreeNode } from "../../chess";
import { useContext } from "react";
import { OpeningsContext } from '../App';

const fontFamily = 'monospace'
const white = '#ffffff';
const black = '#000000';

type HierarchyNode = HierarchyPointNode<TreeNode>;

function RootNode({ node }: { node: HierarchyNode }) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={12} fill={white} stroke='black' />
      <text
        dy=".33em"
        fontSize={9}
        fontFamily={fontFamily}
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={white}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

function ParentNode({ node }: { node: HierarchyNode }) {
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={white}
        stroke={black}
        strokeWidth={1}
        onClick={() => {
          console.log(`clicked: ${JSON.stringify(node.data.name)}`);
        }}
      />
      <text
        dy=".33em"
        fontSize={12}
        fontFamily={fontFamily}
        textAnchor="middle"
        style={{ pointerEvents: 'none' }}
        fill={white}
      >
        { node.data.attributes?.move }
      </text>
    </Group>
  );
}

/** Handles rendering Root, Parent, and other Nodes. */
function Node({ node }: { node: HierarchyNode }) {
  const width = 40;
  const height = 40;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = !!node.children;

  if (isRoot) return <RootNode node={node} />;
  if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={white}
        stroke={black}
        strokeWidth={1}
        strokeOpacity={0.6}
        rx={5}
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

function selectData(tree: TreeNode, n: number): TreeNode {
  if (n === 1) {
    return {
      name: tree.name,
      attributes: tree.attributes,
    };
  } else {
    return {
      name: tree.name,
      attributes: tree.attributes,
      children: tree.children?.map(child => selectData(child, n - 1))
    };
  }
}

const defaultMargin = { top: 10, left: 80, right: 80, bottom: 10 };

export type TreeProps = {
  margin?: { top: number; right: number; bottom: number; left: number };
};

export default function MoveTree({ margin = defaultMargin }: TreeProps) {
  const { parentRef, width, height } = useParentSize()
  const openings = useContext(OpeningsContext)
  const rawTree = selectData(openings, 2)
  const data = useMemo(() => hierarchy(rawTree), []);

  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  return (
    <div ref={parentRef} className='w-full h-full border-l border-gray-400 overflow-hidden'>
      <svg width={width} height={height}>
        <Tree<TreeNode> root={data} size={[yMax, xMax]}>
          {(tree) => (
            <Group top={margin.top} left={margin.left}>
              {tree.links().map((link, i) => (
                <LinkHorizontal
                  key={`link-${i}`}
                  data={link}
                  stroke={black}
                  strokeWidth="1"
                  fill="none"
                />
              ))}
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
