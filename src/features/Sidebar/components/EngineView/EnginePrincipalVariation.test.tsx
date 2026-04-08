import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import type { MouseEvent } from "react";

const { mockOnHoverEnter, mockOnHoverLeave } = vi.hoisted(() => ({
  mockOnHoverEnter: vi.fn(),
  mockOnHoverLeave: vi.fn(),
}));

vi.mock("@/features/Sidebar/hooks/useHoverIntent", () => ({
  useHoverIntent: () => ({
    onMouseEnter: (e: MouseEvent<HTMLElement>) => mockOnHoverEnter(e.currentTarget.getAttribute("data-id")),
    onMouseLeave: () => mockOnHoverLeave(),
  }),
}));

import EnginePrincipalVariation from "./EnginePrincipalVariation";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

describe("EnginePrincipalVariation", () => {
  beforeEach(() => {
    mockOnHoverEnter.mockReset();
    mockOnHoverLeave.mockReset();
  });

  it("renders PV moves with numbering", () => {
    const { container } = render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={["e2e4", "e7e5", "g1f3"]}
      />,
    );

    expect(screen.getByText("Principal variation")).toBeInTheDocument();
    expect(screen.getByText("e4")).toBeInTheDocument();
    expect(screen.getByText("e5")).toBeInTheDocument();
    expect(screen.getByText("Nf3")).toBeInTheDocument();
    expect(container.querySelector(".gt-engine-pv-body")).toBeInTheDocument();
  });

  it("passes computed hover ids and leave events to hook handlers", () => {
    render(
      <EnginePrincipalVariation
        fen={START_FEN}
        currentVisibleId="d2d4,d7d5"
        pvMoves={["c2c4", "e7e6"]}
      />,
    );

    const secondToken = screen.getByText("e6").closest("span") as HTMLSpanElement;
    fireEvent.mouseEnter(secondToken);
    fireEvent.mouseLeave(secondToken);

    expect(mockOnHoverEnter).toHaveBeenCalledWith("d2d4,d7d5,c2c4,e7e6");
    expect(mockOnHoverLeave).toHaveBeenCalledTimes(1);
  });

  it("caps rendered PV to 10 plies", () => {
    const pvMoves = [
      "e2e4", "e7e5",
      "g1f3", "b8c6",
      "f1b5", "a7a6",
      "b5a4", "g8f6",
      "e1g1", "f8e7",
      "f1e1", "b7b5",
    ];

    const { container } = render(
      <EnginePrincipalVariation
        fen={START_FEN}
        pvMoves={pvMoves}
      />,
    );

    const tokens = container.querySelectorAll(".gt-engine-pv-token");
    expect(tokens).toHaveLength(10);
    expect(screen.queryByText("Re1")).not.toBeInTheDocument();
  });
});
