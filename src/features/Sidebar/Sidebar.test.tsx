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

vi.mock('./components/PositionSummaryView', () => ({
  default: () => <div data-testid="sidebar-position-summary-view" />,
}));

vi.mock('./components/EngineView', () => ({
  default: () => <div data-testid="sidebar-engine-view" />,
}));

describe('Sidebar', () => {
  it('renders static chess board and a scroll region for position summary and engine views', () => {
    renderWithProviders(<Sidebar />);

    const chessBoard = screen.getByTestId('sidebar-chessboard');
    const positionSummaryView = screen.getByTestId('sidebar-position-summary-view');
    const engineView = screen.getByTestId('sidebar-engine-view');
    const scrollArea = screen.getByTestId('sidebar-scroll');
    const analysisDivider = screen.getByText('Analysis');

    expect(chessBoard).toBeInTheDocument();
    expect(positionSummaryView).toBeInTheDocument();
    expect(engineView).toBeInTheDocument();
    expect(analysisDivider).toBeInTheDocument();

    expect(scrollArea).not.toContainElement(analysisDivider);
    expect(scrollArea).toContainElement(positionSummaryView);
    expect(scrollArea).toContainElement(engineView);
    expect(scrollArea).not.toContainElement(chessBoard);
  });
});
