import { HierarchyPointNode } from "@visx/hierarchy/lib/types";
import { BookNode, MoveNode, TreeNode } from "../../chess";
import { Chess } from "chess.js";

export function countGames(node: HierarchyPointNode<TreeNode>) {
  const { wins, draws, losses } = node.data.attributes;
  if (wins && draws && losses) {
    return wins + draws + losses;
  } else {
    return 0;
  }
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
    const children: TreeNode[] = [];
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
      // add legal moves?
      // else if (moveKey === moveNode.key) {
      //   const move = chess.move(san);
      //   children.push({ name, attributes: { move } });
      //   chess.undo();
      // }
    })

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