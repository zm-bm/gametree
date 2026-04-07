import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import PositionSummary from "./PositionSummary";

const baseProps = {
  openingName: "Sicilian Defense: Najdorf Variation",
  ecoCode: "B90",
  recentLine: "1. e4 c5 2. Nf3 d6",
  hasSanMoves: true,
  isLoadingPosition: false,
  hasCurrentNode: true,
  hasPositionStats: true,
  totalGames: 715500,
};

describe("PositionSummary", () => {
  it("renders opening, eco, move line, and compact game count", () => {
    render(<PositionSummary {...baseProps} />);

    expect(screen.getByText("Sicilian Defense: Najdorf Variation")).toBeInTheDocument();
    expect(screen.getByText("B90")).toBeInTheDocument();
    expect(screen.getByText("1. e4 c5 2. Nf3 d6")).toBeInTheDocument();
    expect(screen.getByText("715.5K games")).toBeInTheDocument();
    expect(screen.queryByText("No game count available.")).not.toBeInTheDocument();
  });

  it("shows start-position line as empty-state styling path and hides game count when stats missing", () => {
    render(
      <PositionSummary
        {...baseProps}
        recentLine="Start position"
        hasSanMoves={false}
        hasPositionStats={false}
        totalGames={0}
      />,
    );

    expect(screen.getByText("Start position")).toBeInTheDocument();
    expect(screen.queryByText(/games$/)).not.toBeInTheDocument();
    expect(screen.getByText("No game count available.")).toBeInTheDocument();
  });

  it("prioritizes loading and missing-node status messages", () => {
    const { rerender } = render(
      <PositionSummary
        {...baseProps}
        isLoadingPosition={true}
      />,
    );
    expect(screen.getByText("Loading position...")).toBeInTheDocument();

    rerender(
      <PositionSummary
        {...baseProps}
        isLoadingPosition={false}
        hasCurrentNode={false}
      />,
    );
    expect(screen.getByText("No opening data for this position yet.")).toBeInTheDocument();
  });
});
