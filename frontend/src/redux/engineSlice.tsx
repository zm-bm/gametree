import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EngineState {
  running: boolean,
  locked: boolean,
  output: string[];
}

const initialState: EngineState = {
  running: false,
  locked: false,
  output: [],
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
    UCI_ENGINE_OUTPUT(state, action: PayloadAction<string>) {
      state.output = state.output.concat([action.payload]);
    },
  },
});

export const { UCI_ENGINE_OUTPUT, TOGGLE_ENGINE } = engineSlice.actions;
export default engineSlice.reducer;
