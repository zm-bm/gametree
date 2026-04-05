import { describe, expect, it } from 'vitest';

import { createTestMove } from '@/test/treeFixtures';
import nav from './nav';

describe('nav slice', () => {
  it('creates intent actions with expected payloads', () => {
    const move = createTestMove({ lan: 'e2e4' });

    expect(nav.actions.navigateToId('e2e4')).toMatchObject({
      type: 'nav/navigateToId',
      payload: 'e2e4',
    });
    expect(nav.actions.commitMove(move)).toMatchObject({
      type: 'nav/commitMove',
      payload: move,
    });
  });

  it('keeps nav state unchanged for all intent reducers', () => {
    const initialState = nav.reducer(undefined, { type: '@@INIT' });
    const move = createTestMove();

    const finalState = [
      nav.actions.navigateUp(),
      nav.actions.navigateDown(),
      nav.actions.navigatePrevSibling(),
      nav.actions.navigateNextSibling(),
      nav.actions.navigateToId('e2e4'),
      nav.actions.commitMove(move),
    ].reduce((state, action) => nav.reducer(state, action), initialState);

    expect(initialState).toEqual({});
    expect(finalState).toEqual(initialState);
  });
});
