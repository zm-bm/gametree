import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_POSITION } from 'chess.js';
import { SetDataSource } from './treeSlice';

export type EngineOutput = {
  depth: number,
  seldepth: number,
  multipv: number,
  cp?: number
  mate?: number,
  pv?: string[],
  time?: number,
  speed?: number,
  hashfull?: number,
  tbhits?: number,
}

export interface EngineState {
  fen: string,
  running: boolean,
  nnue: boolean,
  hash: number,
  threads: number,
  lines: number,
  output: EngineOutput[],
}

export const initialState: EngineState = {
  fen: DEFAULT_POSITION,
  running: false,
  nnue: false,
  hash: 16,
  threads: 1,
  lines: 1,
  output: [],
};

const engineSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    AddEngineOutput(state, action: PayloadAction<EngineOutput>) {
      state.output[action.payload.multipv] = action.payload;
    },

    ToggleEngine(state, action: PayloadAction<string>) {
      if (!state.running) {
        state.output = [];
        state.fen = action.payload;
      } 
      state.running = !state.running;
    },

    EngineError(state, action: PayloadAction<string>) {
      console.error(action.payload);
      if (action.payload.includes('OOM')) {
        console.error(`Engine failure: ${action.payload}`);
        state.threads /= 2;
      }
    },

    UpdateFen(state, action: PayloadAction<string>) {
      if (state.running) {
        state.output = [];
        state.fen = action.payload;
      }
    },

    SetHash(state, action: PayloadAction<number>) {
      state.output = [];
      state.hash = action.payload;
    },

    SetThreads(state, action: PayloadAction<number>) {
      state.output = [];
      state.threads = action.payload;
    },

    SetLines(state, action: PayloadAction<number>) {
      state.output = [];
      state.lines = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(SetDataSource, (state) => {
      state.output = [];
      state.fen = DEFAULT_POSITION;
    })
  },
});

export type EngineAction = ReturnType<typeof engineSlice.actions[keyof typeof engineSlice.actions]>;
export const {
  AddEngineOutput,
  EngineError,
  UpdateFen,
  ToggleEngine,
  SetHash,
  SetThreads,
  SetLines,
} = engineSlice.actions;
export default engineSlice.reducer;
