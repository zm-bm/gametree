import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Text } from "@visx/text";
import { TreeNode } from "../../chess";
import { countGames } from "./helpers";


interface Props {
  node: HierarchyPointNode<TreeNode>,
  r: number,
  fontSize: number,
  isCurrentNode: boolean,
  onMouseMove: React.MouseEventHandler,
  onMouseLeave: () => void,
}

export function Node({
 node,
 r,
 fontSize,
 isCurrentNode,
 onMouseMove,
 onMouseLeave,
}: Props) {
  const isRoot = node.depth === 0;
  if (isRoot) {
    return (
      <Group top={node.x} left={node.y}>
        <circle
          r={20}
          fill={isCurrentNode ? 'url(#currentNodeGradient)' : 'url(#blackMoveGradient)'}
          stroke='black'
          strokeWidth={2}
        />
      </Group>
    );
  }
  // const isParent = !!node.children;
  // if (isParent) return <ParentNode node={node} />;

  return (
    <Group
      top={node.x}
      left={node.y}
      style={{ cursor: 'pointer' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <circle
        r={r}
        y={-r / 2}
        x={-r / 2}
        rx={5}
        fill={
          isCurrentNode ? 'url(#currentNodeGradient)'
            : (node.data.attributes.move?.color === 'w') ? 'url(#whiteMoveGradient)' : 'url(#blackMoveGradient)' }
        stroke='black'
        strokeWidth={2}
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
        fontWeight={600}
        fill={node.data.attributes.move?.color === 'w' ? 'black' : 'white'}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {node.data.attributes.move?.san}
      </Text>
    </Group>
  );
}
