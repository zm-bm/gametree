import { Chess } from "chess.js";
import { OpeningTotals, TreeViewNode } from "../shared/types";
import { serializeMove } from "../shared/lib/chess";


export const openings: OpeningTotals = {
  play: [],
  otb: {
    white: 10,
    draws: 20,
    black: 30,
    total: 60,
  },
  online: {
    white: 5,
    draws: 10,
    black: 15,
    total: 30,
  },
  moves: [
    {
      uci: 'e2e4',
      otb: {
        white: 1,
        draws: 2,
        black: 3,
        total: 6,
      },
      online: {
        white: 0,
        draws: 1,
        black: 2,
        total: 3,
      },
      total: 9,
    },
    {
      uci: 'd2d4',
      otb: {
        white: 4,
        draws: 5,
        black: 6,
        total: 15,
      },
      online: {
        white: 2,
        draws: 3,
        black: 1,
        total: 6,
      },
      total: 21,
    },
  ]
};

export const treeNode: TreeViewNode = {
  id: '',
  childrenLoaded: true,
  loading: false,
  edgeStats: {
    otb: { white: 10, draws: 20, black: 30, total: 60 },
    online: { white: 5, draws: 10, black: 15, total: 30 },
  },
  positionStats: {
    otb: { white: 10, draws: 20, black: 30, total: 60 },
    online: { white: 5, draws: 10, black: 15, total: 30 },
  },
  white: 10,
  draws: 20,
  black: 30,
  total: 60,
  move: null,
  childCount: 2,
  children: [
    {
      id: 'd2d4',
      childrenLoaded: false,
      loading: false,
      edgeStats: {
        otb: { white: 4, draws: 5, black: 6, total: 15 },
        online: { white: 2, draws: 3, black: 1, total: 6 },
      },
      positionStats: {
        otb: { white: 4, draws: 5, black: 6, total: 15 },
        online: { white: 2, draws: 3, black: 1, total: 6 },
      },
      white: 4,
      draws: 5,
      black: 6,
      total: 15,
      move: serializeMove(new Chess().move('d4')),
      children: [],
      childCount: 0,
    },
    {
      id: 'e2e4',
      childrenLoaded: false,
      loading: false,
      edgeStats: {
        otb: { white: 1, draws: 2, black: 3, total: 6 },
        online: { white: 0, draws: 1, black: 2, total: 3 },
      },
      positionStats: {
        otb: { white: 1, draws: 2, black: 3, total: 6 },
        online: { white: 0, draws: 1, black: 2, total: 3 },
      },
      white: 1,
      draws: 2,
      black: 3,
      total: 6,
      move: serializeMove(new Chess().move('e4')),
      children: [],
      childCount: 0,
    },
  ]
}
