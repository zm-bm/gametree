import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import PositionSummary from "./PositionSummary";
import { TreeSource, TreeStoreNode } from "@/types";
import { createTestNodeStats, createTestTreeStoreNode } from "@/test/treeFixtures";

const { mockUseOpeningEntry } = vi.hoisted(() => ({
  mockUseOpeningEntry: vi.fn(),
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

describe("PositionSummary", () => {
  beforeEach(() => {
    selectorState.currentVisibleId = "e2e4,c7c5,g1f3,d7d6";
    selectorState.currentNode = createTestTreeStoreNode({
      loading: false,
      positionStats: createTestNodeStats({ otb: { total: 715500 } }),
    });
    selectorState.source = "otb";

    mockUseOpeningEntry.mockReset();
    mockUseOpeningEntry.mockReturnValue({
      name: "Sicilian Defense: Najdorf Variation",
      eco: "B90",
    });
  });

  it("renders opening, eco, move line, and compact game count", () => {
    render(<PositionSummary />);

    expect(screen.getByText("Sicilian Defense: Najdorf Variation")).toBeInTheDocument();
    expect(screen.getByText("B90")).toBeInTheDocument();
    expect(screen.getByText("1. e4 c5 2. Nf3 d6")).toBeInTheDocument();
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
});
