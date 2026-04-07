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

vi.mock('./components/PositionSummary/PositionSummary', () => ({
  default: () => <div data-testid="sidebar-position-summary" />,
}));

vi.mock('./components/PositionTheory/PositionTheory', () => ({
  default: () => <div data-testid="sidebar-position-theory" />,
}));

vi.mock('./components/EngineView', () => ({
  default: () => <div data-testid="sidebar-engine-view" />,
}));

describe('Sidebar', () => {
  it('renders static chess board, fixed metadata strip, and a scroll region for theory + engine', () => {
    renderWithProviders(<Sidebar />);

    const chessBoard = screen.getByTestId('sidebar-chessboard');
    const summary = screen.getByTestId('sidebar-position-summary');
    const theory = screen.getByTestId('sidebar-position-theory');
    const engineView = screen.getByTestId('sidebar-engine-view');
    const scrollArea = screen.getByTestId('sidebar-scroll');
    const analysisDivider = screen.getByText('Analysis');

    expect(chessBoard).toBeInTheDocument();
    expect(summary).toBeInTheDocument();
    expect(theory).toBeInTheDocument();
    expect(engineView).toBeInTheDocument();
    expect(analysisDivider).toBeInTheDocument();

    expect(scrollArea).not.toContainElement(analysisDivider);
    expect(scrollArea).toContainElement(theory);
    expect(scrollArea).toContainElement(engineView);
    expect(scrollArea).not.toContainElement(summary);
    expect(scrollArea).not.toContainElement(chessBoard);
  });
});
