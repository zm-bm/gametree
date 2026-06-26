import { describe, expect, it } from 'vitest';

import type { MovePath } from "@/types";
import { getECO, getECOByUciPath } from './eco';

function makePath(lans: string[]): MovePath {
  return lans.map((lan) => ({
    color: 'w',
    from: 'e2',
    to: 'e4',
    piece: 'p',
    san: lan,
    lan,
    before: 'before-fen',
    after: 'after-fen',
  }));
}

describe('opening eco helpers', () => {
  it('returns exact and nearest-prefix ECO matches from real eco.json', () => {
    expect(getECOByUciPath('e2e4,e7e5')).toEqual({
      eco: 'C20',
      name: "King's Pawn Game",
      uci: 'e2e4,e7e5',
    });

    expect(getECOByUciPath('e2e4,e7e5,a1a2')).toEqual({
      eco: 'C20',
      name: "King's Pawn Game",
      uci: 'e2e4,e7e5',
    });
  });

  it('returns null for empty or unknown paths', () => {
    expect(getECOByUciPath('')).toBeNull();
    expect(getECOByUciPath('zzzz')).toBeNull();
  });

  it('maps move paths to real UCI-path lookups', () => {
    expect(getECO(makePath(['g1h3']))).toEqual({
      eco: 'A00',
      name: 'Amar Opening',
      uci: 'g1h3',
    });

    expect(getECO(makePath([]))).toBeNull();
  });
});
