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
  it('renders static chess board and a fixed analysis stack for summary + engine + theory', () => {
    renderWithProviders(<Sidebar />);

    const chessBoard = screen.getByTestId('sidebar-chessboard');
    const summary = screen.getByTestId('sidebar-position-summary');
    const theory = screen.getByTestId('sidebar-position-theory');
    const engineView = screen.getByTestId('sidebar-engine-view');
    const stack = screen.getByTestId('sidebar-stack');

    expect(chessBoard).toBeInTheDocument();
    expect(summary).toBeInTheDocument();
    expect(theory).toBeInTheDocument();
    expect(engineView).toBeInTheDocument();

    expect(stack).toContainElement(summary);
    expect(stack).toContainElement(engineView);
    expect(stack).toContainElement(theory);
    expect(Boolean(summary.compareDocumentPosition(engineView) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(engineView.compareDocumentPosition(theory) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(stack).not.toContainElement(chessBoard);
  });
});
