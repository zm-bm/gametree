import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import EngineHeader from "./EngineHeader";

describe("EngineHeader", () => {
  it("renders idle controls and placeholders when output is unavailable", () => {
    const onToggle = vi.fn();

    render(
      <EngineHeader
        running={false}
        hasOutput={false}
        evalDisplay=""
        onToggle={onToggle}
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Toggle engine" });
    expect(screen.queryByText(/^Engine$/)).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("Stockfish 18")).toBeInTheDocument();
    expect(screen.queryByTestId("engine-header-score")).not.toBeInTheDocument();
    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.getByText("--")).toBeInTheDocument();
    expect(screen.queryByText(/start/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/stop/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bidle\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\brunning\b/i)).not.toBeInTheDocument();
  });

  it("renders running state values and toggles engine on click", () => {
    const onToggle = vi.fn();

    render(
      <EngineHeader
        running={true}
        hasOutput={true}
        evalDisplay="+0.5"
        depth={14}
        speed={513000}
        onToggle={onToggle}
      />,
    );

    const toggle = screen.getByRole("switch", { name: "Toggle engine" });
    expect(toggle).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("+0.5")).toBeInTheDocument();
    expect(screen.getByTestId("engine-header-score")).toHaveTextContent("+0.5");
    expect(screen.getByText("14")).toBeInTheDocument();
    expect(screen.getByText("513 kn/s")).toBeInTheDocument();

    fireEvent.click(toggle);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
