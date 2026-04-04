import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { Chessground } from 'chessground';
import { Config } from 'chessground/config';

import { renderWithProviders } from '@/test/renderWithProviders';
import Board from './Board';
import type { PromotionOverlayProps } from '../PromotionOverlay/PromotionOverlay';

const setMock = vi.fn();

vi.mock('chessground', () => ({
  Chessground: vi.fn().mockImplementation(() => ({
    set: setMock,
  })),
}));

vi.mock('../../hooks/useBoardSize', () => ({
  useBoardSize: () => [
    { current: null },
    320,
  ],
}));

const promotionOverlayMock = vi.fn(({ size }: PromotionOverlayProps) => (
  <div data-testid="promotion-overlay-mock" data-size={size} />
));

vi.mock('../PromotionOverlay', () => ({
  default: ({ size }: PromotionOverlayProps) => promotionOverlayMock({ size }),
}));

describe('Board', () => {
  beforeEach(() => {
    setMock.mockClear();
    promotionOverlayMock.mockClear();
  });

  it('initializes chessground with config and default animation settings', () => {
    const config: Config = { fen: '8/8/8/8/8/8/8/8 w - - 0 1' };

    renderWithProviders(<Board config={config} className="sidebar-card" />);

    expect(Chessground).toHaveBeenCalledTimes(1);
    expect(Chessground).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        animation: { enabled: true, duration: 200 },
        fen: config.fen,
      })
    );

    const wrapper = screen.getByTestId('board-wrapper');
    expect(wrapper).toHaveStyle({ width: '320px', height: '320px' });
    expect(wrapper.firstElementChild).toHaveClass('sidebar-card');
  });

  it('calls api.set when config changes', () => {
    const { rerender } = renderWithProviders(<Board config={{}} />);
    const config = { fen: '' };

    rerender(<Board config={config} />);

    expect(setMock).toHaveBeenCalledTimes(2);
    expect(setMock).toBeCalledWith(config);
  });

  it('renders promotion overlay only when enabled', () => {
    const { rerender } = renderWithProviders(<Board config={{}} />);

    expect(screen.queryByTestId('promotion-overlay-mock')).toBeNull();
    expect(promotionOverlayMock).not.toHaveBeenCalled();

    rerender(<Board config={{}} promotionOverlay={true} />);

    expect(screen.getByTestId('promotion-overlay-mock')).toBeInTheDocument();
    expect(promotionOverlayMock).toHaveBeenCalledWith({ size: 320 });
  });
});