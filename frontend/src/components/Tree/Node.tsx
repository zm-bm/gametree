import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Text } from "@visx/text";
import { TreeNode } from "../../chess";
import { countGames } from "./helpers";


interface Props {
  node: HierarchyPointNode<TreeNode>,
  r: number,
  fontSize: number,
  isHighlighted: boolean,
  onMouseEnter: () => void,
  onMouseLeave: () => void,
}

export function RootNode({ node }: Pick<Props, 'node'>) {
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

export function Node({
 node,
 r,
 fontSize,
 isHighlighted,
 onMouseEnter,
 onMouseLeave,
}: Props) {
  const isRoot = node.depth === 0;
  if (isRoot) return <RootNode node={node} />;
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;
  return (
    <Group
      top={node.x}
      left={node.y}
      style={{ cursor: 'pointer' }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <circle
        r={r}
        y={-r / 2}
        x={-r / 2}
        rx={5}
        fill='white'
        stroke={isHighlighted ? 'green' : 'black'}
        strokeWidth={1}
        onClick={() => {
          console.log(node);
          const games = countGames(node.data)
          if (games) {
            const { wins, losses, draws } = node.data.attributes;
            const winProbability = wins! / games;
            const lossProbability = losses! / games;
            const drawProbability = draws! / games;
            console.log(winProbability, drawProbability, lossProbability)
          }
        }}
      />
      <Text
        height={r}
        width={r}
        verticalAnchor='middle'
        textAnchor="middle"
        fontSize={fontSize}
        fontFamily={'monospace'}
        fontWeight={isHighlighted ? 700 : 600}
        fill='black'
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.data.attributes.move?.san}
      </Text>
    </Group>
  );
}
