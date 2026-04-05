import type { EngineOutput } from '@/types';

export const matchEngineNumber = (line: string, regex: RegExp) => {
  const match = line.match(regex);
  return match ? Number(match[1]) : undefined;
};

export const parseEngineOutput = (line: string): EngineOutput => {
  const pvStart = line.indexOf(' pv ');
  const pv = pvStart >= 0 ? line.slice(pvStart + 4) : '';

  return {
    time: matchEngineNumber(line, /time (\w+)/),
    speed: matchEngineNumber(line, /nps (\w+)/),
    hashfull: matchEngineNumber(line, /hashfull (\w+)/),
    tbhits: matchEngineNumber(line, /tbhits (\w+)/),
    multipv: matchEngineNumber(line, /multipv (\w+)/),
    depth: matchEngineNumber(line, /depth (\w+)/) || 0,
    seldepth: matchEngineNumber(line, /seldepth (\w+)/) || 0,
    cp: matchEngineNumber(line, /score cp (-?\w+)/),
    mate: matchEngineNumber(line, /score mate (-?\w+)/),
    pv: pv.match(/\b[a-h][1-8][a-h][1-8][qrnb]?\b/g) ?? [],
  };
};