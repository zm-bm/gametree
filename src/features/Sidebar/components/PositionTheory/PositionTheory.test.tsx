import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";

import type { TheoryLookupResult } from "@/types";

const { mockUseGetTheoryByNodeQuery } = vi.hoisted(() => ({
  mockUseGetTheoryByNodeQuery: vi.fn(),
}));

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

import PositionTheory from "./PositionTheory";

const makeTheoryResult = (overrides: Partial<TheoryLookupResult> = {}): TheoryLookupResult => ({
  snippets: [],
  sourceTitle: "Chess_Opening_Theory/1._e4",
  sourceUrl: "https://en.wikibooks.org/wiki/Chess_Opening_Theory/1._e4",
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

const renderTheory = (overrides: Partial<ComponentProps<typeof PositionTheory>> = {}) =>
  render(
    <PositionTheory
      currentVisibleId="e2e4,c7c5,g1f3,d7d6"
      openingName="Sicilian Defense"
      recentLine="1. e4 c5 2. Nf3 d6"
      sanMoves={["e4", "c5", "Nf3", "d6"]}
      {...overrides}
    />,
  );

describe("PositionTheory", () => {
  beforeEach(() => {
    mockUseGetTheoryByNodeQuery.mockReset();
  });

  it("shows loading placeholder before theory settles", () => {
    setTheoryHookState({
      data: undefined,
      isFetching: true,
      isError: false,
    });

    renderTheory();
    expect(screen.getByText("Loading opening note...")).toBeInTheDocument();
  });

  it("shows no-note placeholder and hides actions when settled with no snippets", async () => {
    setTheoryHookState({
      data: makeTheoryResult({ snippets: [] }),
      isFetching: false,
      isError: false,
    });

    renderTheory();
    expect(await screen.findByText("No Wikibooks note for this position yet (possibly past available opening theory).")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Source" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Show more theory" })).not.toBeInTheDocument();
  });

  it("renders settled snippet content and source link", async () => {
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: "Black prepares ...d6 and flexible kingside development.",
            html: "Black prepares ...d6 and flexible kingside development.",
          },
        ],
      }),
    });

    renderTheory();
    expect(await screen.findByText("Black prepares ...d6 and flexible kingside development.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Source" })).toBeInTheDocument();
  });

  it("shows expand/collapse control for long theory text", async () => {
    const longText = "Black keeps central tension and prepares kingside development. ".repeat(12).trim();
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: longText,
            html: longText,
          },
        ],
      }),
    });

    renderTheory();
    const expandButton = await screen.findByRole("button", { name: "Show more theory" });
    fireEvent.click(expandButton);
    expect(screen.getByRole("button", { name: "Show less theory" })).toBeInTheDocument();
  });

  it("resets theory scroll position when current position changes", async () => {
    const longText = "Black keeps central tension and prepares kingside development. ".repeat(18).trim();
    setTheoryHookState({
      data: makeTheoryResult({
        snippets: [
          {
            kind: "paragraph",
            text: longText,
            html: longText,
          },
        ],
      }),
    });

    const { container, rerender } = renderTheory();
    await screen.findByRole("button", { name: "Show more theory" });
    const theoryBox = container.querySelector(".gt-position-theory-box") as HTMLDivElement;
    theoryBox.scrollTop = 42;

    rerender(
      <PositionTheory
        currentVisibleId="e2e4,c7c5,g1f3,d7d6,c2c4"
        openingName="Sicilian Defense"
        recentLine="1. e4 c5 2. Nf3 d6 3. c4"
        sanMoves={["e4", "c5", "Nf3", "d6", "c4"]}
      />,
    );

    expect(theoryBox.scrollTop).toBe(0);
  });
});
