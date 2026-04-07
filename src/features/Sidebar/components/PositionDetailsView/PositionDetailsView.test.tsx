import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";

import { renderWithProviders } from "@/test/renderWithProviders";
import type { NodeStats, SourceStats, TheoryLookupResult } from "@/types";
import type { RootState } from "@/store/index";
import { getECOByUciPath } from "@/shared/opening";

const { mockUseGetTheoryByNodeQuery, mockGetECOByUciPath } = vi.hoisted(() => ({
  mockUseGetTheoryByNodeQuery: vi.fn(),
  mockGetECOByUciPath: vi.fn(),
}));

vi.mock("@/store/selectors", async () => {
  const actual = await vi.importActual<typeof import("@/store/selectors")>("@/store/selectors");
  return {
    ...actual,
    selectCurrentVisibleId: (s: RootState) => s.ui.currentId,
    selectTreeNodeMap: (s: RootState) => s.tree.nodes,
    selectTreeSource: (s: RootState) => s.ui.treeSource,
  };
});

vi.mock("@/store/theoryApi", async () => {
  const actual = await vi.importActual<typeof import("@/store/theoryApi")>("@/store/theoryApi");
  return {
    ...actual,
    theoryApi: {
      ...actual.theoryApi,
      useGetTheoryByNodeQuery: (
        ...args: Parameters<typeof actual.theoryApi.useGetTheoryByNodeQuery>
      ) => mockUseGetTheoryByNodeQuery(...args),
    },
  };
});

vi.mock("@/shared/opening", () => ({
  getECOByUciPath: (...args: Parameters<typeof getECOByUciPath>) => mockGetECOByUciPath(...args),
}));

import PositionDetailsView from "./PositionDetailsView";

const DEFAULT_NODE_ID = "c2c4,g8f6,b1c3";

const makeStats = (overrides: Partial<SourceStats> = {}): SourceStats => ({
  white: 40,
  draws: 30,
  black: 30,
  total: 100,
  ...overrides,
});

const makeTheoryResult = (overrides: Partial<TheoryLookupResult> = {}): TheoryLookupResult => ({
  snippets: [],
  sourceTitle: "Chess_Opening_Theory/1._c4/1...Nf6/2._Nc3",
  sourceUrl: "https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._c4/1...Nf6/2._Nc3",
  strategy: "exact-path",
  ...overrides,
});

const setTheoryHookState = ({
  data = makeTheoryResult(),
  isFetching = false,
  isError = false,
}: {
  data?: TheoryLookupResult | undefined;
  isFetching?: boolean;
  isError?: boolean;
}) => {
  mockUseGetTheoryByNodeQuery.mockReturnValue({
    data,
    isFetching,
    isError,
  });
};

const renderPositionDetails = ({
  nodeId = DEFAULT_NODE_ID,
  stats = makeStats(),
} = {}) =>
  renderWithProviders(<PositionDetailsView />, {
    preloadedState: {
      ui: {
        currentId: nodeId,
        treeSource: "otb",
      },
      tree: {
        nodes: {
          [nodeId]: {
            id: nodeId,
            childrenLoaded: true,
            loading: false,
            move: null,
            edgeStats: {
              otb: stats,
              online: stats,
            },
            positionStats: {
              otb: stats,
              online: stats,
            },
            children: [],
          },
        },
        pinnedNodes: [],
        lastVisitedChildByParent: {},
      },
    },
  });

