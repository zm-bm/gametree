import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ComponentProps } from "react";

import type { TheoryLookupResult } from "@/types";

const { mockUseGetTheoryByNodeQuery } = vi.hoisted(() => ({
  mockUseGetTheoryByNodeQuery: vi.fn(),
}));

vi.mock("react-redux", async () => {
  const actual = await vi.importActual<typeof import("react-redux")>("react-redux");
  return {
    ...actual,
    useSelector: () => "",
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
    expect(screen.queryByRole("button", { name: /Show (more|less) theory/ })).not.toBeInTheDocument();
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

  it("does not render expand/collapse controls for long theory text", async () => {
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
    await screen.findByText(/Black keeps central tension and prepares kingside development\./);
    expect(screen.queryByRole("button", { name: /Show (more|less) theory/ })).not.toBeInTheDocument();
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
    await screen.findByText(/Black keeps central tension and prepares kingside development\./);
    const theoryBox = container.querySelector(".gt-position-theory-scrollable") as HTMLDivElement;
    theoryBox.scrollTop = 42;

    rerender(
      <PositionTheory
        currentVisibleId="e2e4,c7c5,g1f3,d7d6,c2c4"
      />,
    );

    expect(theoryBox.scrollTop).toBe(0);
  });
});
