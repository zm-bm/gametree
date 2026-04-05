import { describe, expect, it } from 'vitest';

import { setupTestStore } from '@/test/renderWithProviders';
import ui from './ui';

describe('ui slice', () => {
  it('updates basic board and selection fields', () => {
    const store = setupTestStore();

    store.dispatch(ui.actions.setCurrent('e2e4'));
    store.dispatch(ui.actions.setHover('e2e4,e7e5'));
    store.dispatch(ui.actions.setFen('8/8/8/8/8/8/8/8 b - - 0 1'));
    store.dispatch(ui.actions.setPromotionTarget(['a8']));
    store.dispatch(ui.actions.setIsDarkMode(true));

    const state = store.getState().ui;
    expect(state.currentId).toBe('e2e4');
    expect(state.hoverId).toBe('e2e4,e7e5');
    expect(state.boardFen).toBe('8/8/8/8/8/8/8/8 b - - 0 1');
    expect(state.boardPromotionTarget).toEqual(['a8']);
    expect(state.isDarkMode).toBe(true);
  });

  it('toggles orientation and engine running', () => {
    const store = setupTestStore();

    store.dispatch(ui.actions.toggleOrientation());
    store.dispatch(ui.actions.toggleEngine());

    expect(store.getState().ui.boardOrientation).toBe('black');
    expect(store.getState().ui.engineRunning).toBe(true);

    store.dispatch(ui.actions.toggleOrientation());
    store.dispatch(ui.actions.toggleEngine());

    expect(store.getState().ui.boardOrientation).toBe('white');
    expect(store.getState().ui.engineRunning).toBe(false);
  });

  it('updates tree display settings', () => {
    const store = setupTestStore();

    store.dispatch(ui.actions.setTreeSource('online'));
    store.dispatch(ui.actions.setTreeMinFrequencyPct(12));
    store.dispatch(ui.actions.setTreeMoveLimit(15));
    store.dispatch(ui.actions.setTreeWinRateComparison('absolute'));

    const state = store.getState().ui;
    expect(state.treeSource).toBe('online');
    expect(state.treeMinFrequencyPct).toBe(12);
    expect(state.treeMoveLimit).toBe(15);
    expect(state.treeWinRateComparison).toBe('absolute');
  });

  it('updates engine option fields', () => {
    const store = setupTestStore();

    store.dispatch(ui.actions.setEngineRunning(true));
    store.dispatch(ui.actions.setEngineHash(128));
    store.dispatch(ui.actions.setEngineThreads(4));

    const state = store.getState().ui;
    expect(state.engineRunning).toBe(true);
    expect(state.engineHash).toBe(128);
    expect(state.engineThreads).toBe(4);
  });
});
