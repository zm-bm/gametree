import { describe, expect, it } from 'vitest';

import { openingsApi } from './openingsApi';
import { theoryApi } from './theoryApi';
import { setupStore, rootReducer, store } from './index';
import { ui } from './slices';

describe('store/index', () => {
  it('builds root reducer state with expected top-level slices', () => {
    const state = rootReducer(undefined, { type: '@@INIT' });

    expect(state).toHaveProperty('engine');
    expect(state).toHaveProperty('ui');
    expect(state).toHaveProperty('tree');
    expect(state).toHaveProperty('nav');
    expect(state).toHaveProperty(openingsApi.reducerPath);
    expect(state).toHaveProperty(theoryApi.reducerPath);
  });

  it('setupStore applies supplied preloaded state', () => {
    const defaults = setupStore().getState();
    const preloaded = {
      ...defaults,
      ui: {
        ...defaults.ui,
        currentId: 'preloaded-node',
      },
    };

    const testStore = setupStore(preloaded);

    expect(testStore.getState().ui.currentId).toBe('preloaded-node');
  });

  it('configured store dispatches slice actions normally', () => {
    const testStore = setupStore();

    testStore.dispatch(ui.actions.setCurrent('next-node'));

    expect(testStore.getState().ui.currentId).toBe('next-node');
  });

  it('exports a live singleton store instance', () => {
    expect(store).toBeDefined();
    expect(typeof store.dispatch).toBe('function');
    expect(typeof store.getState).toBe('function');
  });
});
