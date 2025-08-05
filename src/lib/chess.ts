import { Chess, Move as ChessMove, SQUARES, Square } from "chess.js";
import { Color, Key } from 'chessground/types';
import eco from '../eco.json'
import { ECO, Move, LichessMove, LichessOpenings, TreeNode } from "../types/chess";

export const book = eco as ECO[];

export function movesToString(moves: Move[]) {
  return moves.map(m => m.lan).join(',');
}

export function serializeMove(move: ChessMove): Move {
  return {
    color: move.color,
    from: move.from,
    to: move.to,
    piece: move.piece,
    captured: move.captured || undefined,
    promotion: move.promotion || undefined,
    san: move.san,
    lan: move.lan,
    before: move.before,
    after: move.after,
  };
}

export function getDests(chess: Chess) {
  const dests = new Map();
  SQUARES.forEach(s => {
    const ms = chess.moves({ square: s, verbose: true });
    if (ms.length) {
      dests.set(s, ms.map(m => m.to));
    }
  });
  return dests;
}

export function isPromotion(chess: Chess, from: Key, dest: Key) {
  const piece = chess.get(from as Square);
  return (
    piece?.type === 'p' &&
    ((piece.color === 'w' && dest[1] === '8') ||
      (piece.color === 'b' && dest[1] === '1'))
  );
}

export const colorFromFen = (fen: string) =>
  fen.split(' ').at(1) || '';

export function countGames(node: TreeNode) {
  const { white, draws, black } = node.attributes;
  if (white !== null && draws !== null && black !== null) {
    return black + draws + white;
  } else {
    return 0;
  }
}

export function calcWinRate(node: TreeNode, orientation: Color) {
  const games = countGames(node);
  if (games === 0) return 0;
  const { white, black } = node.attributes;
  return orientation === 'white' ? white / games : black / games;
}

export function filterTreeNode(
  node: TreeNode,
  minFrequency: number,
  orientation: Color,
  minWinRate: number,
): TreeNode {
  const totalGames = countGames(node);

  const children = node.children.map(child => {
    const frequency = countGames(child) / totalGames * 100;
    const winRate = calcWinRate(child, orientation) * 100;
    const isLeaf = child.children.length === 0;

    if (!isLeaf || (frequency > minFrequency && winRate > minWinRate)) {
      return filterTreeNode(child, minFrequency, orientation, minWinRate);
    }
    return null;
  });

  return {
    ...node,
    children: children.filter(c => c !== null),
  };
}

export function sortTreeNodes(nodes: TreeNode[]) {
  // return tree nodes with most frequent moves in the middle
  const result = [];
  let start = 0;
  let end = nodes.length - 1;

  nodes.sort((a, b) => countGames(a) - countGames(b));
  for (let i = 0; i < nodes.length; i++) {
    if (i % 2 === 0) {
      result[end--] = nodes[i];
    } else {
      result[start++] = nodes[i];
    }
  }
  return result;
}

export function buildTreeNode(openings: LichessOpenings, moves: Move[]): TreeNode {
  const {
    white, draws, black, topGames, opening, moves: lichessMoves,
  } = openings;

  const lastMove = moves.at(-1)
  const chess = new Chess(lastMove?.after);
  const name = movesToString(moves);

  return {
    name,
    attributes: {
      white,
      draws,
      black,
      topGames,
      opening,
      averageRating: null,
      move: lastMove ? lastMove : null,
    },
    children: sortTreeNodes(
      lichessMoves.map(move => buildTreeChild(move, chess, name))
    ),
  }
}

export function buildTreeChild(liMove: LichessMove, chess: Chess, parentName: string) {
  const { white, draws, black, averageRating, san } = liMove;
  const move = chess.move(san);
  chess.undo();
  const name = `${parentName && (parentName + ',')}${move.lan}`;
  return {
    name,
    attributes: {
      white,
      draws,
      black,
      topGames: null,
      opening: book.find(b => b.uci === name) || null,
      averageRating,
      move: serializeMove(move),
    },
    children: [],
  };
}
