import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Text } from "@visx/text";
import { TreeNode } from "../../chess";
import { countGames } from "./helpers";


interface NodeProps {
  node: HierarchyPointNode<TreeNode>,
  r: number,
  fontSize: number,
  isHighlighted: boolean,
}

export function RootNode({ node }: Pick<NodeProps, 'node'>) {
  return (
    <Group top={node.x} left={node.y}>
      <circle
        r={20}
        onClick={() => {
          console.log(node);
        }}
       />
    </Group>
  );
}

export function Node(props: NodeProps) {
  const isRoot = props.node.depth === 0;
  if (isRoot) return <RootNode node={props.node} />;
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;
  return (
    <Group top={props.node.x} left={props.node.y} style={{ cursor: 'pointer' }}>
      <circle
        r={props.r}
        y={-props.r / 2}
        x={-props.r / 2}
        rx={5}
        fill='white'
        stroke={props.isHighlighted ? 'green' : 'black'}
        strokeWidth={1}
        onClick={() => {
          console.log(props.node);
          const games = countGames(props.node)
          if (games) {
            const { wins, losses, draws } = props.node.data.attributes;
            const winProbability = wins! / games;
            const lossProbability = losses! / games;
            const drawProbability = draws! / games;
            console.log(winProbability, drawProbability, lossProbability)
          }
        }}
      />
      <Text
        height={props.r}
        width={props.r}
        verticalAnchor='middle'
        textAnchor="middle"
        fontSize={props.fontSize}
        fontFamily={'monospace'}
        fontWeight={props.isHighlighted ? 700 : 600}
        fill='black'
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {props.node.data.attributes.move?.san}
      </Text>
    </Group>
  );
}
