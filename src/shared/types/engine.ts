export type EngineOutput = {
  depth: number,
  seldepth: number,
  multipv?: number,
  cp?: number
  mate?: number,
  pv?: string[],
  time?: number,
  speed?: number,
  hashfull?: number,
  tbhits?: number,
};
