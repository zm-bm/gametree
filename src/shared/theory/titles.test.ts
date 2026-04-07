import { describe, expect, it } from 'vitest';

import { getExactTheoryTitles, getFenField, normalizeTheoryTitle } from './titles';

describe('theory title helpers', () => {
  it('normalizes spaces to underscores', () => {
    expect(normalizeTheoryTitle('Chess Opening Theory/1. e4')).toBe('Chess_Opening_Theory/1._e4');
  });

  it('extracts FEN first field from a node path', () => {
    expect(getFenField('e2e4,e7e5')).toBe('rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR');
  });

  it('returns root title for empty SAN history', () => {
    expect(getExactTheoryTitles([])).toEqual(['Chess_Opening_Theory']);
  });

  it('builds exact-path title variants for SAN moves', () => {
    expect(getExactTheoryTitles(['e4', 'c5', 'Nf3'])).toEqual([
      'Chess_Opening_Theory/1._e4/1...c5/2._Nf3',
      'Chess_Opening_Theory/1._e4/1..._c5/2._Nf3',
      'Chess_Opening_Theory/1.e4/1...c5/2.Nf3',
    ]);
  });

  it('strips SAN annotations when building titles', () => {
    expect(getExactTheoryTitles(['e4!', 'c5?!', 'Nf3+'])).toEqual([
      'Chess_Opening_Theory/1._e4/1...c5/2._Nf3',
      'Chess_Opening_Theory/1._e4/1..._c5/2._Nf3',
      'Chess_Opening_Theory/1.e4/1...c5/2.Nf3',
    ]);
  });
});

