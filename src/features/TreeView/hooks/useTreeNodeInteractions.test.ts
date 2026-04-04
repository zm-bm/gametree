import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createTestHierarchyPointNode } from '@/features/TreeView/testUtils';
import { nav, ui } from '@/store/slices';

const mockDispatch = vi.fn();

vi.mock('@/store', () => ({
  useAppDispatch: () => mockDispatch,
}));

import { useTreeNodeInteractions } from './useTreeNodeInteractions';

describe('useTreeNodeInteractions', () => {
  beforeEach(() => {
    mockDispatch.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with non-hovered state', () => {
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: false }),
    );

    expect(result.current.isNodeHovered).toBe(false);
  });

  it('dispatches navigate action on click for main tree nodes', () => {
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: false }),
    );

    act(() => {
      result.current.handleNodeClick();
    });

    expect(mockDispatch).toHaveBeenCalledWith(nav.actions.navigateToId('a'));
  });

  it('does not dispatch navigation click action for minimap nodes', () => {
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: true }),
    );

    act(() => {
      result.current.handleNodeClick();
    });

    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('sets hover state immediately and dispatches delayed hover for main tree', () => {
    vi.useFakeTimers();
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: false, hoverDelayMs: 120 }),
    );

    act(() => {
      result.current.handleNodeMouseEnter();
    });

    expect(result.current.isNodeHovered).toBe(true);
    expect(mockDispatch).not.toHaveBeenCalledWith(ui.actions.setHover('a'));

    act(() => {
      vi.advanceTimersByTime(120);
    });

    expect(mockDispatch).toHaveBeenCalledWith(ui.actions.setHover('a'));
  });

  it('cancels delayed hover dispatch when leaving early and clears hover', () => {
    vi.useFakeTimers();
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: false, hoverDelayMs: 120 }),
    );

    act(() => {
      result.current.handleNodeMouseEnter();
      result.current.handleNodeMouseLeave();
      vi.advanceTimersByTime(120);
    });

    expect(result.current.isNodeHovered).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalledWith(ui.actions.setHover('a'));
    expect(mockDispatch).toHaveBeenCalledWith(ui.actions.setHover(null));
  });

  it('does not dispatch hover actions in minimap mode', () => {
    vi.useFakeTimers();
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: true, hoverDelayMs: 120 }),
    );

    act(() => {
      result.current.handleNodeMouseEnter();
      vi.advanceTimersByTime(120);
      result.current.handleNodeMouseLeave();
    });

    expect(result.current.isNodeHovered).toBe(false);
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it('cleans up hover state on unmount for main tree mode', () => {
    vi.useFakeTimers();
    const node = createTestHierarchyPointNode({ id: 'a' });

    const { result, unmount } = renderHook(() =>
      useTreeNodeInteractions({ node, minimap: false, hoverDelayMs: 120 }),
    );

    act(() => {
      result.current.handleNodeMouseEnter();
      unmount();
      vi.advanceTimersByTime(120);
    });

    expect(mockDispatch).not.toHaveBeenCalledWith(ui.actions.setHover('a'));
    expect(mockDispatch).toHaveBeenCalledWith(ui.actions.setHover(null));
  });
});