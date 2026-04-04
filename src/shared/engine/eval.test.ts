import { describe, expect, it } from 'vitest';

import type { EngineOutput } from "@/types";
import {
  formatEngineEval,
  getEngineBarCp,
  getNormalizedEngineScore,
} from './eval';

describe('engine eval helpers', () => {
  it('normalizes cp score for perspective and white conventions', () => {
    const output: EngineOutput = { depth: 10, seldepth: 12, cp: 120 };

    expect(
      getNormalizedEngineScore(output, {
        sideToMove: 'white',
        orientation: 'white',
        convention: 'perspective',
      })
    ).toEqual({ cp: 120, mate: undefined });

    expect(
      getNormalizedEngineScore(output, {
        sideToMove: 'white',
        orientation: 'black',
        convention: 'perspective',
      })
    ).toEqual({ cp: -120, mate: undefined });

    expect(
      getNormalizedEngineScore(output, {
        sideToMove: 'black',
        orientation: 'white',
        convention: 'white',
      })
    ).toEqual({ cp: -120, mate: undefined });
  });

  it('formats cp and mate output', () => {
    expect(
      formatEngineEval(
        { depth: 10, seldepth: 10, cp: 134 },
        { sideToMove: 'white', orientation: 'white', convention: 'white' },
        'en-US'
      )
    ).toBe('+1.3');

    expect(
      formatEngineEval(
        { depth: 10, seldepth: 10, mate: -3 },
        { sideToMove: 'white', orientation: 'white', convention: 'white' }
      )
    ).toBe('-M3');

    expect(formatEngineEval(null, { sideToMove: 'white', orientation: 'white' })).toBe('-');
  });

  it('maps normalized scores to engine bar cp values', () => {
    expect(getEngineBarCp({ cp: 85 })).toBe(85);
    expect(getEngineBarCp({ mate: 4 })).toBe(1000);
    expect(getEngineBarCp({ mate: -1 })).toBe(-1000);
    expect(getEngineBarCp({})).toBe(0);
  });
});
