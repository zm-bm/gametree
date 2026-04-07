import { DEFAULT_POSITION } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';

import { formatMoveLine, getFenFromPathId, getMoveFromPathId, getSanHistoryFromPathId } from './path';

describe('chess path helpers', () => {
  it('replays a path id to recover the last move and fen', () => {
    const move = getMoveFromPathId('e2e4,e7e5');

    expect(move).not.toBeNull();
    expect(move?.lan).toBe('e7e5');
    expect(move?.before).toContain(' b ');
    expect(move?.after).toContain(' w ');
    expect(getFenFromPathId('e2e4,e7e5')).toBe(move?.after);
  });

  it('returns safe fallbacks for empty and invalid path ids', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(getMoveFromPathId('')).toBeNull();
    expect(getFenFromPathId('')).toBe(DEFAULT_POSITION);
    expect(getMoveFromPathId('not-a-move')).toBeNull();
    expect(getFenFromPathId('not-a-move')).toBe(DEFAULT_POSITION);
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('returns SAN history for a valid path and an empty list for invalid paths', () => {
    expect(getSanHistoryFromPathId('e2e4,e7e5,g1f3')).toEqual(['e4', 'e5', 'Nf3']);
    expect(getSanHistoryFromPathId('not-a-move')).toEqual([]);
  });

  it('formats SAN history as a human-readable move line', () => {
    expect(formatMoveLine([])).toBe('Start position');
    expect(formatMoveLine(['e4'])).toBe('1. e4');
    expect(formatMoveLine(['e4', 'c5', 'Nf3'])).toBe('1. e4 c5 2. Nf3');
  });
});
