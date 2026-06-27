import { describe, expect, it, vi } from 'vitest';

import { setupTestStore } from '@/test/renderWithProviders';
import engine from './engine';

describe('engine slice', () => {
  it('stores parsed output from reportEngineOutput', () => {
    const store = setupTestStore();

    store.dispatch(
      engine.actions.reportEngineOutput(
        'info depth 18 seldepth 24 score cp 56 nps 1000 time 40 pv e2e4 e7e5'
      )
    );

    expect(store.getState().engine.output).toMatchObject({
      depth: 18,
      seldepth: 24,
      cp: 56,
      speed: 1000,
      time: 40,
      pv: ['e2e4', 'e7e5'],
    });
  });

  it('clears output with clearEngineOutput', () => {
    const store = setupTestStore();

    store.dispatch(engine.actions.reportEngineOutput('info depth 10 seldepth 10 score cp 12 pv e2e4'));
    store.dispatch(engine.actions.clearEngineOutput());

    expect(store.getState().engine.output).toBeNull();
  });

  it('reportEngineError is a no-op for state', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = setupTestStore({
      engine: {
        output: {
          depth: 10,
          seldepth: 12,
          cp: 30,
          pv: ['e2e4'],
        },
      },
    });

    store.dispatch(engine.actions.reportEngineError('boom'));

    expect(store.getState().engine.output).toEqual({
      depth: 10,
      seldepth: 12,
      cp: 30,
      pv: ['e2e4'],
    });

    consoleErrorSpy.mockRestore();
  });
});
