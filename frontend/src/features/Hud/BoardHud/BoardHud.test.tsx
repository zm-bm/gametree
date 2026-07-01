import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

import type { ChessBoardProps } from '@/features/Hud/Board/ChessBoard';
import { renderWithProviders } from '@/test/renderWithProviders';

import BoardHud from './BoardHud';

const { chessBoardMock, engineViewMock, positionSummaryMock, positionTheoryMock } = vi.hoisted(() => ({
  chessBoardMock: vi.fn(),
  engineViewMock: vi.fn(),
  positionSummaryMock: vi.fn(),
  positionTheoryMock: vi.fn(),
}));

vi.mock('@/features/Hud/Board/ChessBoard', () => ({
  default: (props: ChessBoardProps) => {
    chessBoardMock(props);

    return <div data-testid="chess-board" data-classname={props.className} />;
  },
}));

vi.mock('@/features/Hud/Panels/PositionSummary/PositionSummary', () => ({
  default: () => {
    positionSummaryMock();

    return <div data-testid="position-summary" />;
  },
}));

vi.mock('@/features/Hud/Panels/EngineView', () => ({
  default: () => {
    engineViewMock();

    return <div data-testid="engine-view" />;
  },
}));

vi.mock('@/features/Hud/Panels/PositionTheory/PositionTheory', () => ({
  default: () => {
    positionTheoryMock();

    return <div data-testid="position-theory" />;
  },
}));

