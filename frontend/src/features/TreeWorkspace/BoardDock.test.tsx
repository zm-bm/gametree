import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

import type { PositionInspectorProps } from '@/features/PositionInspector';
import type { ChessBoardProps } from '@/features/Sidebar/components/ChessBoard';
import { renderWithProviders } from '@/test/renderWithProviders';

import BoardDock from './BoardDock';

const { chessBoardMock, positionInspectorMock, positionSummaryMock } = vi.hoisted(() => ({
  chessBoardMock: vi.fn(),
  positionInspectorMock: vi.fn(),
  positionSummaryMock: vi.fn(),
}));

vi.mock('@/features/PositionInspector', () => ({
  default: (props: PositionInspectorProps) => {
    positionInspectorMock(props);

    return (
      <div
        data-testid="position-inspector"
        data-mode={props.mode}
        data-show-details={String(props.showDetails)}
      >
        <button type="button" aria-label="Flip board" title="Flip board" />
        {props.boardActions}
      </div>
    );
  },
}));

vi.mock('@/features/Sidebar/components/ChessBoard', () => ({
  default: (props: ChessBoardProps) => {
    chessBoardMock(props);

    return <div data-testid="expanded-chess-board" data-classname={props.className} />;
  },
}));

vi.mock('@/features/Sidebar/components/PositionSummary/PositionSummary', () => ({
  default: () => {
    positionSummaryMock();

    return <div data-testid="expanded-position-summary" />;
  },
}));

describe('BoardDock', () => {
  beforeEach(() => {
    chessBoardMock.mockClear();
    positionInspectorMock.mockClear();
    positionSummaryMock.mockClear();
  });

  it('renders the compact board through PositionInspector without details', () => {
    renderWithProviders(<BoardDock />);

    expect(screen.getByTestId('board-dock')).toHaveAttribute('aria-label', 'Current position board');
    const compactInspector = screen.getByTestId('position-inspector');
    expect(within(compactInspector).getByRole('button', { name: 'Flip board' })).toBeInTheDocument();
    expect(within(compactInspector).getByRole('button', { name: 'Expand board' })).toBe(
      screen.getByTestId('board-dock-expand-action'),
    );
    expect(positionInspectorMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'compact',
      showDetails: false,
      boardActions: expect.anything(),
    }));
    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'compact');
    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-show-details', 'false');
  });

  it('expands to a larger board panel with essential position summary', () => {
    renderWithProviders(<BoardDock />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(screen.getByTestId('board-dock')).toHaveAttribute('aria-label', 'Expanded board inspector');
    expect(screen.getByTestId('board-dock-backdrop')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Board inspection' })).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByTestId('board-dock-panel')).toBeInTheDocument();
    const panelHeader = screen.getByTestId('board-dock-panel-header');
    const panelActions = screen.getByTestId('board-dock-panel-actions');
    expect(within(panelHeader).getByRole('button', { name: 'Back to tree' })).toBeInTheDocument();
    expect(within(panelActions).getByRole('button', { name: 'Flip board' })).toBeInTheDocument();
    expect(within(panelActions).getByRole('button', { name: 'Back to tree' })).toBeInTheDocument();
    expect(screen.queryByTestId('board-dock-expanded-actions')).not.toBeInTheDocument();
    expect(screen.getByTestId('expanded-chess-board')).toHaveAttribute('data-classname', 'gt-position-inspector-card');
    expect(screen.getByTestId('expanded-position-summary')).toBeInTheDocument();
    expect(chessBoardMock).toHaveBeenCalledTimes(1);
    expect(positionSummaryMock).toHaveBeenCalledTimes(1);
  });

  it('does not render engine or theory inside the expanded panel', () => {
    renderWithProviders(<BoardDock />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(screen.queryByTestId('position-inspector-engine')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector-theory')).not.toBeInTheDocument();
    expect(screen.queryByText('Stockfish 18')).not.toBeInTheDocument();
  });

  it('collapses back to the compact dock from the collapse action', () => {
    renderWithProviders(<BoardDock />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to tree' }));

    expect(screen.queryByTestId('board-dock-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand board' })).toBeInTheDocument();
    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'compact');
  });

  it('collapses back to the compact dock from the backdrop', () => {
    renderWithProviders(<BoardDock />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));
    fireEvent.mouseDown(screen.getByTestId('board-dock-backdrop'));

    expect(screen.queryByTestId('board-dock-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand board' })).toBeInTheDocument();
    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'compact');
  });

  it('collapses the expanded panel on Escape', () => {
    renderWithProviders(<BoardDock />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));
    fireEvent.keyDown(window, { key: 'Escape' });

    expect(screen.queryByTestId('board-dock-panel')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Expand board' })).toBeInTheDocument();
  });

  it('moves focus to the back action when expanded', () => {
    renderWithProviders(<BoardDock />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(screen.getByRole('button', { name: 'Back to tree' })).toHaveFocus();
  });

  it('hides the app root from interaction while the inspection dialog is expanded', () => {
    const appRoot = document.createElement('div');
    appRoot.id = 'root';
    document.body.appendChild(appRoot);
    renderWithProviders(<BoardDock />, { container: appRoot });

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(appRoot).toHaveAttribute('inert');
    expect(appRoot).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Back to tree' }));

    expect(appRoot).not.toHaveAttribute('inert');
    expect(appRoot).not.toHaveAttribute('aria-hidden');
  });
});
