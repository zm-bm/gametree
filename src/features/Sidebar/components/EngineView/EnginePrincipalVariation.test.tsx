import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

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

import EnginePrincipalVariation from "./EnginePrincipalVariation";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("EnginePrincipalVariation", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockDispatch.mockReset();
    mockSetHover.mockReset();
    mockSetHover.mockImplementation((hoverId: string | null) => ({ type: "ui/setHover", payload: hoverId }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders PV moves with numbering", () => {
    const { container } = render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={["e2e4", "e7e5", "g1f3"]}
      />,
    );

    expect(screen.getByText("Principal variation")).toBeInTheDocument();
    expect(screen.getByText("e4")).toBeInTheDocument();
    expect(screen.getByText("e5")).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-pv-body")).toBeInTheDocument();
  });

  it("dispatches hover enter and leave actions only after their delays and shows empty state", () => {
    const { rerender } = render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={["e2e4"]}
      />,
    );

    const token = screen.getByText("e4").closest("span") as HTMLSpanElement;
    fireEvent.mouseEnter(token);
    vi.advanceTimersByTime(220);
    fireEvent.mouseLeave(token);
    vi.advanceTimersByTime(220);

    expect(mockSetHover).toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).toHaveBeenCalledWith(null);
    expect(mockDispatch).toHaveBeenCalledTimes(2);

    rerender(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={[]}
      />,
    );

    expect(screen.queryByText("e2e4")).not.toBeInTheDocument();
  });

  it("does not dispatch hover id when mouse passes over quickly", () => {
    render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={["e2e4"]}
      />,
    );

    const token = screen.getByText("e4").closest("span") as HTMLSpanElement;
    fireEvent.mouseEnter(token);
    vi.advanceTimersByTime(50);
    fireEvent.mouseLeave(token);
    vi.runAllTimers();

    expect(mockSetHover).not.toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).toHaveBeenCalledWith(null);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("cancels delayed hover clear when re-entering quickly", () => {
    render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={["e2e4"]}
      />,
    );

    const token = screen.getByText("e4").closest("span") as HTMLSpanElement;
    fireEvent.mouseEnter(token);
    vi.advanceTimersByTime(220);
    fireEvent.mouseLeave(token);
    vi.advanceTimersByTime(100);
    fireEvent.mouseEnter(token);
    vi.advanceTimersByTime(220);

    expect(mockSetHover).toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).not.toHaveBeenCalledWith(null);
  });

  it("dispatches full comma-joined path id for hovered PV moves", () => {
    render(
      <EnginePrincipalVariation
        fen={START_FEN}
        currentVisibleId="d2d4,d7d5"
        pvMoves={["c2c4", "e7e6"]}
      />,
    );

    const secondToken = screen.getByText("e6").closest("span") as HTMLSpanElement;
    fireEvent.mouseEnter(secondToken);
    vi.advanceTimersByTime(220);

    expect(mockSetHover).toHaveBeenCalledWith("d2d4,d7d5,c2c4,e7e6");
  });

  it("caps rendered PV to 10 plies", () => {
    const pvMoves = [
      "e2e4", "e7e5",
      "g1f3", "b8c6",
      "f1b5", "a7a6",
      "b5a4", "g8f6",
      "e1g1", "f8e7",
      "f1e1", "b7b5",
    ];

    const { container } = render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={pvMoves}
      />,
    );

    const tokens = container.querySelectorAll(".gt-engine-pv-token");
    expect(tokens).toHaveLength(10);
    expect(screen.queryByText("Re1")).not.toBeInTheDocument();
  });
});
