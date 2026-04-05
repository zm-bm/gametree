import { beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import PromotionOverlay from './PromotionOverlay';
import type { PromotionPieceProps } from './PromotionPiece';

const promotionPieceMock = vi.fn((_: PromotionPieceProps) => <div data-testid="promotion-piece" />);

vi.mock('./PromotionPiece', () => ({
  PromotionPiece: (props: PromotionPieceProps) => promotionPieceMock(props),
}));

describe('PromotionOverlay', () => {
  beforeEach(() => {
    promotionPieceMock.mockClear();
  });

  it('renders nothing by default', () => {
    const { container } = renderWithProviders(<PromotionOverlay size={400} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders promotion choices when promotion target is present', () => {
    const { container } = renderWithProviders(<PromotionOverlay size={360} />, {
      preloadedState: {
        ui: {
          boardFen: '8/P7/8/8/8/8/8/k6K w - - 0 1',
          boardOrientation: 'black',
          boardPromotionTarget: ['a7', 'a8'],
        },
      },
    });

    const overlay = container.querySelector('#promotion-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveStyle({ width: '360px', height: '360px' });

    expect(promotionPieceMock).toHaveBeenCalledTimes(4);
    expect(promotionPieceMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        pieceName: 'queen',
        pieceSymbol: 'q',
        sideToMove: 'white',
        orientation: 'black',
        targetRank: 0,
      })
    );
    expect(promotionPieceMock).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        pieceName: 'knight',
        pieceSymbol: 'n',
        targetRank: 3,
      })
    );
  });
});