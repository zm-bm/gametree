import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { OpeningBookEntry } from "@/types";

const { mockGetECOByUciPath } = vi.hoisted(() => ({
  mockGetECOByUciPath: vi.fn(),
}));

vi.mock("@/shared/opening", () => ({
  getECOByUciPath: (...args: Parameters<typeof mockGetECOByUciPath>) =>
    mockGetECOByUciPath(...args),
}));

import { useOpeningEntry } from "./useOpeningEntry";

describe("useOpeningEntry", () => {
  beforeEach(() => {
    mockGetECOByUciPath.mockReset();
  });

  it("returns null and skips lookup when currentVisibleId is empty", () => {
    const { result } = renderHook(() => useOpeningEntry(""));

    expect(result.current).toBeNull();
    expect(mockGetECOByUciPath).not.toHaveBeenCalled();
  });

  it("loads ECO entry for a valid currentVisibleId", async () => {
    const entry: OpeningBookEntry = {
      eco: "B20",
      name: "Sicilian Defense",
      uci: "e2e4,c7c5",
    };
    mockGetECOByUciPath.mockReturnValue(entry);

    const { result } = renderHook(() => useOpeningEntry("e2e4,c7c5"));

    await waitFor(() => {
      expect(result.current).toEqual(entry);
    });
    expect(mockGetECOByUciPath).toHaveBeenCalledWith("e2e4,c7c5");
  });

  it("falls back to null when opening lookup throws", async () => {
    mockGetECOByUciPath.mockImplementation(() => {
      throw new Error("lookup failed");
    });

    const { result } = renderHook(() => useOpeningEntry("e2e4"));

    await waitFor(() => {
      expect(mockGetECOByUciPath).toHaveBeenCalledWith("e2e4");
      expect(result.current).toBeNull();
    });
  });

  it("clears previous entry when currentVisibleId becomes empty", async () => {
    const entry: OpeningBookEntry = {
      eco: "A40",
      name: "Queen's Pawn Game",
      uci: "d2d4",
    };
    mockGetECOByUciPath.mockReturnValue(entry);

    const { result, rerender } = renderHook(
      ({ id }: { id: string }) => useOpeningEntry(id),
      { initialProps: { id: "d2d4" } },
    );

    await waitFor(() => {
      expect(result.current).toEqual(entry);
    });

    rerender({ id: "" });
    expect(result.current).toBeNull();
    expect(mockGetECOByUciPath).toHaveBeenCalledTimes(1);
  });
});

