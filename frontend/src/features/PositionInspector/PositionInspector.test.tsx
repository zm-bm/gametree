import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import PositionInspector from './PositionInspector';
import type { ChessBoardProps } from '@/features/Sidebar/components/ChessBoard';

const { chessBoardMock } = vi.hoisted(() => ({
  chessBoardMock: vi.fn(),
}));

vi.mock('@/features/Sidebar/components/ChessBoard', () => ({
  default: (props: ChessBoardProps) => {
    chessBoardMock(props);

    return <div data-testid="position-inspector-board" data-classname={props.className} />;
  },
}));

vi.mock('@/features/Sidebar/components/ToggleOrientationButton', () => ({
  default: () => <button type="button" aria-label="Flip board" title="Flip board" />,
}));

vi.mock('@/features/Sidebar/components/PositionSummary/PositionSummary', () => ({
  default: () => <div data-testid="position-inspector-summary" />,
}));

vi.mock('@/features/Sidebar/components/EngineView', () => ({
  default: () => <div data-testid="position-inspector-engine" />,
}));

vi.mock('@/features/Sidebar/components/PositionTheory/PositionTheory', () => ({
  default: () => <div data-testid="position-inspector-theory" />,
}));

describe('PositionInspector', () => {
  it('renders the default full board and details stack in summary, engine, theory order', () => {
    renderWithProviders(<PositionInspector />);

    const board = screen.getByTestId('position-inspector-board');
    const boardActions = screen.getByTestId('position-inspector-board-actions');
    const boardContext = screen.getByTestId('position-inspector-board-context');
    const boardActionGroup = screen.getByTestId('position-inspector-board-action-group');
    const details = screen.getByTestId('position-inspector-details');
    const summary = screen.getByTestId('position-inspector-summary');
    const engine = screen.getByTestId('position-inspector-engine');
    const theory = screen.getByTestId('position-inspector-theory');

    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'full');
    expect(board).toBeInTheDocument();
    expect(board).toHaveAttribute('data-classname', 'gt-position-inspector-card');
    expect(boardContext).toHaveTextContent('WHITE');
    expect(boardActions).toContainElement(boardContext);
    expect(boardActionGroup).toContainElement(screen.getByRole('button', { name: 'Flip board' }));
    expect(details).toContainElement(summary);
    expect(details).toContainElement(engine);
    expect(details).toContainElement(theory);
    expect(details).not.toContainElement(board);
    expect(Boolean(summary.compareDocumentPosition(engine) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
    expect(Boolean(engine.compareDocumentPosition(theory) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(true);
  });

  it('omits details in compact mode by default', () => {
    renderWithProviders(<PositionInspector mode="compact" />);

    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'compact');
    expect(screen.getByTestId('position-inspector-board')).toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector-details')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector-engine')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector-theory')).not.toBeInTheDocument();
  });

  it('can omit details in full mode when requested', () => {
    renderWithProviders(<PositionInspector showDetails={false} />);

    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'full');
    expect(screen.getByTestId('position-inspector-board')).toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector-details')).not.toBeInTheDocument();
  });

  it('can render details in compact mode when requested', () => {
    renderWithProviders(<PositionInspector mode="compact" showDetails />);

    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'compact');
    expect(screen.getByTestId('position-inspector-board')).toBeInTheDocument();
    expect(screen.getByTestId('position-inspector-details')).toBeInTheDocument();
    expect(screen.getByTestId('position-inspector-summary')).toBeInTheDocument();
    expect(screen.getByTestId('position-inspector-engine')).toBeInTheDocument();
    expect(screen.getByTestId('position-inspector-theory')).toBeInTheDocument();
  });

  it('renders injected board actions in the board action rail', () => {
    renderWithProviders(
      <PositionInspector
        boardActions={<button type="button" aria-label="Inspect board" />}
      />,
    );

    const boardActions = screen.getByTestId('position-inspector-board-actions');
    const boardActionGroup = screen.getByTestId('position-inspector-board-action-group');

    expect(boardActions).toContainElement(screen.getByTestId('position-inspector-board-context'));
    expect(boardActionGroup).toContainElement(screen.getByRole('button', { name: 'Flip board' }));
    expect(boardActionGroup).toContainElement(screen.getByRole('button', { name: 'Inspect board' }));
  });

  it('renders the current board orientation as rail context', () => {
    renderWithProviders(<PositionInspector />, {
      preloadedState: {
        ui: {
          boardOrientation: 'black',
        },
      },
    });

    expect(screen.getByTestId('position-inspector-board-context')).toHaveTextContent('BLACK');
  });
});
