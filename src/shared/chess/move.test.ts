import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';

import { serializeMove } from './move';

describe('chess move helpers', () => {
  it('serializes a chess.js move into the shared move shape', () => {
    const chess = new Chess();
    const move = chess.move('e4');

    const serialized = serializeMove(move);

    expect(serialized).toMatchObject({
      color: 'w',
      from: 'e2',
      to: 'e4',
      piece: 'p',
      san: 'e4',
      lan: 'e2e4',
    });
    expect(serialized.before).toContain(' w ');
    expect(serialized.after).toContain(' b ');
  });
});