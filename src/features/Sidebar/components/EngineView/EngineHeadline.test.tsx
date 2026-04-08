import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { EngineOutput } from "@/types";
import EngineHeadline from "./EngineHeadline";

const baseProps = {
  evalDisplay: "+0.4",
  sideToMove: "white",
  orientation: "white",
};

describe("EngineHeadline", () => {
  it("renders eval score and evaluation bar", () => {
    const engineOutput: EngineOutput = {
      depth: 14,
      seldepth: 20,
      cp: 40,
      pv: ["d2d4", "d7d5"],
    };

    render(
      <EngineHeadline
        {...baseProps}
        engineOutput={engineOutput}
      />,
    );

    expect(screen.getByTestId("engine-eval-bar")).toBeInTheDocument();
    expect(screen.getByLabelText("Engine evaluation bar (+0.4)")).toBeInTheDocument();
    expect(screen.queryByText(/best move/i)).not.toBeInTheDocument();
  });

  it("clamps the eval bar share to the configured range", () => {
    const engineOutput: EngineOutput = {
      depth: 18,
      seldepth: 24,
      cp: 100000,
      pv: ["e2e4"],
    };

    render(
      <EngineHeadline
        {...baseProps}
        engineOutput={engineOutput}
      />,
    );

    const whiteSegment = screen.getByTestId("engine-eval-bar-white");
    const blackSegment = screen.getByTestId("engine-eval-bar-black");

    expect(Number.parseFloat((whiteSegment as HTMLDivElement).style.width)).toBeCloseTo(95, 5);
    expect(Number.parseFloat((blackSegment as HTMLDivElement).style.width)).toBeCloseTo(5, 5);
  });

  it("uses a fallback eval bar aria label when score text is empty", () => {
    render(
      <EngineHeadline
        {...baseProps}
        evalDisplay=""
        engineOutput={null}
      />,
    );

    expect(screen.getByLabelText("Engine evaluation bar")).toBeInTheDocument();
  });
});
