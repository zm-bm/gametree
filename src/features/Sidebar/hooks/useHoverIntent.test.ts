import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MouseEvent } from "react";

const { mockDispatch, mockSetHover } = vi.hoisted(() => ({
  mockDispatch: vi.fn(),
  mockSetHover: vi.fn((hoverId: string | null) => ({ type: "ui/setHover", payload: hoverId })),
}));

vi.mock("@/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

vi.mock("@/store/slices", () => ({
  ui: {
    actions: {
      setHover: (hoverId: string | null) => mockSetHover(hoverId),
    },
  },
}));

import { useHoverIntent } from "./useHoverIntent";

const makeMouseEnterEvent = (hoverId: string | null): MouseEvent<HTMLElement> => ({
  currentTarget: {
    getAttribute: () => hoverId,
  },
} as unknown as MouseEvent<HTMLElement>);

describe("useHoverIntent", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockDispatch.mockReset();
    mockSetHover.mockReset();
    mockSetHover.mockImplementation((hoverId: string | null) => ({ type: "ui/setHover", payload: hoverId }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("dispatches hover id only after enter delay", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => {
      result.current.onMouseEnter(makeMouseEnterEvent("e2e4"));
      vi.advanceTimersByTime(199);
    });
    expect(mockSetHover).not.toHaveBeenCalledWith("e2e4");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mockSetHover).toHaveBeenCalledWith("e2e4");
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("dispatches hover clear only after leave delay", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => {
      result.current.onMouseLeave();
      vi.advanceTimersByTime(199);
    });
    expect(mockSetHover).not.toHaveBeenCalledWith(null);

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(mockSetHover).toHaveBeenCalledWith(null);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("cancels delayed enter dispatch when leaving quickly", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => {
      result.current.onMouseEnter(makeMouseEnterEvent("e2e4"));
      vi.advanceTimersByTime(50);
      result.current.onMouseLeave();
      vi.runAllTimers();
    });

    expect(mockSetHover).not.toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).toHaveBeenCalledWith(null);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("cancels delayed clear when re-entering quickly", () => {
    const { result } = renderHook(() => useHoverIntent());

    act(() => {
      result.current.onMouseEnter(makeMouseEnterEvent("e2e4"));
      vi.advanceTimersByTime(220);
      result.current.onMouseLeave();
      vi.advanceTimersByTime(100);
      result.current.onMouseEnter(makeMouseEnterEvent("e2e4"));
      vi.advanceTimersByTime(220);
    });

    expect(mockSetHover).toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).not.toHaveBeenCalledWith(null);
  });

  it("cleans up pending timers on unmount", () => {
    const { result, unmount } = renderHook(() => useHoverIntent());

    act(() => {
      result.current.onMouseEnter(makeMouseEnterEvent("e2e4"));
      result.current.onMouseLeave();
      unmount();
      vi.runAllTimers();
    });

    expect(mockSetHover).not.toHaveBeenCalled();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("supports custom delay configuration", () => {
    const { result } = renderHook(() => useHoverIntent({ enterDelayMs: 50, leaveDelayMs: 80 }));

    act(() => {
      result.current.onMouseEnter(makeMouseEnterEvent("e2e4"));
      vi.advanceTimersByTime(50);
    });
    expect(mockSetHover).toHaveBeenCalledWith("e2e4");

    act(() => {
      result.current.onMouseLeave();
      vi.advanceTimersByTime(80);
    });
    expect(mockSetHover).toHaveBeenCalledWith(null);
  });
});
