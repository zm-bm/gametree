import { MouseEventHandler, useCallback } from "react";
import { Group } from "@visx/group";
import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { Text } from "@visx/text";
import { Move } from "chess.js";
import { TreeNode } from "../../chess";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { SET_GAME } from "../../redux/gameSlice";

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
  const dispatch = useDispatch<AppDispatch>();

  const onClick = useCallback(() => {
    const moves: Move[] = [];
    let head: (HierarchyPointNode<TreeNode> | null) = node;
    while (head?.data.attributes.move) {
      moves.unshift(head?.data.attributes.move);
      head = head.parent;
    }
    dispatch(SET_GAME(moves))
  }, [node]);

  if (node.depth === 0) {
    // root node
    return (
      <Group top={node.x} left={node.y}>
        <circle
          r={20}
          fill={isCurrentNode ? 'url(#currentNodeGradient)' : 'url(#blackMoveGradient)'}
          stroke={'gray'}
          strokeWidth={2}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={onClick}
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
      onClick={onClick}
    >
      <circle
        r={r}
        y={-r / 2}
        x={-r / 2}
        rx={5}
        fill={isCurrentNode ? 'url(#currentNodeGradient)' : node.data.attributes.move?.color === 'w' ? 'url(#whiteMoveGradient)' : 'url(#blackMoveGradient)' }
        stroke={'gray'}
        strokeWidth={isCurrentNode ? 3 : 2}
        className="transition hover:scale-110 hover:stroke-yellow-400 dark:hover:stroke-yellow-400"
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
