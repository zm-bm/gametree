import { createSlice } from '@reduxjs/toolkit';
import { MoveNode } from '../chess';
import { GOTO_MOVE, MAKE_MOVE } from './actions';

interface GameState {
  moveTree: MoveNode[],
  key: number
}

export const rootNode = {
  key: 0,
  move: null,
  parent: null,
  children: [],
}

const initialState: GameState = {
  moveTree: [rootNode],
  key: 0,
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder.addCase(GOTO_MOVE, (state, action) => {
      state.key = action.payload.key
    })
    builder.addCase(MAKE_MOVE, (state, action) => {
      const prev = state.moveTree[state.key];
      const existingKey = prev.children.find(
        (ch: number) => state.moveTree[ch].move?.lan === action.payload.lan
      )

      if (existingKey === undefined) {
        // if new move, add to move tree + update key
        const key = state.moveTree.length
        prev.children.push(key)
        state.moveTree.push({
          key,
          move: action.payload,
          parent: state.key,
          children: [],
        })
        state.key = key
      } else {
        // if previously made move, update key
        state.key = existingKey
      }
    })
  },
});

export const {} = gameSlice.actions;
export default gameSlice.reducer;