import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { setupStore } from '@/store';
import { nav } from '@/store/slices';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PromotionPiece, type PromotionPieceProps } from './PromotionPiece';

const boardFen = '8/P7/8/8/8/8/8/k6K w - - 0 1';
const baseProps: PromotionPieceProps = {
  pieceName: 'queen',
  pieceSymbol: 'q',
  sideToMove: 'white',
  orientation: 'white',
  targetRank: 0,
};

describe('PromotionPiece', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('positions piece square based on orientation and target rank', () => {
    const { container } = renderWithProviders(
      <PromotionPiece {...baseProps} orientation="black" targetRank={1} />,
      {
        preloadedState: {
          ui: {
            boardFen,
            boardPromotionTarget: ['a7', 'a8'],
            boardOrientation: 'black',
          },
        },
      }
    );

    const square = container.querySelector('.square');
    expect(square).toBeInTheDocument();
    if (!square) throw new Error('Expected square to be rendered');

    expect(square).toHaveStyle({ top: '75%', left: '87.5%', width: '12.5%', height: '12.5%' });
    expect(container.querySelector('.piece.white.queen')).toBeInTheDocument();
  });

  it('dispatches commitMove when clicked and target exists', () => {
    const store = setupStore({
      ui: {
        boardFen,
        boardPromotionTarget: ['a7', 'a8'],
        boardOrientation: 'white',
      },
    });
    const dispatchSpy = vi.spyOn(store, 'dispatch').mockImplementation(() => ({ type: 'test/mock' }));

    const { container } = renderWithProviders(<PromotionPiece {...baseProps} />, { store });
    const square = container.querySelector('.square');
    expect(square).toBeInTheDocument();
    if (!square) throw new Error('Expected square to be rendered');

    fireEvent.click(square);

    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: nav.actions.commitMove.type,
        payload: expect.objectContaining({
          from: 'a7',
          to: 'a8',
          promotion: 'q',
        }),
      })
    );
  });

  it('does not dispatch move when target is missing', () => {
    const store = setupStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch').mockImplementation(() => ({ type: 'test/mock' }));

    const { container } = renderWithProviders(<PromotionPiece {...baseProps} />, { store });
    const square = container.querySelector('.square');
    expect(square).toBeInTheDocument();
    if (!square) throw new Error('Expected square to be rendered');

    fireEvent.click(square);

    expect(dispatchSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({ type: nav.actions.commitMove.type })
    );
  });
});
