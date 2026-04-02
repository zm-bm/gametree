import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { nav } from '@/store/slices';
import { renderWithProviders } from '@/test/renderWithProviders';

import { PromotionPiece } from './PromotionPiece';

const dispatchMock = vi.fn();

vi.mock('@/store', async () => {
  const actual = await vi.importActual<typeof import('@/store')>('@/store');
  return {
    ...actual,
    useAppDispatch: () => dispatchMock,
  };
});

describe('PromotionPiece', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
  });

  it('positions piece square based on orientation and target rank', () => {
    const { container } = renderWithProviders(
      <PromotionPiece
        pieceName="queen"
        pieceSymbol="q"
        sideToMove="white"
        orientation="black"
        targetRank={1}
      />,
      {
        preloadedState: {
          ui: {
            boardFen: '8/P7/8/8/8/8/8/k6K w - - 0 1',
            boardPromotionTarget: ['a7', 'a8'],
            boardOrientation: 'black',
          },
        },
      }
    );

    const square = container.querySelector('.square');
    expect(square).toBeInTheDocument();
    expect(square).toHaveStyle({ top: '75%', left: '87.5%', width: '12.5%', height: '12.5%' });
    expect(container.querySelector('.piece.white.queen')).toBeInTheDocument();
  });

  it('dispatches commitMove when clicked and target exists', () => {
    const { container } = renderWithProviders(
      <PromotionPiece
        pieceName="queen"
        pieceSymbol="q"
        sideToMove="white"
        orientation="white"
        targetRank={0}
      />,
      {
        preloadedState: {
          ui: {
            boardFen: '8/P7/8/8/8/8/8/k6K w - - 0 1',
            boardPromotionTarget: ['a7', 'a8'],
            boardOrientation: 'white',
          },
        },
      }
    );

    const square = container.querySelector('.square');
    expect(square).toBeInTheDocument();

    fireEvent.click(square!);

    expect(dispatchMock).toHaveBeenCalledWith(
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
    const { container } = renderWithProviders(
      <PromotionPiece
        pieceName="queen"
        pieceSymbol="q"
        sideToMove="white"
        orientation="white"
        targetRank={0}
      />
    );

    const square = container.querySelector('.square');
    expect(square).toBeInTheDocument();

    fireEvent.click(square!);

    expect(dispatchMock).not.toHaveBeenCalled();
  });
});