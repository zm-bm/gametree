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

vi.mock('./components/PositionDetailsView', () => ({
  default: () => <div data-testid="sidebar-position-details-view" />,
}));

vi.mock('./components/EngineView', () => ({
  default: () => <div data-testid="sidebar-engine-view" />,
}));

describe('Sidebar', () => {
  it('renders static chess board and a scroll region for position details and engine views', () => {
    renderWithProviders(<Sidebar />);

    const chessBoard = screen.getByTestId('sidebar-chessboard');
    const positionDetailsView = screen.getByTestId('sidebar-position-details-view');
    const engineView = screen.getByTestId('sidebar-engine-view');
    const scrollArea = screen.getByTestId('sidebar-scroll');
    const analysisDivider = screen.getByText('Analysis');

    expect(chessBoard).toBeInTheDocument();
    expect(positionDetailsView).toBeInTheDocument();
    expect(engineView).toBeInTheDocument();
    expect(analysisDivider).toBeInTheDocument();

    expect(scrollArea).not.toContainElement(analysisDivider);
    expect(scrollArea).toContainElement(positionDetailsView);
    expect(scrollArea).toContainElement(engineView);
    expect(scrollArea).not.toContainElement(chessBoard);
  });
});
