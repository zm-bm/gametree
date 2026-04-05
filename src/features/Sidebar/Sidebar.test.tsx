import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import Sidebar from './Sidebar';
import type { ChessBoardProps } from './components/ChessBoard';

const chessBoardMock = vi.fn((props: ChessBoardProps) => (
  <div data-testid="sidebar-chessboard" data-classname={props.className} />
));

vi.mock('./components/ChessBoard', () => ({
  default: (props: ChessBoardProps) => chessBoardMock(props),
}));

vi.mock('./components/OpeningView', () => ({
  default: () => <div data-testid="sidebar-opening-view" />,
}));

vi.mock('./components/EngineView', () => ({
  default: () => <div data-testid="sidebar-engine-view" />,
}));

describe('Sidebar', () => {
  it('renders static chess board and a scroll region for opening and engine views', () => {
    renderWithProviders(<Sidebar />);

    const chessBoard = screen.getByTestId('sidebar-chessboard');
    const openingView = screen.getByTestId('sidebar-opening-view');
    const engineView = screen.getByTestId('sidebar-engine-view');
    const scrollArea = screen.getByTestId('sidebar-scroll');

    expect(chessBoard).toBeInTheDocument();
    expect(openingView).toBeInTheDocument();
    expect(engineView).toBeInTheDocument();

    expect(scrollArea).toContainElement(openingView);
    expect(scrollArea).toContainElement(engineView);
    expect(scrollArea).not.toContainElement(chessBoard);
  });
});