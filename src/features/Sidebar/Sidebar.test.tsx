import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import Sidebar from './Sidebar';

const chessBoardMock = vi.fn((props: { className?: string }) => (
  <div data-testid="sidebar-chessboard" data-classname={props.className} />
));

vi.mock('./components/ChessBoard', () => ({
  default: (props: { className?: string }) => chessBoardMock(props),
}));

vi.mock('./components/OpeningView', () => ({
  default: () => <div data-testid="sidebar-opening-view" />,
}));

vi.mock('./components/EngineView', () => ({
  default: () => <div data-testid="sidebar-engine-view" />,
}));

describe('Sidebar', () => {
  it('renders chess board, opening view, and engine view', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('sidebar-chessboard')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-opening-view')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar-engine-view')).toBeInTheDocument();
  });
});