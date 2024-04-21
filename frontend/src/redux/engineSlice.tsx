import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { parseSpeed } from '../helpers';
import { restartStore, restartWorker } from '../store';

interface EngineState {
  running: boolean,
  locked: boolean,
  nnue: boolean,
  hash: number,
  threads: number,
  lines: number,
  output: string[];
  nps?: number,
}

const initialState: EngineState = {
  running: false,
  locked: false,
  nnue: false,
  hash: 16,
  threads: 8,
  lines: 1,
  output: [],
  nps: undefined,
};

const engineSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    TOGGLE_ENGINE(state) {
      state.running = !state.running;
    },
    TOGGLE_ENGINE_LOCK(state) {
      state.locked = !state.locked;
    },
    UCI_ENGINE_ERROR() {
      (window as any).worker.terminate()
      restartWorker()
    },
    UCI_ENGINE_OUTPUT(state, action: PayloadAction<string>) {
      state.output = state.output.concat([action.payload]);
      if (state.output.length > 200) {
        state.output.shift()
      }
      
      const tokens = action.payload.split(' ')
      switch (tokens[0]) {
        case 'info':
          state.nps = parseSpeed(action.payload)
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
});

export const {
  UCI_ENGINE_OUTPUT, UCI_ENGINE_ERROR,
  TOGGLE_ENGINE, SET_HASH, SET_THREADS, SET_LINES
} = engineSlice.actions;
export default engineSlice.reducer;
