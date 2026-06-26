import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearDebugLogs,
  getDebugLogs,
  isDebugLoggingEnabled,
  logDebug,
} from './debug';

type DebugGlobalLike = {
  __DEBUG__?: boolean;
  __GAMETREE_DEBUG__?: boolean;
};

const globals = globalThis as typeof globalThis & DebugGlobalLike;
const debugBufferStorageKey = 'gametreeDebugBuffer';

afterEach(() => {
  clearDebugLogs();
  localStorage.clear();
  delete globals.__DEBUG__;
  delete globals.__GAMETREE_DEBUG__;
  vi.restoreAllMocks();
});

describe('shared/debug', () => {
  it('reads debug enabled state from runtime globals and storage', () => {
    if (!import.meta.env.DEV) {
      expect(isDebugLoggingEnabled()).toBe(false);
      return;
    }

    expect(isDebugLoggingEnabled()).toBe(false);

    globals.__DEBUG__ = true;
    expect(isDebugLoggingEnabled()).toBe(true);

    globals.__DEBUG__ = false;
    globals.__GAMETREE_DEBUG__ = true;
    expect(isDebugLoggingEnabled()).toBe(false);

    delete globals.__DEBUG__;
    expect(isDebugLoggingEnabled()).toBe(true);

    delete globals.__GAMETREE_DEBUG__;
    localStorage.setItem('gametreeDebug', '1');
    expect(isDebugLoggingEnabled()).toBe(true);
  });

  it('stores debug logs in localStorage and prints to console when enabled', () => {
    if (!import.meta.env.DEV) {
      expect(getDebugLogs()).toEqual([]);
      return;
    }

    globals.__DEBUG__ = true;
    const consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

    logDebug('worker', 'uci ->', 'go depth 15');

    const logs = getDebugLogs();
    expect(logs).toHaveLength(1);
    expect(logs[0]).toMatchObject({
      scope: 'worker',
      message: 'uci ->',
      data: 'go depth 15',
    });
    expect(consoleDebugSpy).toHaveBeenCalledWith('[worker] uci ->', 'go depth 15');

    const persistedRaw = localStorage.getItem(debugBufferStorageKey);
    expect(persistedRaw).not.toBeNull();
    const persisted = JSON.parse(persistedRaw || '[]');
    expect(persisted).toHaveLength(1);
  });

  it('does not log while disabled and clears persisted logs', () => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});

    logDebug('worker', 'ignored');
    expect(getDebugLogs()).toEqual([]);

    localStorage.setItem('gametreeDebug', '1');
    logDebug('worker', 'saved');
    expect(getDebugLogs()).toHaveLength(1);

    clearDebugLogs();

    expect(getDebugLogs()).toEqual([]);
    expect(localStorage.getItem(debugBufferStorageKey)).toBeNull();
  });
});
