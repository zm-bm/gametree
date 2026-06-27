import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { EngineOutput } from "@/types";
import EngineSecondaryStats from "./EngineSecondaryStats";

describe("EngineSecondaryStats", () => {
  it("renders placeholders when engine output is unavailable", () => {
    render(<EngineSecondaryStats engineOutput={null} />);

    expect(screen.getAllByText("--").length).toBeGreaterThanOrEqual(4);
  });

  it("renders formatted secondary metrics from engine output", () => {
    const engineOutput: EngineOutput = {
      depth: 16,
      seldepth: 28,
      time: 300,
      speed: 513000,
      hashfull: 30,
      tbhits: 12,
      pv: ["e2e4"],
      cp: 20,
    };

    render(<EngineSecondaryStats engineOutput={engineOutput} />);

    expect(screen.getByText("0.3s")).toBeInTheDocument();
    expect(screen.getByText("3%")).toBeInTheDocument();
    expect(screen.getByText("28")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});

