import { Chess } from "chess.js";
import { LcGame, LcOpeningData, TreeNodeData } from "../shared/types";
import { serializeMove } from "../shared/lib/chess";


const topGame: LcGame = {
  uci: 'd2d4',
  id: 'QR5UbqUY',
  winner: null,
  black: {
    name: 'Caruana, F.',
    rating: 2818
  },
  white: {
    name: 'Carlsen, M.',
    rating: 2882
  },
  year: 2019,
  month: '2019-08'
}

export const openings: LcOpeningData = {
  white: 10,
  draws: 20,
  black: 30,
  opening: null,
  topGames: [topGame],
  moves: [
    {
      uci: 'e2e4',
      san: 'e4',
      averageRating: 2399,
      white: 1,
      draws: 2,
      black: 3,
    },
    {
      uci: 'd2d4',
      san: 'd4',
      averageRating: 2414,
      white: 4,
      draws: 5,
      black: 6,
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
  topGames: [topGame],
  opening: null,
  averageRating: undefined,
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
      topGames: [],
      opening: {
        eco: 'A40',
        name: 'Queen\'s Pawn Game',
        uci: 'd2d4'
      },
      averageRating: 2414,
      move: serializeMove(new Chess().move('d2d4')),
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
      topGames: [],
      opening: {
        eco: 'B00',
        name: 'King\'s Pawn Game',
        uci: 'e2e4'
      },
      averageRating: 2399,
      move: serializeMove(new Chess().move('e2e4')),
      children: [],
      childCount: 0,
    },
  ]
}
