import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { parseCp, parseDepth, parseHashfull, parseMate, parseMoves, parseMultiPV, parseSelDepth, parseSpeed, parseTBHits, parseTime } from "../lib/parsers";
import { GOTO_MOVE, MAKE_MOVE } from './actions';
import { Chess, DEFAULT_POSITION, Move } from 'chess.js';

export type Info = {
  depth: number,
  seldepth: number,
  cp?: number
  mate?: number,
  multipv: number,
  pv: Move[],
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

const initialState: EngineState = {
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
    TOGGLE_ENGINE(state, action: PayloadAction<string>) {
      if (!state.running) {
        state.infos = []
        state.fen = action.payload
      } 
      state.running = !state.running;
    },
    UCI_ENGINE_ERROR(state, action: PayloadAction<string>) {
      console.error(action.payload)
      if (action.payload.includes('OOM')) {
        window.alert(`Engine failure: ${action.payload}`)
        state.threads /= 2
      }
    },
    UCI_ENGINE_OUTPUT(state, action: PayloadAction<string>) {
      const tokens = action.payload.split(' ')
      switch (tokens[0]) {
        case 'info':
          const time = parseTime(action.payload)
          time && (state.time = time)
          const speed = parseSpeed(action.payload)
          speed && (state.speed = speed)
          const hashfull = parseHashfull(action.payload)
          hashfull && (state.hashfull = hashfull)
          const tbhits = parseTBHits(action.payload)
          tbhits && (state.tbhits = tbhits)

          if (action.payload.includes(' pv ') && !action.payload.includes('upperbound') && !action.payload.includes('lowerbound')) {
            const moves = parseMoves(action.payload)
            const chess = new Chess(state.fen)
            const pv = moves.map(mv => chess.move(mv))

            const info = {
              depth: parseDepth(action.payload),
              seldepth: parseSelDepth(action.payload),
              cp: parseCp(action.payload),
              mate: parseMate(action.payload),
              multipv: parseMultiPV(action.payload),
              pv,
            }

            if (state.lines === 1) {
              state.infos = state.infos.concat([info]);
            } else {
              state.infos[info.multipv] = info
            }
          }
          break
        case 'Load':
          if (action.payload === 'Load eval file success: 1') {
            state.nnue = true
          } else if (action.payload === 'Load eval file success: 0') {
            state.nnue = false
          }
          break;
        default:
          break;
      }
    },
    SET_HASH(state, action: PayloadAction<number>) {
      state.hash = action.payload
    },
    SET_THREADS(state, action: PayloadAction<number>) {
      state.threads = action.payload
    },
    SET_LINES(state, action: PayloadAction<number>) {
      state.lines = action.payload
    },
  },
  extraReducers(builder) {
    builder.addCase(MAKE_MOVE, (state, action) => {
      if (state.running) {
        state.infos = []
        state.fen = action.payload.after
      }
    })
    builder.addCase(GOTO_MOVE, (state, action) => {
      if (state.running) {
        state.infos = []
        state.fen = action.payload.fen
      }

    })
  },
});

export const {
  UCI_ENGINE_OUTPUT, UCI_ENGINE_ERROR,
  TOGGLE_ENGINE, SET_HASH, SET_THREADS, SET_LINES
} = engineSlice.actions;
export default engineSlice.reducer;
