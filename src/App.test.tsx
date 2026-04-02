import { describe, expect, it, beforeEach, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import App from './App';

const TAB_LABELS = {
  sidebar: 'Chess',
  tree: 'Move Tree',
} as const;

const TEST_IDS = {
  sidebar: 'sidebar',
  tree: 'tree-view',
} as const;

const HIDDEN_CLASS = 'hidden';

const useKeyboardActionsMock = vi.fn();

vi.mock('./shared/hooks', () => ({
  useKeyboardActions: () => useKeyboardActionsMock(),
}));

vi.mock('./features/TreeView', () => ({
  default: () => <div data-testid="tree-view">Tree View</div>,
}));

vi.mock('./features/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('App', () => {
  const renderAppAndGetElements = () => {
    renderWithProviders(<App />);

    return {
      treeContainer: screen.getByTestId(TEST_IDS.tree).closest('main'),
      sidebarContainer: screen.getByTestId(TEST_IDS.sidebar).closest('aside'),
      chessTab: screen.getByRole('button', { name: TAB_LABELS.sidebar }),
      treeTab: screen.getByRole('button', { name: TAB_LABELS.tree }),
    };
  };

  beforeEach(() => {
    useKeyboardActionsMock.mockClear();
  });

  it('renders tab controls and calls keyboard hook', () => {
    renderWithProviders(<App />);

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TAB_LABELS.sidebar })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: TAB_LABELS.tree })).toBeInTheDocument();
    expect(useKeyboardActionsMock).toHaveBeenCalledTimes(1);
  });

  it('shows tree tab by default and hides sidebar on mobile state', () => {
    const { treeContainer, sidebarContainer } = renderAppAndGetElements();

    expect(treeContainer).not.toBeNull();
    expect(sidebarContainer).not.toBeNull();
    expect(treeContainer).not.toHaveClass(HIDDEN_CLASS);
    expect(sidebarContainer).toHaveClass(HIDDEN_CLASS);
  });

  it('switches visible pane when tabs are clicked', () => {
    const { treeContainer, sidebarContainer, chessTab, treeTab } = renderAppAndGetElements();

    fireEvent.click(chessTab);

    expect(treeContainer).toHaveClass(HIDDEN_CLASS);
    expect(sidebarContainer).not.toHaveClass(HIDDEN_CLASS);

    fireEvent.click(treeTab);

    expect(treeContainer).not.toHaveClass(HIDDEN_CLASS);
    expect(sidebarContainer).toHaveClass(HIDDEN_CLASS);
  });
});