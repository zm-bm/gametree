import { describe, expect, it } from "vitest";
import gameSlice, { FlipOrientation, GotoGameMove, GotoGamePath, initialState, MakeGameMove, rootNode, SetPromotionTarget } from "../../redux/gameSlice";
import { Chess } from "chess.js";

const chess = new Chess();
const d2d4 = chess.move('d2d4');
const d7d5 = chess.move('d7d5');
const c2c4 = chess.move('c2c4');

describe('gameSlice', () => {
  it('adds new moves to moveTree on MakeGameMove', () => {
    expect(gameSlice(initialState, MakeGameMove(d2d4))).toMatchObject({
      moveTree: [{
        ...rootNode,
        children: [1],
      }, {
        key: 1,
        move: d2d4,
        parent: 0,
        children: [],
      }],
      currentMove: 1,
    })
  });

  it('handles MakeGameMove with existing moves', () => {
    const move = MakeGameMove(d2d4);
    const state = gameSlice(initialState, move);
    expect(gameSlice({ ...state, moveIndex: 0 }, move)).toMatchObject(state)
  });


  it('updates currentMove on GotoGameMove', () => {
    const state = gameSlice(initialState, MakeGameMove(d2d4));
    expect(gameSlice(state, GotoGameMove(0))).toMatchObject({ currentMove: 0 })
  });

  it('makes new moves with GotoGamePath', () => {
    const d2d4State = gameSlice(initialState, MakeGameMove(d2d4));
    const d7d5State = gameSlice(d2d4State, MakeGameMove(d7d5));
    const c2c4State = gameSlice(d7d5State, MakeGameMove(c2c4));
    expect(gameSlice(d7d5State, GotoGamePath([d2d4, d7d5, c2c4]))).toMatchObject(c2c4State);
  });

  it('goes to existing moves with GotoGamePath', () => {
    const d2d4State = gameSlice(initialState, MakeGameMove(d2d4));
    const d7d5State = gameSlice(d2d4State, MakeGameMove(d7d5));
    const c2c4State = gameSlice(d7d5State, MakeGameMove(c2c4));
    expect(gameSlice(c2c4State, GotoGamePath([d2d4]))).toMatchObject({
      ...c2c4State,
      currentMove: 1,
    });
  });

  it('sets promotion target', () => {
    expect(gameSlice(initialState, SetPromotionTarget(['a7', 'a8']))).toMatchObject({
      promotionTarget: ['a7', 'a8'],
    });
  });

  it('flips orientation', () => {
    expect(gameSlice(initialState, FlipOrientation())).toMatchObject({
      orientation: 'black',
    });
  })
});

