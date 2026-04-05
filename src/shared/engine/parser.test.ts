import { describe, expect, it } from 'vitest';

import { matchEngineNumber, parseEngineOutput } from './parser';

describe('engine parser helpers', () => {
  it('matchEngineNumber returns numeric captures and undefined when missing', () => {
    expect(matchEngineNumber('info depth 20', /depth (\w+)/)).toBe(20);
    expect(matchEngineNumber('info score cp -34', /score cp (-?\w+)/)).toBe(-34);
    expect(matchEngineNumber('info depth 20', /seldepth (\w+)/)).toBeUndefined();
  });

  it('parseEngineOutput parses cp lines and principal variation', () => {
    const output = parseEngineOutput(
      'info depth 20 seldepth 32 multipv 1 score cp 34 nodes 12345 nps 456 hashfull 8 tbhits 2 time 100 pv e2e4 e7e5 g1f3'
    );

    expect(output).toEqual({
      depth: 20,
      seldepth: 32,
      multipv: 1,
      cp: 34,
      mate: undefined,
      time: 100,
      speed: 456,
      hashfull: 8,
      tbhits: 2,
      pv: ['e2e4', 'e7e5', 'g1f3'],
    });
  });

  it('parseEngineOutput parses mate lines and defaults missing depth fields to 0', () => {
    const output = parseEngineOutput('info score mate -3 pv e7e8q');

    expect(output).toEqual({
      depth: 0,
      seldepth: 0,
      multipv: undefined,
      cp: undefined,
      mate: -3,
      time: undefined,
      speed: undefined,
      hashfull: undefined,
      tbhits: undefined,
      pv: ['e7e8q'],
    });
  });
});
