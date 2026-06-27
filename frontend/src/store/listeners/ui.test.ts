import { beforeEach, describe, expect, it, vi } from 'vitest';

const { playMoveSoundMock } = vi.hoisted(() => ({
  playMoveSoundMock: vi.fn(),
}));

vi.mock('@/shared/sound', () => ({
  playMoveSound: playMoveSoundMock,
}));

import { setupTestStore } from '@/test/renderWithProviders';
import { ui } from '@/store/slices';

describe('ui listener', () => {
  beforeEach(() => {
    playMoveSoundMock.mockClear();
  });

  it('clears promotion target and plays move sound on setCurrent', async () => {
    const store = setupTestStore({
      ui: {
        boardPromotionTarget: ['a8'],
      },
    });

    store.dispatch(ui.actions.setCurrent('e2e4'));

    await vi.waitFor(() => {
      expect(store.getState().ui.boardPromotionTarget).toBeNull();
      expect(playMoveSoundMock).toHaveBeenCalledTimes(1);
    });
  });

  it('still plays move sound when there is no promotion target', async () => {
    const store = setupTestStore({
      ui: {
        boardPromotionTarget: null,
      },
    });

    store.dispatch(ui.actions.setCurrent('d2d4'));

    await vi.waitFor(() => {
      expect(playMoveSoundMock).toHaveBeenCalledTimes(1);
    });
    expect(store.getState().ui.boardPromotionTarget).toBeNull();
  });
});
