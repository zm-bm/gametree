import { Chess, Color, Move, SQUARES, Square } from "chess.js";
import * as cg from 'chessground/types';

export type MoveNode = {
  key: number,
  move: Move | null,
  parent: number | null,
  children: number[],
}

export type MoveTarget = {
  key: number,
  fen: string
}

export type TreeNode = {
  name: string,
  attributes: {
    move?: Move,
    turn?: Color,
    code?: string,
    title?: string
    wins?: number,
    draws?: number,
    losses?: number,
  },
  children?: TreeNode[],
}

export type BookNode = {
  code?: string,
  title?: string
  move?: string,
  wins: number,
  draws: number,
  losses: number,
  children?: BookNode[],
}

export function getDests(chess: Chess) {
  const dests = new Map();
  SQUARES.forEach(s => {
    const ms = chess.moves({square: s, verbose: true});
    if (ms.length) {
      dests.set(s, ms.map(m => m.to));
    }
  });
  return dests;
}

export function isPromotion(chess: Chess, from: cg.Key, dest: cg.Key) {
  const piece = chess.get(from as Square);
  return (
    piece.type === 'p' &&
    ((piece.color === 'w' && dest[1] === '8') ||
     (piece.color === 'b' && dest[1] === '1'))
  );
}

export const colorFromFen = (fen: string) =>
  fen.split(' ').at(1) || '';

export const moveNumFromFen = (fen: string) =>
  fen.split(' ').at(-1) || '';

export const piecesFromFen = (fen: string) => {
  return fen.split(' ').at(0) || '';
}


export type ECO = {
  code?: string,
  name?: string,
  [key: string]: string | ECO | undefined,
}

export function buildOpeningTree(input: ECO): BookNode {
  function build(eco: ECO, chess: Chess, move?: string) {
    const result: BookNode = {
      code: eco.code,
      title: eco.name,
      move,
      children: [],
      wins: 0,
      draws: 0,
      losses: 0,
    };

    Object.keys(eco).forEach(key => {
      if (key !== "code" && key !== "name") {
        const childNode = build(eco[key] as ECO, chess, key);
        result.children!.push(childNode);
      }
    });

    if (move) {
      chess.undo()
    }

    if (result.children?.length === 0) {
      delete result.children;
    }

    return result;
  }

  const chess = new Chess()
  return build(input, chess)
}
