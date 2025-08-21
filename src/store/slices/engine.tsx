import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { EngineOutput } from '../../types';

const match = (line: string, regex: { [Symbol.match](string: string): RegExpMatchArray | null; }) => {
  const match = line.match(regex);
  return match ? +match[1] : undefined;
}

const parse = (line: string): EngineOutput => {
  const pv = line.substring(line.indexOf(" pv ") + 4);

  return {
    time: match(line, /time (\w+)/),
    speed: match(line, /nps (\w+)/),
    hashfull: match(line, /hashfull (\w+)/),
    tbhits: match(line, /tbhits (\w+)/),
    multipv: match(line, /multipv (\w+)/),
    depth: match(line, /depth (\w+)/) || 0,
    seldepth: match(line, /seldepth (\w+)/) || 0,
    cp: match(line, /score cp (-?\w+)/),
    mate: match(line, /score mate (-?\w+)/),
    pv: pv.match(/\b[a-h][1-8][a-h][1-8][qrnb]?\b/g) as string[],
  };
}

const engine = createSlice({
  name: 'engine',
  initialState: {
    output: null as EngineOutput | null,
  },
  reducers: {
    clearEngineOutput(s) { s.output = null; },
    reportEngineOutput(s, action: PayloadAction<string>) { s.output = parse(action.payload); },
    reportEngineError(_s, _a: PayloadAction<string>) {}
  },
});

export default engine;
