import { beforeEach, describe, expect, it, vi } from 'vitest';

const { startEngineMock, stopEngineMock, initializeEngineMock } = vi.hoisted(() => ({
  startEngineMock: vi.fn(),
  stopEngineMock: vi.fn(),
  initializeEngineMock: vi.fn(),
}));

vi.mock('@/worker', () => ({
  startEngine: startEngineMock,
  stopEngine: stopEngineMock,
  initializeEngine: initializeEngineMock,
}));

import { setupTestStore } from '@/test/renderWithProviders';
import { engine, ui } from '@/store/slices';

const makeEngineOutput = () => ({
  depth: 10,
  seldepth: 12,
  cp: 30,
  pv: ['e2e4'],
});

describe('engine listeners', () => {
  beforeEach(() => {
    startEngineMock.mockReset();
    stopEngineMock.mockReset();
    initializeEngineMock.mockReset();
  });

  it('toggleEngine on clears output and starts engine', async () => {
    const store = setupTestStore({
      ui: { engineRunning: false },
      engine: { output: makeEngineOutput() },
    });

    store.dispatch(ui.actions.toggleEngine());

    await vi.waitFor(() => {
      expect(store.getState().ui.engineRunning).toBe(true);
      expect(store.getState().engine.output).toBeNull();
      expect(startEngineMock).toHaveBeenCalledTimes(1);
      expect(stopEngineMock).not.toHaveBeenCalled();
    });
  });

  it('toggleEngine off stops engine without clearing existing output', async () => {
    const output = makeEngineOutput();
    const store = setupTestStore({
      ui: { engineRunning: true },
      engine: { output },
    });

    store.dispatch(ui.actions.toggleEngine());

    await vi.waitFor(() => {
      expect(store.getState().ui.engineRunning).toBe(false);
      expect(stopEngineMock).toHaveBeenCalledTimes(1);
      expect(startEngineMock).not.toHaveBeenCalled();
    });
    expect(store.getState().engine.output).toEqual(output);
  });

  it('setEngineHash while running clears output and restarts search', async () => {
    const store = setupTestStore({
      ui: { engineRunning: true },
      engine: { output: makeEngineOutput() },
    });

    store.dispatch(ui.actions.setEngineHash(128));

    await vi.waitFor(() => {
      expect(store.getState().ui.engineHash).toBe(128);
      expect(store.getState().engine.output).toBeNull();
      expect(startEngineMock).toHaveBeenCalledTimes(1);
      expect(stopEngineMock).not.toHaveBeenCalled();
    });
  });

  it('setEngineHash while stopped updates option without starting engine', async () => {
    const output = makeEngineOutput();
    const store = setupTestStore({
      ui: { engineRunning: false },
      engine: { output },
    });

    store.dispatch(ui.actions.setEngineHash(64));

    await vi.waitFor(() => {
      expect(store.getState().ui.engineHash).toBe(64);
    });
    expect(store.getState().engine.output).toEqual(output);
    expect(startEngineMock).not.toHaveBeenCalled();
    expect(stopEngineMock).not.toHaveBeenCalled();
  });

  it('setCurrent clears output and starts engine when running', async () => {
    const store = setupTestStore({
      ui: { engineRunning: true },
      engine: { output: makeEngineOutput() },
    });

    store.dispatch(ui.actions.setCurrent('e2e4'));

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe('e2e4');
      expect(store.getState().engine.output).toBeNull();
      expect(startEngineMock).toHaveBeenCalledTimes(1);
    });
  });

  it('reportEngineError logs error and forces engine to stop', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const store = setupTestStore({
      ui: { engineRunning: true },
      engine: { output: makeEngineOutput() },
    });

    store.dispatch(engine.actions.reportEngineError('boom'));

    await vi.waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Engine error:', 'boom');
      expect(store.getState().ui.engineRunning).toBe(false);
      expect(stopEngineMock).toHaveBeenCalledTimes(1);
    });

    consoleErrorSpy.mockRestore();
  });
});
