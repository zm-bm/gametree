import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import type { PositionInspectorProps } from '@/features/PositionInspector';

import TreeWorkspace from './TreeWorkspace';

const { positionInspectorMock } = vi.hoisted(() => ({
  positionInspectorMock: vi.fn(),
}));

vi.mock('@/features/TreeView', () => ({
  default: () => <div data-testid="tree-view" />,
}));

vi.mock('@/features/PositionInspector', () => ({
  default: (props: PositionInspectorProps) => {
    positionInspectorMock(props);

    return (
      <div
        data-testid="position-inspector"
        data-mode={props.mode}
        data-show-details={String(props.showDetails)}
      />
    );
  },
}));

describe('TreeWorkspace', () => {
  beforeEach(() => {
    positionInspectorMock.mockClear();
  });

  it('renders the tree view and compact board dock as separate workspace children', () => {
    renderWithProviders(<TreeWorkspace />);

    const workspace = screen.getByTestId('tree-workspace');
    const treeView = screen.getByTestId('tree-view');
    const boardDock = screen.getByTestId('board-dock');
    const positionInspector = screen.getByTestId('position-inspector');

    expect(workspace).toContainElement(treeView);
    expect(workspace).toContainElement(boardDock);
    expect(boardDock).toContainElement(positionInspector);
    expect(boardDock).not.toContainElement(treeView);
  });

  it('renders the board dock through PositionInspector compact mode without details', () => {
    renderWithProviders(<TreeWorkspace />);

    expect(positionInspectorMock).toHaveBeenCalledWith(expect.objectContaining({
      mode: 'compact',
      showDetails: false,
      boardActions: expect.anything(),
    }));
    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-mode', 'compact');
    expect(screen.getByTestId('position-inspector')).toHaveAttribute('data-show-details', 'false');
  });
});
