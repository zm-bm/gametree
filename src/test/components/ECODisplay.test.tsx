import { describe, it } from "vitest";

import ECODisplay from "../../components/ECODisplay";
import { renderWithProviders } from "../../test/testUtils";
import { initialState } from "../../redux/gameSlice";
import { MoveNode } from "../../types/chess";

const moveTree: MoveNode[] = [
  {
    key: 0,
    move: null,
    parent: null,
    children: [
      1
    ]
  },
  {
    key: 1,
    move: {
      color: 'w',
      piece: 'p',
      from: 'd2',
      to: 'd4',
      san: 'd4',
      lan: 'd2d4',
      before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      after: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1'
    },
    parent: 0,
    children: [
      2
    ]
  },
  {
    key: 2,
    move: {
      color: 'b',
      piece: 'p',
      from: 'd7',
      to: 'd5',
      san: 'd5',
      lan: 'd7d5',
      before: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
      after: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'
    },
    parent: 1,
    children: [
      3
    ]
  },
  {
    key: 3,
    move: {
      color: 'w',
      piece: 'p',
      from: 'c2',
      to: 'c4',
      san: 'c4',
      lan: 'c2c4',
      before: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2',
      after: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq - 0 2'
    },
    parent: 2,
    children: []
  }
];

describe('ECODisplay', () => {
  it('displays the correct eco', () => {
    const { getByText } = renderWithProviders(<ECODisplay />, {
      preloadedState: {
        game: {
          ...initialState,
          moveIndex: 3,
          moveTree,
        }
      }
    });
    getByText('D06');
    getByText("Queen's Gambit");
  });
});
