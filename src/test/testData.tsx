import { Chess } from "chess.js";
import { LcOpeningData, TreeNodeData } from "../shared/types";
import { serializeMove } from "../shared/lib/chess";


export const openings: LcOpeningData = {
  source: 'otb',
  play: [],
  white: 10,
  draws: 20,
  black: 30,
  total: 60,
  moves: [
    {
      uci: 'e2e4',
      white: 1,
      draws: 2,
      black: 3,
      total: 6,
    },
    {
      uci: 'd2d4',
      white: 4,
      draws: 5,
      black: 6,
      total: 15,
    },
  ]
};

export const treeNode: TreeNodeData = {
  id: '',
  childrenLoaded: true,
  collapsed: false,
  loading: false,
  white: 10,
  draws: 20,
  black: 30,
  move: null,
  childCount: 2,
  children: [
    {
      id: 'd2d4',
      childrenLoaded: false,
      collapsed: false,
      loading: false,
      white: 4,
      draws: 5,
      black: 6,
      move: serializeMove(new Chess().move('d4')),
      children: [],
      childCount: 0,
    },
    {
      id: 'e2e4',
      childrenLoaded: false,
      collapsed: false,
      loading: false,
      white: 1,
      draws: 2,
      black: 3,
      move: serializeMove(new Chess().move('e4')),
      children: [],
      childCount: 0,
    },
  ]
}
