import { TransformMatrix } from "@visx/zoom/lib/types";
import { BookNode, MoveNode, TreeNode } from "../../chess";
import { Chess } from "chess.js";

export type ZoomState = {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
}

export function countGames(node: TreeNode) {
  const { wins, draws, losses } = node.attributes;
  if (wins && draws && losses) {
    return wins + draws + losses;
  } else {
    return 0;
  }
}

function sortTreeNodes(nodes: TreeNode[]) {
  // return tree nodes with most frequent moves in the middle
  let result = [];
  let start = 0;
  let end = nodes.length - 1;

  nodes.sort((a, b) => countGames(a) - countGames(b))
  for (let i = 0; i < nodes.length; i++) {
    if (i % 2 === 0) {
      result[end--] = nodes[i];
    } else {
      result[start++] = nodes[i];
    }
  }
  return result;
}

export const generateGameTree = (
  moveTree: MoveNode[],
  opening?: BookNode,
): TreeNode => {
  const build = (
    moveNode: MoveNode,
    chess: Chess,
    opening?: BookNode,
  ): TreeNode => {
    // make node name from move history
    const name = chess.history().join(',');
    // get list of legal moves from current position
    const moves = chess.moves();
    // create tree nodes for children
    var children: TreeNode[] = [];
    moves.forEach(san => {
      // get opening for child if any
      const childOpening = opening?.children?.find(n => n.move === san);
      // if move exists in moveTree, recurse
      const madeMove = moveNode.children.find(n => moveTree[n].move?.san === san);
      if (madeMove !== undefined) {
        chess.move(san);
        children.push(build(moveTree[madeMove], chess, childOpening));
        chess.undo();
      } else if (childOpening) {
        // if move exists in opening, add it
        const move = chess.move(san);
        const { code, title, wins, draws, losses } = childOpening;
        children.push({
          name: `${name},${san}`,
          attributes: {
            turn: chess.turn(),
            move, code, title, wins, draws, losses,
          }
        });
        chess.undo();
      }
    })

    children = sortTreeNodes(children)

    const { code, title, wins, draws, losses } = opening || {};
    return {
      name,
      children,
      attributes: {
        move: moveNode.move || undefined,
        turn: chess.turn(),
        title, code, wins, draws, losses,
      },
    };
  }

  const chess = new Chess()
  return build(moveTree[0], chess, opening)
}