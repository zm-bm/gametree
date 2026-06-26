import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OpeningBookEntry } from "@/types";

const { mockGetECOByUciPathIfReady, mockGetECOByUciPathLazy } = vi.hoisted(() => ({
  mockGetECOByUciPathIfReady: vi.fn(),
  mockGetECOByUciPathLazy: vi.fn(),
}));

vi.mock("@/shared/opening", () => ({
  getECOByUciPathIfReady: (...args: Parameters<typeof mockGetECOByUciPathIfReady>) =>
    mockGetECOByUciPathIfReady(...args),
  getECOByUciPathLazy: (...args: Parameters<typeof mockGetECOByUciPathLazy>) =>
    mockGetECOByUciPathLazy(...args),
}));

import { useOpeningEntry } from "./useOpeningEntry";

describe("useOpeningEntry", () => {
  beforeEach(() => {
    mockGetECOByUciPathIfReady.mockReset();
    mockGetECOByUciPathLazy.mockReset();
    mockGetECOByUciPathIfReady.mockReturnValue(undefined);
    mockGetECOByUciPathLazy.mockResolvedValue(null);
  });

  it("returns null and skips lookup when currentVisibleId is empty", () => {
    const { result } = renderHook(() => useOpeningEntry(""));

    expect(result.current).toBeNull();
    expect(mockGetECOByUciPathIfReady).not.toHaveBeenCalled();
    expect(mockGetECOByUciPathLazy).not.toHaveBeenCalled();
  });

  it("loads ECO entry for a valid currentVisibleId", async () => {
    const entry: OpeningBookEntry = {
      eco: "B20",
      name: "Sicilian Defense",
      uci: "e2e4,c7c5",
    };
    mockGetECOByUciPathLazy.mockResolvedValue(entry);

    const { result } = renderHook(() => useOpeningEntry("e2e4,c7c5"));

    await waitFor(() => {
      expect(result.current).toEqual(entry);
    });
    expect(mockGetECOByUciPathIfReady).toHaveBeenCalledWith("e2e4,c7c5");
    expect(mockGetECOByUciPathLazy).toHaveBeenCalledWith("e2e4,c7c5");
  });

  it("falls back to null when opening lookup throws", async () => {
    mockGetECOByUciPathLazy.mockRejectedValue(new Error("lookup failed"));

    const { result } = renderHook(() => useOpeningEntry("e2e4"));

    await waitFor(() => {
      expect(mockGetECOByUciPathLazy).toHaveBeenCalledWith("e2e4");
      expect(result.current).toBeNull();
    });
  });

  it("clears previous entry when currentVisibleId becomes empty", async () => {
    const entry: OpeningBookEntry = {
      eco: "A40",
      name: "Queen's Pawn Game",
      uci: "d2d4",
    };
    mockGetECOByUciPathLazy.mockResolvedValue(entry);

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useOpeningEntry(id),
      { initialProps: { id: "d2d4" } },
    );

    await waitFor(() => {
      expect(result.current).toEqual(entry);
    });

    rerender({ id: "" });
    expect(result.current).toBeNull();
    expect(mockGetECOByUciPathLazy).toHaveBeenCalledTimes(1);
  });

  it("uses ready cache path without async lookup", () => {
    const entry: OpeningBookEntry = {
      eco: "C20",
      name: "King's Pawn Game",
      uci: "e2e4",
    };
    mockGetECOByUciPathIfReady.mockReturnValue(entry);

    const { result } = renderHook(() => useOpeningEntry("e2e4"));

    expect(result.current).toEqual(entry);
    expect(mockGetECOByUciPathIfReady).toHaveBeenCalledWith("e2e4");
    expect(mockGetECOByUciPathLazy).not.toHaveBeenCalled();
  });
});
