import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSkeletonGateRegistry } from './skeletonGate';

describe('skeleton gate registry', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows after delay and tracks state transitions', () => {
    vi.useFakeTimers();

    let now = 0;
    const show = vi.fn();
    const gate = createSkeletonGateRegistry({
      showAfterMs: 100,
      minVisibleMs: 0,
      now: () => now,
    }).ensure('node');

    gate.start(show);
    expect(gate.state()).toBe('scheduled');

    vi.advanceTimersByTime(99);
    expect(show).not.toHaveBeenCalled();
    expect(gate.state()).toBe('scheduled');

    now = 100;
    vi.advanceTimersByTime(1);
    expect(show).toHaveBeenCalledTimes(1);
    expect(gate.state()).toBe('shown');
  });

  it('resolves immediately when still scheduled', () => {
    vi.useFakeTimers();

    const show = vi.fn();
    const remove = vi.fn();
    const registry = createSkeletonGateRegistry({ showAfterMs: 100, minVisibleMs: 200 });
    const gate = registry.ensure('node');

    gate.start(show);
    gate.resolve(remove);

    expect(remove).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(200);
    expect(show).not.toHaveBeenCalled();
    expect(registry.ensure('node').state()).toBe('idle');
  });

  it('keeps shown skeleton visible for minimum duration before removal', () => {
    vi.useFakeTimers();

    let now = 0;
    const remove = vi.fn();
    const gate = createSkeletonGateRegistry({
      showAfterMs: 50,
      minVisibleMs: 120,
      now: () => now,
    }).ensure('node');

    gate.start(() => undefined);

    now = 50;
    vi.advanceTimersByTime(50);
    expect(gate.state()).toBe('shown');

    now = 80;
    gate.resolve(remove);

    vi.advanceTimersByTime(89);
    expect(remove).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it('cancels pending timers via clearAll', () => {
    vi.useFakeTimers();

    const showA = vi.fn();
    const showB = vi.fn();
    const registry = createSkeletonGateRegistry({ showAfterMs: 100 });

    registry.ensure('a').start(showA);
    registry.ensure('b').start(showB);
    registry.clearAll();

    vi.advanceTimersByTime(150);
    expect(showA).not.toHaveBeenCalled();
    expect(showB).not.toHaveBeenCalled();
    expect(registry.ensure('a').state()).toBe('idle');
    expect(registry.ensure('b').state()).toBe('idle');
  });
});