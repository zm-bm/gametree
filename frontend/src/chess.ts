import { Chess, Move, SQUARES, Square } from "chess.js";
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

export type ECO = {
  ECO?: string,
  name?: string,
  [key: string]: string | ECO | undefined,
}

export type TreeNode = {
  name: string,
  attributes?: {
    ECO?: string,
  },
  children?: TreeNode[],
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

export const buildOpeningTree = (input: ECO, altName: string = 'start') => {
  const result: TreeNode = {
    name: input.name || altName,
    attributes: {
      ECO: input.ECO,
    },
    children: [],
  };

  Object.keys(input).forEach(key => {
    if (key !== "ECO" && key !== "name") {
      const childNode = buildOpeningTree(input[key] as ECO, result.name+' '+key);
      result.children!.push(childNode);
    }
  });

  if (result.children?.length === 0) {
    delete result.children;
  }

  return result;
}
