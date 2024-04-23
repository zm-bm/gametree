import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { parseCp, parseDepth, parseHashfull, parseMate, parseMoves, parseMultiPV, parseSelDepth, parseSpeed, parseTBHits, parseTime } from "../lib/parsers";
import { GOTO_MOVE, MAKE_MOVE } from './actions';

export type Info = {
  depth: number,
  seldepth: number,
  cp?: number
  mate?: number,
  multipv: number,
  pv: string[],
}

export interface EngineState {
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
  running: false,
  nnue: false,
  hash: 16,
  threads: 8,
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
    TOGGLE_ENGINE(state) {
      if (!state.running)
        state.infos = []
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

          if (action.payload.includes(' pv ')) {
            const info = {
              depth: parseDepth(action.payload),
              seldepth: parseSelDepth(action.payload),
              cp: parseCp(action.payload, 'w'),
              mate: parseMate(action.payload, 'w'),
              multipv: parseMultiPV(action.payload),
              pv: parseMoves(action.payload),
            }

            console.log(info)
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
      state.infos = []
    },
    SET_THREADS(state, action: PayloadAction<number>) {
      state.threads = action.payload
      state.infos = []
    },
    SET_LINES(state, action: PayloadAction<number>) {
      state.lines = action.payload
      state.infos = []
    },
  },
  extraReducers(builder) {
    builder.addCase(GOTO_MOVE, (state) => {
      state.infos = []
    })
    builder.addCase(MAKE_MOVE, (state) => {
      state.infos = []
    })
  },
});

export const {
  UCI_ENGINE_OUTPUT, UCI_ENGINE_ERROR,
  TOGGLE_ENGINE, SET_HASH, SET_THREADS, SET_LINES
} = engineSlice.actions;
export default engineSlice.reducer;
