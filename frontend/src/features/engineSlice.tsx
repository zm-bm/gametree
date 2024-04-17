import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface EngineState {
  output: string[];
}

const initialState: EngineState = {
  output: [],
};

const engineSlice = createSlice({
  name: 'engine',
  initialState,
  reducers: {
    onOutput(state, action: PayloadAction<string>) {
      state.output = state.output.concat([action.payload]);
    },
  },
});

export const { onOutput } = engineSlice.actions;
export default engineSlice.reducer;
