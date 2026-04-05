import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { nav, tree, ui } from '@/store/slices';

const { mockDispatch, mockCurrentVisibleId } = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
  mockCurrentVisibleId: vi.fn(),
}));

vi.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock('react-redux', async () => {
  const actual = await vi.importActual<typeof import('react-redux')>('react-redux');
  return {
    ...actual,
    useSelector: (selector: unknown) => {
      if (selector === mockCurrentVisibleId) {
        return mockCurrentVisibleId();
      }
      return undefined;
    },
  };
});

vi.mock('@/store/selectors', () => ({
  selectCurrentVisibleId: mockCurrentVisibleId,
}));

import { useKeyboardActions } from './useKeyboardActions';

describe('useKeyboardActions', () => {
  beforeEach(() => {
    mockDispatch.mockReset();
    mockCurrentVisibleId.mockReset().mockReturnValue('node-a');
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  it('dispatches arrow/vim navigation and throttles repeated keydowns', () => {
    renderHook(() => useKeyboardActions());

    const up = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true });

    act(() => {
      window.dispatchEvent(up);
    });
    expect(mockDispatch).toHaveBeenCalledWith(nav.actions.navigatePrevSibling());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', bubbles: true, cancelable: true }));
    });
    expect(mockDispatch).toHaveBeenCalledTimes(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keyup', { key: 'k', bubbles: true }));
      vi.advanceTimersByTime(1);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
    });

    expect(mockDispatch).toHaveBeenCalledWith(nav.actions.navigateDown());
  });

  it('dispatches global shortcuts for engine toggle and pin', () => {
    renderHook(() => useKeyboardActions());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true, cancelable: true }));
    });

    expect(mockDispatch).toHaveBeenCalledWith(ui.actions.toggleEngine());
    expect(mockDispatch).toHaveBeenCalledWith(tree.actions.toggleNodePinned('node-a'));
  });

  it('does not pin when there is no current visible id', () => {
    mockCurrentVisibleId.mockReturnValue(null);
    renderHook(() => useKeyboardActions());

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'p', bubbles: true, cancelable: true }));
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(expect.objectContaining({ type: tree.actions.toggleNodePinned.type }));
  });

  it('ignores key handling for editable/arrow-owning targets', () => {
    renderHook(() => useKeyboardActions());

    const input = document.createElement('input');
    input.type = 'text';
    document.body.appendChild(input);

    const slider = document.createElement('div');
    slider.setAttribute('role', 'slider');
    document.body.appendChild(slider);

    act(() => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true, cancelable: true }));
      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true }));
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', bubbles: true, cancelable: true }));
    });

    expect(mockDispatch).not.toHaveBeenCalled();

    input.remove();
    slider.remove();
  });

  it('ignores modified/repeat/defaultPrevented events', () => {
    renderHook(() => useKeyboardActions());

    const prevented = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    prevented.preventDefault();

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', ctrlKey: true, bubbles: true, cancelable: true }));
      window.dispatchEvent(prevented);
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', repeat: true, bubbles: true, cancelable: true }));
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });
});
