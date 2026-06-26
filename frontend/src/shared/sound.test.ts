import { afterEach, describe, expect, it, vi } from 'vitest';

import { playMoveSound } from './sound';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('playMoveSound', () => {
  it('smoke: playMoveSound can be called without throwing', () => {
    const oscillator = {
      type: '',
      frequency: { value: 0 },
      connect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      onended: null as (() => void) | null,
    };

    vi.stubGlobal('AudioContext', vi.fn(() => ({
      currentTime: 0,
      destination: {},
      createBiquadFilter: () => ({
        type: '',
        frequency: { value: 0 },
        Q: { value: 0 },
        connect: vi.fn(),
      }),
      createOscillator: () => oscillator,
      createGain: () => ({
        gain: {
          setValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
      }),
      close: vi.fn(),
    })));

    expect(() => playMoveSound()).not.toThrow();
  });
});
