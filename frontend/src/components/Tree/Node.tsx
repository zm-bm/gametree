import { MouseEventHandler } from "react";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Text } from "@visx/text";
import { TreeNode } from "../../chess";

interface Props {
  node: HierarchyPointNode<TreeNode>,
  r: number,
  fontSize: number,
  isCurrentNode: boolean,
  onMouseEnter: MouseEventHandler,
  onMouseLeave: () => void,
}

export function Node({
  node,
  r,
  fontSize,
  isCurrentNode,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  if (node.depth === 0) {
    // root node
    return (
      <Group top={node.x} left={node.y}>
        <circle
          r={20}
          fill={isCurrentNode ? 'url(#currentNodeGradient)' : 'url(#blackMoveGradient)'}
          stroke={'gray'}
          strokeWidth={2}
        />
      </Group>
    );
  }

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
        fill={isCurrentNode ? 'url(#currentNodeGradient)' : node.data.attributes.move?.color === 'w' ? 'url(#whiteMoveGradient)' : 'url(#blackMoveGradient)' }
        stroke={'gray'}
        strokeWidth={isCurrentNode ? 3 : 2}
        className="transition hover:scale-110 hover:stroke-black"
        // onClick={() => {
        //   console.log(node);
        //   const games = countGames(node.data)
        //   if (games) {
        //     const { wins, losses, draws } = node.data.attributes;
        //     const winProbability = wins! / games;
        //     const lossProbability = losses! / games;
        //     const drawProbability = draws! / games;
        //     console.log(winProbability, drawProbability, lossProbability)
        //   }
        // }}
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
