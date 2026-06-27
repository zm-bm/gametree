import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { parseEngineOutput } from '@/shared/engine';
import { EngineOutput } from '@/types';

const engine = createSlice({
  name: 'engine',
  initialState: {
    output: null as EngineOutput | null,
  },
  reducers: {
    clearEngineOutput(s) { s.output = null; },
    reportEngineOutput(s, action: PayloadAction<string>) { s.output = parseEngineOutput(action.payload); },
    reportEngineError(_s, _a: PayloadAction<string>) {}
  },
});

export default engine;
