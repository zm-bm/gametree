import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import { TreeSource, TreeStoreNode } from "@/types";
import { createTestNodeStats, createTestTreeStoreNode } from "@/test/treeFixtures";

const { mockUseOpeningEntry, mockDispatch, mockSetHover } = vi.hoisted(() => ({
  mockUseOpeningEntry: vi.fn(),
  mockDispatch: vi.fn(),
  mockSetHover: vi.fn((hoverId: string | null) => ({ type: "ui/setHover", payload: hoverId })),
}));

type SelectorState = {
  currentVisibleId: string;
  currentNode: TreeStoreNode | null;
  source: TreeSource;
};

const selectorState: SelectorState = {
  currentVisibleId: "e2e4,c7c5,g1f3,d7d6",
  currentNode: createTestTreeStoreNode({
    loading: false,
    positionStats: createTestNodeStats({ otb: { total: 715500 } }),
  }),
  source: "otb",
};

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

vi.mock("@/store/selectors", () => ({
  selectCurrentVisibleId: (state: { __positionSummary: SelectorState }) => state.__positionSummary.currentVisibleId,
  selectCurrentVisibleNodeData: (state: { __positionSummary: SelectorState }) => state.__positionSummary.currentNode,
  selectTreeSource: (state: { __positionSummary: SelectorState }) => state.__positionSummary.source,
}));

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useSelector: (selector: (state: { __positionSummary: SelectorState }) => unknown) =>
      selector({ __positionSummary: selectorState }),
  };
});

vi.mock("@/features/Sidebar/hooks/useOpeningEntry", () => ({
  useOpeningEntry: (...args: unknown[]) => mockUseOpeningEntry(...args),
}));

import PositionSummary from "./PositionSummary";

describe("PositionSummary", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    selectorState.currentVisibleId = "e2e4,c7c5,g1f3,d7d6";
    selectorState.currentNode = createTestTreeStoreNode({
      loading: false,
      positionStats: createTestNodeStats({ otb: { total: 715500 } }),
    });
    selectorState.source = "otb";

    mockUseOpeningEntry.mockReset();
    mockDispatch.mockReset();
    mockSetHover.mockReset();
    mockSetHover.mockImplementation((hoverId: string | null) => ({ type: "ui/setHover", payload: hoverId }));
    mockUseOpeningEntry.mockReturnValue({
      name: "Sicilian Defense: Najdorf Variation",
      eco: "B90",
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders opening, eco, move line, and compact game count", () => {
    render(<PositionSummary />);

    expect(screen.getByText("Sicilian Defense: Najdorf Variation")).toBeInTheDocument();
    expect(screen.getByText("B90")).toBeInTheDocument();
    expect(screen.getByText("e4")).toBeInTheDocument();
    expect(screen.getByText("c5")).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toBeInTheDocument();
    expect(screen.getByText("d6")).toBeInTheDocument();
    expect(screen.getByText("715.5K games")).toBeInTheDocument();
    expect(screen.queryByText("No game count available.")).not.toBeInTheDocument();
  });

  it("shows start-position line as empty-state styling path and hides game count when stats missing", () => {
    selectorState.currentVisibleId = "";
    selectorState.currentNode = createTestTreeStoreNode({
      loading: false,
      // Simulate malformed backend data where stats are absent.
      positionStats: {} as unknown as TreeStoreNode["positionStats"],
    });
    mockUseOpeningEntry.mockReturnValue(null);

    render(<PositionSummary />);

    expect(screen.getByText("Start position")).toBeInTheDocument();
    expect(screen.queryByText(/games$/)).not.toBeInTheDocument();
    expect(screen.getByText("No game count available.")).toBeInTheDocument();
  });

  it("prioritizes loading and missing-node status messages", () => {
    selectorState.currentNode = createTestTreeStoreNode({
      loading: true,
    });
    const { rerender } = render(<PositionSummary />);
    expect(screen.getByText("Loading position...")).toBeInTheDocument();

    selectorState.currentNode = null;
    rerender(<PositionSummary />);
    expect(screen.getByText("No opening data for this position yet.")).toBeInTheDocument();
  });

  it("dispatches delayed hover enter and leave for SAN tokens", () => {
    render(<PositionSummary />);
    const moveToken = screen.getByText("Nf3").closest("span") as HTMLSpanElement;

    fireEvent.mouseEnter(moveToken);
    vi.advanceTimersByTime(199);
    expect(mockSetHover).not.toHaveBeenCalledWith("e2e4,c7c5,g1f3");

    vi.advanceTimersByTime(1);
    expect(mockSetHover).toHaveBeenCalledWith("e2e4,c7c5,g1f3");

    fireEvent.mouseLeave(moveToken);
    vi.advanceTimersByTime(199);
    expect(mockSetHover).not.toHaveBeenCalledWith(null);

    vi.advanceTimersByTime(1);
    expect(mockSetHover).toHaveBeenCalledWith(null);
  });

  it("does not dispatch SAN hover id when mouse passes quickly over a move", () => {
    render(<PositionSummary />);
    const moveToken = screen.getByText("e4").closest("span") as HTMLSpanElement;

    fireEvent.mouseEnter(moveToken);
    vi.advanceTimersByTime(50);
    fireEvent.mouseLeave(moveToken);
    vi.runAllTimers();

    expect(mockSetHover).not.toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).toHaveBeenCalledWith(null);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  it("cancels delayed hover clear on quick re-enter", () => {
    render(<PositionSummary />);
    const moveToken = screen.getByText("e4").closest("span") as HTMLSpanElement;

    fireEvent.mouseEnter(moveToken);
    vi.advanceTimersByTime(220);
    fireEvent.mouseLeave(moveToken);
    vi.advanceTimersByTime(100);
    fireEvent.mouseEnter(moveToken);
    vi.advanceTimersByTime(220);

    expect(mockSetHover).toHaveBeenCalledWith("e2e4");
    expect(mockSetHover).not.toHaveBeenCalledWith(null);
  });

  it("dispatches correct hover id for later SAN token", () => {
    render(<PositionSummary />);
    const moveToken = screen.getByText("d6").closest("span") as HTMLSpanElement;

    fireEvent.mouseEnter(moveToken);
    vi.advanceTimersByTime(220);

    expect(mockSetHover).toHaveBeenCalledWith("e2e4,c7c5,g1f3,d7d6");
  });
});
