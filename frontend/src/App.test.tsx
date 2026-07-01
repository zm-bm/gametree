import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import App from './App';

const { boardHudMock, treeCanvasMock, useKeyboardActionsMock } = vi.hoisted(() => ({
  boardHudMock: vi.fn(),
  treeCanvasMock: vi.fn(),
  useKeyboardActionsMock: vi.fn(),
}));

vi.mock('./shared/hooks', () => ({
  useKeyboardActions: () => useKeyboardActionsMock(),
}));

vi.mock('./features/Tree', () => ({
  default: () => {
    treeCanvasMock();

    return <div data-testid="tree-canvas" />;
  },
}));

vi.mock('./features/Hud/BoardHud', () => ({
  default: () => {
    boardHudMock();

    return <div data-testid="board-hud" />;
  },
}));

describe('App', () => {
  beforeEach(() => {
    boardHudMock.mockClear();
    treeCanvasMock.mockClear();
    useKeyboardActionsMock.mockClear();
  });

  it('wires global keyboard actions and renders the full-viewport app workspace', () => {
    renderWithProviders(<App />);

    const main = screen.getByRole('main');
    const workspace = screen.getByTestId('app-workspace');
    const treeCanvas = screen.getByTestId('tree-canvas');
    const boardHud = screen.getByTestId('board-hud');

    expect(useKeyboardActionsMock).toHaveBeenCalledTimes(1);
    expect(main).toHaveClass('gt-treeview');
    expect(workspace).toContainElement(treeCanvas);
    expect(workspace).toContainElement(boardHud);
    expect(boardHud).not.toContainElement(treeCanvas);
    expect(treeCanvasMock).toHaveBeenCalledTimes(1);
    expect(boardHudMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('button', { name: 'Chess' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move Tree' })).not.toBeInTheDocument();
    expect(screen.queryByRole('complementary')).not.toBeInTheDocument();
    expect(document.querySelector('aside')).not.toBeInTheDocument();
    expect(screen.queryByTestId('position-inspector')).not.toBeInTheDocument();
    expect(screen.queryByTestId('board-dock')).not.toBeInTheDocument();
  });
});
