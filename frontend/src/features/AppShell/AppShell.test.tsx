import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import AppShell from './AppShell';

const TEST_IDS = {
  sidebar: 'sidebar',
  tree: 'tree-workspace',
} as const;

vi.mock('@/features/TreeWorkspace', () => ({
  default: () => <div data-testid="tree-workspace">Tree Workspace</div>,
}));

vi.mock('@/features/Sidebar', () => ({
  default: () => <div data-testid="sidebar">Sidebar</div>,
}));

describe('AppShell', () => {
  const renderAppShellAndGetElements = () => {
    renderWithProviders(<AppShell />);

    return {
      treeContainer: screen.getByTestId(TEST_IDS.tree).closest('main'),
      sidebarContainer: screen.getByTestId(TEST_IDS.sidebar).closest('aside'),
    };
  };

  it('renders the shell regions without mobile tab controls', () => {
    const { treeContainer, sidebarContainer } = renderAppShellAndGetElements();

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Chess' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Move Tree' })).not.toBeInTheDocument();
    expect(treeContainer).not.toBeNull();
    expect(sidebarContainer).not.toBeNull();
  });

  it('keeps the tree workspace visible by default', () => {
    const { treeContainer, sidebarContainer } = renderAppShellAndGetElements();

    expect(treeContainer).not.toHaveClass('hidden');
    expect(sidebarContainer).toHaveClass('hidden');
    expect(sidebarContainer).toHaveClass('sm:block');
  });
});
