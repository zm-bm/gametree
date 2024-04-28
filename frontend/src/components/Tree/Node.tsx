import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { scaleLinear } from '@visx/scale';
import { Text } from "@visx/text";
import { TreeNode } from "../../chess";

const fontSizeScale = scaleLinear({ domain: [12, 50], range: [6, 12] })

interface NodeProps {
  node: HierarchyPointNode<TreeNode>;
  isHighlighted: boolean;
  height: number;
  width: number;
}

export function RootNode({ node }: Pick<NodeProps, 'node'>) {
  return (
    <Group top={node.x} left={node.y}>
      <circle r={20} />
    </Group>
  );
}

export function Node({ node, isHighlighted, height, width }: NodeProps) {
  const isRoot = node.depth === 0;
  if (isRoot) return <RootNode node={node} />;
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;
  return (
    <Group top={node.x} left={node.y} style={{ cursor: 'pointer' }}>
      <rect
        height={height}
        width={width}
        y={-height / 2}
        x={-width / 2}
        rx={5}
        fill='white'
        stroke={isHighlighted ? 'green' : 'black'}
        strokeWidth={1}
        onClick={() => {
          console.log(node);
        } } />
      <Text
        height={height}
        width={width}
        verticalAnchor='middle'
        textAnchor="middle"
        fontSize={fontSizeScale(height)}
        fontFamily={'monospace'}
        fontWeight={isHighlighted ? 700 : 400}
        fill='black'
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.data.attributes?.name || node.data.attributes?.move?.san}
      </Text>
    </Group>
  );
}