describe('BoardHud', () => {
  beforeEach(() => {
    chessBoardMock.mockClear();
    engineViewMock.mockClear();
    positionSummaryMock.mockClear();
    positionTheoryMock.mockClear();
  });

  it('renders the compact pinned board HUD with board and toolbar controls', () => {
    renderWithProviders(<BoardHud />);

    const hud = screen.getByTestId('board-hud');
    const board = screen.getByTestId('board-hud-board');
    const toolbar = screen.getByRole('toolbar', { name: 'Board actions' });
    const detailRail = screen.getByRole('toolbar', { name: 'Position detail panels' });
    const flipButton = within(toolbar).getByRole('button', { name: 'Flip board' });
    const expandButton = within(toolbar).getByRole('button', { name: 'Expand board' });
    const summaryToggle = within(detailRail).getByRole('button', { name: 'Show summary' });
    const engineToggle = within(detailRail).getByRole('button', { name: 'Show engine' });
    const theoryToggle = within(detailRail).getByRole('button', { name: 'Show theory' });

    expect(hud).toHaveAttribute('aria-label', 'Current position board');
    expect(hud).toContainElement(board);
    expect(hud).toContainElement(toolbar);
    expect(hud).toContainElement(detailRail);
    expect(within(board).getByTestId('chess-board')).toHaveAttribute('data-classname', 'gt-board-hud-board-surface');
    expect(flipButton).not.toHaveAttribute('title');
    expect(expandButton).toBe(screen.getByTestId('board-hud-expand-action'));
    expect(expandButton).not.toHaveAttribute('title');
    expect(summaryToggle).toHaveAttribute('aria-controls', 'board-hud-panel-summary');
    expect(summaryToggle).toHaveAttribute('aria-expanded', 'false');
    expect(summaryToggle).not.toHaveAttribute('title');
    expect(engineToggle).toHaveAttribute('aria-controls', 'board-hud-panel-engine');
    expect(engineToggle).toHaveAttribute('aria-expanded', 'false');
    expect(engineToggle).not.toHaveAttribute('title');
    expect(theoryToggle).toHaveAttribute('aria-controls', 'board-hud-panel-theory');
    expect(theoryToggle).toHaveAttribute('aria-expanded', 'false');
    expect(theoryToggle).not.toHaveAttribute('title');
    expect(screen.queryByTestId('position-inspector')).not.toBeInTheDocument();
    expect(screen.queryByTestId('board-dock')).not.toBeInTheDocument();
  });

  it('keeps detail HUD panels closed by default', () => {
    renderWithProviders(<BoardHud />);

    expect(screen.queryByTestId('board-hud-detail-stack')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('engine-view')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-theory')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show summary' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Show engine' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Show theory' })).toHaveAttribute('aria-pressed', 'false');
  });

  it('toggles board orientation from the compact toolbar', () => {
    const { store } = renderWithProviders(<BoardHud />);

    expect(store.getState().ui.boardOrientation).toBe('white');

    fireEvent.click(screen.getByRole('button', { name: 'Flip board' }));

    expect(store.getState().ui.boardOrientation).toBe('black');
  });

  it('opens and closes individual detail HUD panels', () => {
    renderWithProviders(<BoardHud />);

    fireEvent.click(screen.getByRole('button', { name: 'Show summary' }));

    expect(screen.getByRole('button', { name: 'Hide summary' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Hide summary' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: 'Summary' })).toBe(
      screen.getByTestId('board-hud-detail-panel-summary'),
    );
    expect(screen.getByTestId('board-hud-detail-panel-summary')).toHaveAttribute('id', 'board-hud-panel-summary');
    expect(screen.getByTestId('board-hud-detail-panel-summary')).toHaveAttribute(
      'aria-labelledby',
      'board-hud-panel-title-summary',
    );
    expect(screen.getByTestId('position-summary')).toBeInTheDocument();
    expect(positionSummaryMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Close summary panel' })).not.toHaveAttribute('title');

    fireEvent.click(screen.getByRole('button', { name: 'Close summary panel' }));

    expect(screen.queryByTestId('board-hud-detail-panel-summary')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Show summary' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Show summary' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('allows summary, engine, and theory panels to be open together', async () => {
    renderWithProviders(<BoardHud />);

    fireEvent.click(screen.getByRole('button', { name: 'Show summary' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show engine' }));
    fireEvent.click(screen.getByRole('button', { name: 'Show theory' }));

    const stack = screen.getByTestId('board-hud-detail-stack');
    expect(within(stack).getByRole('region', { name: 'Summary' })).toBeInTheDocument();
    expect(within(stack).getByRole('region', { name: 'Engine' })).toBeInTheDocument();
    expect(within(stack).getByRole('region', { name: 'Theory' })).toBeInTheDocument();
    expect(within(stack).getByTestId('position-summary')).toBeInTheDocument();
    expect(await within(stack).findByTestId('engine-view')).toBeInTheDocument();
    expect(await within(stack).findByTestId('position-theory')).toBeInTheDocument();
  });

  it('expands to a mobile board inspection layer with board and summary only', () => {
    renderWithProviders(<BoardHud />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(screen.getByTestId('board-hud-inspect-layer')).toHaveAttribute('aria-label', 'Expanded board inspector');
    expect(screen.getByTestId('board-hud-backdrop')).toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Board inspection' })).toHaveAttribute('aria-modal', 'true');
    const panel = screen.getByTestId('board-hud-panel');
    expect(panel).toBeInTheDocument();

    const panelActions = screen.getByTestId('board-hud-panel-actions');
    expect(within(panelActions).getByRole('button', { name: 'Flip board' })).toBeInTheDocument();
    expect(within(panelActions).getByRole('button', { name: 'Back to tree' })).toBeInTheDocument();
    const expandedBoard = within(panel).getByTestId('board-hud-expanded-board');
    expect(within(expandedBoard).getByTestId('chess-board')).toBeInTheDocument();
    expect(within(panel).getByTestId('position-summary')).toBeInTheDocument();
    expect(within(panel).queryByTestId('engine-view')).not.toBeInTheDocument();
    expect(within(panel).queryByTestId('position-theory')).not.toBeInTheDocument();
  });

  it('collapses from the header action, backdrop, and Escape', () => {
    renderWithProviders(<BoardHud />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));
    fireEvent.click(screen.getByRole('button', { name: 'Back to tree' }));
    expect(screen.queryByTestId('board-hud-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));
    fireEvent.click(screen.getByTestId('board-hud-backdrop'));
    expect(screen.queryByTestId('board-hud-panel')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByTestId('board-hud-panel')).not.toBeInTheDocument();
  });

  it('moves focus to Back to tree when expanded', () => {
    renderWithProviders(<BoardHud />);

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(screen.getByRole('button', { name: 'Back to tree' })).toHaveFocus();
  });

  it('hides the app root from interaction while expanded', () => {
    const appRoot = document.createElement('div');
    appRoot.id = 'root';
    document.body.appendChild(appRoot);
    renderWithProviders(<BoardHud />, { container: appRoot });

    fireEvent.click(screen.getByRole('button', { name: 'Expand board' }));

    expect(appRoot).toHaveAttribute('inert');
    expect(appRoot).toHaveAttribute('aria-hidden', 'true');

    fireEvent.click(screen.getByRole('button', { name: 'Back to tree' }));

    expect(appRoot).not.toHaveAttribute('inert');
    expect(appRoot).not.toHaveAttribute('aria-hidden');
  });

  it('stops board HUD events from bubbling to the tree workspace', () => {
    const onClick = vi.fn();
    const onContextMenu = vi.fn();
    const onMouseDown = vi.fn();
    const onPointerDown = vi.fn();
    const onPointerMove = vi.fn();
    const onPointerUp = vi.fn();
    const onTouchStart = vi.fn();
    const onWheel = vi.fn();

    renderWithProviders(
      <div
        onClick={onClick}
        onContextMenu={onContextMenu}
        onMouseDown={onMouseDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onTouchStart={onTouchStart}
        onWheel={onWheel}
      >
        <BoardHud />
      </div>,
    );

    const hud = screen.getByTestId('board-hud');
    fireEvent.click(screen.getByRole('button', { name: 'Show summary' }));
    const detailPanel = screen.getByTestId('board-hud-detail-panel-summary');

    for (const target of [hud, detailPanel]) {
      fireEvent.click(target);
      fireEvent.contextMenu(target);
      fireEvent.mouseDown(target);
      fireEvent.pointerDown(target);
      fireEvent.pointerMove(target);
      fireEvent.pointerUp(target);
      fireEvent.touchStart(target);
      fireEvent.wheel(target);
    }

    expect(onClick).not.toHaveBeenCalled();
    expect(onContextMenu).not.toHaveBeenCalled();
    expect(onMouseDown).not.toHaveBeenCalled();
    expect(onPointerDown).not.toHaveBeenCalled();
    expect(onPointerMove).not.toHaveBeenCalled();
    expect(onPointerUp).not.toHaveBeenCalled();
    expect(onTouchStart).not.toHaveBeenCalled();
    expect(onWheel).not.toHaveBeenCalled();
  });
});
