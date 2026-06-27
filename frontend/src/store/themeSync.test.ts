import { afterEach, describe, expect, it, vi } from 'vitest';

import { setupTestStore } from '@/test/renderWithProviders';
import { initializeThemeSync } from './themeSync';

describe('initializeThemeSync', () => {
  afterEach(() => {
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('applies initial dark mode and cleans up listeners', () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const disconnect = vi.fn();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockReturnValue({
        matches: true,
        addEventListener,
        removeEventListener,
      }),
    });

    vi.stubGlobal(
      'MutationObserver',
      vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect,
      }))
    );

    const store = setupTestStore({ ui: { isDarkMode: false } });

    const cleanup = initializeThemeSync(store.dispatch);

    expect(store.getState().ui.isDarkMode).toBe(true);
    expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

    cleanup();

    expect(disconnect).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
