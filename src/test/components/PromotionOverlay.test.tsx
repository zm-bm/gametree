import { describe, expect, it, vi } from "vitest";

import { MockDispatch, renderWithProviders } from "../../test/testUtils";
import PromotionOverlay from "../../components/PromotionOverlay";
import { initialState, rootNode } from "../../redux/gameSlice";
import { MoveNode } from "../../types/chess";
import { Square } from "chess.js";
import { fireEvent } from "@testing-library/react";
import { setupStore } from "../../store";
import { MakeMove } from "../../thunks";

const preloadedState = {
  game: {
    ...initialState,
    promotionTarget: ['b7', 'a8'] as Square[],
    moveTree: [{
      ...rootNode,
      move: {
        color: 'b',
        piece: 'q',
        from: 'd8',
        to: 'c8',
        san: 'Qc8',
        flags: 'n',
        lan: 'd8c8',
        before: 'rn1qkbnr/1Ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR b KQkq - 0 4',
        after: 'rnq1kbnr/1Ppppppp/8/8/8/8/1PPPPPPP/RNBQKBNR w KQkq - 1 5'
      },
    }] as MoveNode[]
  }
};

describe('PromotionOverlay', () => {
  it('renders nothing by default', () => {
    const { container } = renderWithProviders(<PromotionOverlay size={400} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders with promotionTarget', () => {
    const { container } = renderWithProviders(
      <PromotionOverlay size={400} />,
      { preloadedState }
    );
    expect(container.firstChild).toBeDefined();
  });

  it('dispatches MakeMove onClick', () => {
    const mockStore = setupStore(preloadedState);
    mockStore.dispatch = vi.fn() as MockDispatch;
    vi.mock('../../thunks', () => ({
      MakeMove: vi.fn()
    }))

    const { container } = renderWithProviders(
      <PromotionOverlay size={400} />, { store: mockStore }
    );

    const square = container.querySelector('[data-promotion="q"]')
    if (square) {
      fireEvent.click(square);
    }
    expect(mockStore.dispatch).toHaveBeenCalledOnce();
    expect(MakeMove).toHaveBeenCalledOnce();
    
    vi.clearAllMocks();
  });
})