import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { DEFAULT_POSITION } from 'chess.js';

import BoardControls from '../../features/Sidebar/components/BoardControls';
import { MockDispatch, renderWithProviders } from '../../test/testUtils';
import { setupStore } from '../../store';
import { ToggleEngine } from '../../store/engineSlice';

const mockUndo = vi.fn();
const mockRedo = vi.fn();
const mockRewind = vi.fn();
const mockForward = vi.fn();

vi.mock('../../hooks/useMoveActions', () => ({
  useMoveActions: () => ({
    undo: mockUndo,
    redo: mockRedo,
    rewind: mockRewind,
    forward: mockForward,
  })
}))

describe('BoardControls', () => {
  beforeEach(() => {
    mockUndo.mockClear();
    mockRedo.mockClear();
    mockRewind.mockClear();
    mockForward.mockClear();
  });

  it('calls undo on click undo', () => {
    const { getByTitle } = renderWithProviders(<BoardControls />);
    const button = getByTitle(/Undo/)
    fireEvent.click(button)
    expect(mockUndo).toHaveBeenCalledOnce();
  });
  it('calls undo on arrowleft', async () => {
    renderWithProviders(<BoardControls />);
    fireEvent.keyDown(document, { key: 'ArrowLeft' });
    expect(mockUndo).toHaveBeenCalledOnce();
  });

  it('calls redo on click redo', () => {
    const { getByTitle } = renderWithProviders(<BoardControls />);
    const button = getByTitle(/Redo/)
    fireEvent.click(button)
    expect(mockRedo).toHaveBeenCalledOnce();
  });
  it('calls rewind on arrowright', async () => {
    renderWithProviders(<BoardControls />);
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    expect(mockRedo).toHaveBeenCalledOnce();
  });

  it('calls rewind on click rewind', () => {
    const { getByTitle } = renderWithProviders(<BoardControls />);
    const button = getByTitle(/Rewind/)
    fireEvent.click(button)
    expect(mockRewind).toHaveBeenCalledOnce();
  });
  it('calls rewind on arrowdown', async () => {
    renderWithProviders(<BoardControls />);
    fireEvent.keyDown(document, { key: 'ArrowDown' });
    expect(mockRewind).toHaveBeenCalledOnce();
  });

  it('calls forward on click forward', () => {
    const { getByTitle } = renderWithProviders(<BoardControls />);
    const button = getByTitle(/Forward/)
    fireEvent.click(button)
    expect(mockForward).toHaveBeenCalledOnce();
  });
  it('calls forward on arrowup', async () => {
    renderWithProviders(<BoardControls />);
    fireEvent.keyDown(document, { key: 'ArrowUp' });
    expect(mockForward).toHaveBeenCalledOnce();
  });

  it('dispatches ToggleEngine on engine toggle', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    const { getByTitle } = renderWithProviders(<BoardControls />, { store: mockStore });
    const button = getByTitle(/Start/);
    fireEvent.click(button);
    expect(mockStore.dispatch).toHaveBeenCalledWith(ToggleEngine(DEFAULT_POSITION));
  });
});