describe("PositionDetailsView", () => {
  beforeEach(() => {
    mockUseGetTheoryByNodeQuery.mockReset();
    mockGetECOByUciPath.mockReset();
    mockGetECOByUciPath.mockReturnValue({
      eco: "A16",
      name: "English Opening: Anglo-Indian Defense, Queen's Knight Variation",
      uci: "c2c4,g8f6,b1c3",
    });
  });

  it("renders low-clutter canonical context with compact game-count-only stats", async () => {
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: "Quiet development with flexible central plans.",
            html: "Quiet development with flexible central plans.",
          },
        ],
      }),
    });

    renderPositionDetails({
      nodeId: "e2e4,e7e5,g1f3,b8c6,f1b5,a7a6,b5a4,g8f6",
      stats: makeStats({ total: 131800, white: 52720, draws: 41624, black: 37456 }),
    });

    expect(await screen.findByText("English Opening: Anglo-Indian Defense, Queen's Knight Variation")).toBeInTheDocument();
    expect(screen.getByText("A16")).toBeInTheDocument();
    expect(screen.getByText("1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6")).toBeInTheDocument();

    expect(screen.queryByText(/Move \d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bWhite\b|\bBlack\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^OTB$/)).not.toBeInTheDocument();

    expect(screen.getByText("131.8K games")).toBeInTheDocument();
    expect(screen.queryByText("W 40.0% · D 31.6% · B 28.4%")).not.toBeInTheDocument();
  });

  it("shows game-count specific fallback copy when stats are unavailable", async () => {
    setTheoryHookState({
      data: makeTheoryResult({ snippets: [] }),
    });

    renderWithProviders(<PositionDetailsView />, {
      preloadedState: {
        ui: {
          currentId: DEFAULT_NODE_ID,
          treeSource: "otb",
        },
        tree: {
          nodes: {
            [DEFAULT_NODE_ID]: {
              id: DEFAULT_NODE_ID,
              childrenLoaded: true,
              loading: false,
              move: null,
              edgeStats: {
                otb: makeStats(),
                online: makeStats(),
              },
              positionStats: {} as unknown as NodeStats,
              children: [],
            },
          },
          pinnedNodes: [],
          lastVisitedChildByParent: {},
        },
      },
    });

    expect(await screen.findByText("No game count available.")).toBeInTheDocument();
  });

  it("drops the first heading and filters headings that duplicate opening/move context", async () => {
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "heading",
            text: "English Opening: Anglo-Indian Defense, Queen's Knight Variation",
            html: "English Opening: Anglo-Indian Defense, Queen's Knight Variation",
          },
          {
            kind: "heading",
            text: "2. Nc3",
            html: "2. Nc3",
          },
          {
            kind: "heading",
            text: "English Opening plans",
            html: "English Opening plans",
          },
          {
            kind: "heading",
            text: "THEORY TABLE",
            html: "THEORY TABLE",
          },
          {
            kind: "heading",
            text: "Strategic plans",
            html: "Strategic plans",
          },
          {
            kind: "paragraph",
            text: "White can often prepare central expansion with d4.",
            html: "White can often prepare central expansion with d4.",
          },
        ],
      }),
    });

    renderPositionDetails();

    await screen.findByText("Strategic plans");
    expect(screen.getByText("White can often prepare central expansion with d4.")).toBeInTheDocument();

    expect(screen.queryByText("2. Nc3")).not.toBeInTheDocument();
    expect(screen.queryByText("English Opening plans")).not.toBeInTheDocument();
    expect(screen.queryByText("THEORY TABLE")).not.toBeInTheDocument();
    expect(screen.getAllByText("English Opening: Anglo-Indian Defense, Queen's Knight Variation")).toHaveLength(1);
  });

  it("filters move-prefixed heading variations after first-heading removal", async () => {
    mockGetECOByUciPath.mockReturnValue({
      eco: "C20",
      name: "King's Pawn Game",
      uci: "e2e4",
    });
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "heading",
            text: "1. e4 · King's Pawn opening",
            html: "1. e4 · King's Pawn opening",
          },
          {
            kind: "heading",
            text: "1. e4 King's Pawn opening",
            html: "1. e4 King's Pawn opening",
          },
          {
            kind: "heading",
            text: "Flexible development plans",
            html: "Flexible development plans",
          },
          {
            kind: "paragraph",
            text: "White can often choose between d4 and quiet piece development.",
            html: "White can often choose between d4 and quiet piece development.",
          },
        ],
      }),
    });

    renderPositionDetails({
      nodeId: "e2e4",
      stats: makeStats({ total: 98000, white: 39200, draws: 29400, black: 29400 }),
    });

    await screen.findByText("Flexible development plans");
    expect(screen.queryByText("1. e4 · King's Pawn opening")).not.toBeInTheDocument();
    expect(screen.queryByText("1. e4 King's Pawn opening")).not.toBeInTheDocument();
    expect(screen.getByText("White can often choose between d4 and quiet piece development.")).toBeInTheDocument();
  });

  it("shows source link only when settled theory snippets exist", async () => {
    setTheoryHookState({
      data: makeTheoryResult({ snippets: [] }),
    });

    renderPositionDetails();

    await screen.findByText("No Wikibooks note for this position yet (possibly past available opening theory).");
    expect(screen.queryByRole("link", { name: "Source" })).not.toBeInTheDocument();
  });

  it("keeps previous theory text visible while fetching next data", async () => {
    let queryState: {
      data?: TheoryLookupResult;
      isFetching: boolean;
      isError: boolean;
    } = {
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: "Initial settled theory note.",
            html: "Initial settled theory note.",
          },
        ],
      }),
      isFetching: false,
      isError: false,
    };
    mockUseGetTheoryByNodeQuery.mockImplementation(() => queryState);

    const { rerender } = renderPositionDetails();
    expect(await screen.findByText("Initial settled theory note.")).toBeInTheDocument();

    queryState = {
      data: undefined,
      isFetching: true,
      isError: false,
    };
    rerender(<PositionDetailsView />);

    await waitFor(() => {
      expect(screen.getByText("Initial settled theory note.")).toBeInTheDocument();
      expect(screen.queryByText("Loading opening note...")).not.toBeInTheDocument();
    });
  });

  it("resets theory scroll position to top when collapsing", async () => {
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: "First long note paragraph for scrolling behavior checks.",
            html: "First long note paragraph for scrolling behavior checks.",
          },
          {
            kind: "paragraph",
            text: "Second long note paragraph for scrolling behavior checks.",
            html: "Second long note paragraph for scrolling behavior checks.",
          },
        ],
      }),
    });

    const { container } = renderPositionDetails();
    const expandButton = await screen.findByRole("button", { name: "Show more theory" });
    fireEvent.click(expandButton);

    await screen.findByRole("button", { name: "Show less theory" });
    const scrollEl = container.querySelector(".gt-theory-scroll") as HTMLDivElement | null;
    expect(scrollEl).not.toBeNull();
    if (!scrollEl) return;

    scrollEl.scrollTop = 120;
    fireEvent.click(screen.getByRole("button", { name: "Show less theory" }));

    await waitFor(() => {
      expect(scrollEl.scrollTop).toBe(0);
    });
  });

  it("keeps theory expanded when current move changes", async () => {
    const nextNodeId = "c2c4,g8f6,b1c3,d7d5";
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: "First long note paragraph for expansion persistence.",
            html: "First long note paragraph for expansion persistence.",
          },
          {
            kind: "paragraph",
            text: "Second long note paragraph for expansion persistence.",
            html: "Second long note paragraph for expansion persistence.",
          },
        ],
      }),
    });

    const stats = makeStats({ total: 120000, white: 48000, draws: 36000, black: 36000 });
    const { store } = renderWithProviders(<PositionDetailsView />, {
      preloadedState: {
        ui: {
          currentId: DEFAULT_NODE_ID,
          treeSource: "otb",
        },
        tree: {
          nodes: {
            [DEFAULT_NODE_ID]: {
              id: DEFAULT_NODE_ID,
              childrenLoaded: true,
              loading: false,
              move: null,
              edgeStats: {
                otb: stats,
                online: stats,
              },
              positionStats: {
                otb: stats,
                online: stats,
              },
              children: [],
            },
            [nextNodeId]: {
              id: nextNodeId,
              childrenLoaded: true,
              loading: false,
              move: null,
              edgeStats: {
                otb: stats,
                online: stats,
              },
              positionStats: {
                otb: stats,
                online: stats,
              },
              children: [],
            },
          },
          pinnedNodes: [],
          lastVisitedChildByParent: {},
        },
      },
    });

    fireEvent.click(await screen.findByRole("button", { name: "Show more theory" }));
    expect(screen.getByRole("button", { name: "Show less theory" })).toBeInTheDocument();

    act(() => {
      store.dispatch({ type: "ui/setCurrent", payload: nextNodeId });
    });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Show less theory" })).toBeInTheDocument();
    });
  });
});
