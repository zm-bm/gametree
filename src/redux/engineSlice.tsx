import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chess, DEFAULT_POSITION, Move } from 'chess.js';
import { SetDataSource } from './openingsTreeSlice';

export type Info = {
  depth: number,
  seldepth: number,
  cp?: number
  mate?: number,
  multipv: number,
  pv: Move[],
}

export type EngineOutput = {
  time?: number,
  speed?: number,
  hashfull?: number,
  tbhits?: number,
  info?: Info,
  moves?: string[],
}

export interface EngineState {
  fen: string,
  running: boolean,
  nnue: boolean,
  hash: number,
  threads: number,
  lines: number,
  infos: Info[];
  time?: number,
  speed?: number,
  hashfull?: number,
  tbhits?: number,
}

export const initialState: EngineState = {
  fen: DEFAULT_POSITION,
  running: false,
  nnue: false,
  hash: 16,
  threads: 4,
  lines: 1,
  infos: [],
  time: undefined,
  speed: undefined,
  hashfull: undefined,
  tbhits: undefined,
};

const engineSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    AddEngineOutput(state, action: PayloadAction<EngineOutput>) {
      const {
        time, speed, hashfull, tbhits, info, moves,
      } = action.payload;

      time && (state.time = time);
      speed && (state.speed = speed);
      hashfull && (state.hashfull = hashfull);
      tbhits && (state.tbhits = tbhits);

      if (moves && info) {
        const chess = new Chess(state.fen);
        info.pv = moves.map(mv => chess.move(mv));

        if (state.lines === 1) {
          state.infos = state.infos.concat([info]);
        } else {
          state.infos[info.multipv] = info;
        }
      }
    },

    ToggleEngine(state, action: PayloadAction<string>) {
      if (!state.running) {
        state.infos = [];
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
        state.infos = [];
        state.fen = action.payload;
      }
    },

    SetHash(state, action: PayloadAction<number>) {
      state.infos = [];
      state.hash = action.payload;
    },

    SetThreads(state, action: PayloadAction<number>) {
      state.infos = [];
      state.threads = action.payload;
    },

    SetLines(state, action: PayloadAction<number>) {
      state.infos = [];
      state.lines = action.payload;
    },
  },
  extraReducers(builder) {
    builder.addCase(SetDataSource, (state) => {
      state.infos = [];
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
