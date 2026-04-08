import { describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";

import { renderWithProviders } from "@/test/renderWithProviders";

import EngineView from "./EngineView";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("EngineView", () => {
  it("shows idle switch state by default and toggles running state", () => {
    const { store, container } = renderWithProviders(<EngineView />, {
      preloadedState: {
        ui: {
          engineRunning: false,
          boardFen: START_FEN,
          boardOrientation: "white",
        },
      },
    });

    expect(container.querySelector(".gt-engine-header-layout")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-primary")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-pv")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-stats")).toBeInTheDocument();
    expect(screen.queryByTestId("engine-header-score")).not.toBeInTheDocument();
    const toggle = screen.getByRole("switch", { name: "Toggle engine" });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.queryByText(/start/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/stop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bidle\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\brunning\b/i)).not.toBeInTheDocument();

    fireEvent.click(toggle);

    expect(store.getState().ui.engineRunning).toBe(true);
    expect(screen.getByRole("switch", { name: "Toggle engine" })).toHaveAttribute("aria-checked", "true");
  });

  it("renders running state with primary analysis and live metrics", () => {
    const { container } = renderWithProviders(<EngineView />, {
      preloadedState: {
        ui: {
          engineRunning: true,
          boardFen: START_FEN,
          boardOrientation: "white",
        },
        engine: {
          output: {
            depth: 14,
            seldepth: 28,
            cp: 40,
            pv: ["d2d4", "d7d5"],
            speed: 513000,
            time: 300,
            hashfull: 30,
            tbhits: 12,
          },
        },
      },
    });

    expect(screen.getByRole("switch", { name: "Toggle engine" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("+0.4")).toBeInTheDocument();
    expect(screen.getByTestId("engine-header-score")).toHaveTextContent("+0.4");
    expect(screen.queryByText(/best move/i)).not.toBeInTheDocument();
    expect(screen.getByText("513 kn/s")).toBeInTheDocument();
    expect(screen.getByText("0.3s")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-pv-body")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-bar")).toBeInTheDocument();
  });
});
