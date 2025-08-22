import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";

import { MockDispatch, renderWithProviders } from "../../test/testUtils";
import EngineControls from "../../features/ChessPanel/components/EngineControls";
import { setupStore } from "../../store";
import { SetHash, SetLines, SetThreads } from "../../store/engineSlice";

describe('EngineControls', () => {
  it('renders sf version', () => {
    const { getByText } = renderWithProviders(<EngineControls />);
    getByText(/Stockfish 16/);
  })

  it('dispatches set hash', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    const { getByTitle } = renderWithProviders(<EngineControls />, {
      store: mockStore,
    });
    const hash = getByTitle(/Hash/);
    fireEvent.change(hash, { target: { value: '1' } })
    expect(mockStore.dispatch).toHaveBeenCalledWith(SetHash(1))
  });

  it('dispatches set threads', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    const { getByTitle } = renderWithProviders(<EngineControls />, {
      store: mockStore,
    });
    const threads = getByTitle(/threads/);
    fireEvent.change(threads, { target: { value: '1' } })
    expect(mockStore.dispatch).toHaveBeenCalledWith(SetThreads(1))
  });
  
  it('dispatches set lines', () => {
    const mockStore = setupStore();
    mockStore.dispatch = vi.fn() as MockDispatch;
    const { getByTitle } = renderWithProviders(<EngineControls />, {
      store: mockStore,
    });
    const variations = getByTitle(/variations/);
    const input = variations.childNodes[1];
    fireEvent.change(input, { target: { value: '2' } })
    expect(mockStore.dispatch).toHaveBeenCalledWith(SetLines(2))
  });
});
