import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EngineState {
  running: boolean,
  fen: string,
  output: string[];
}

const initialState: EngineState = {
  running: false,
  fen: 'startpos',
  output: [],
};

const engineSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    TOGGLE_ENGINE(state) {
      state.running = !state.running;
    },
    UCI_ENGINE_OUTPUT(state, action: PayloadAction<string>) {
      state.output = state.output.concat([action.payload]);
    },
  },
});

export const { UCI_ENGINE_OUTPUT, TOGGLE_ENGINE } = engineSlice.actions;
export default engineSlice.reducer;
