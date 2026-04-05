import { describe, expect, it, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { HierarchyNode } from '@visx/hierarchy/lib/types';

import { TreeViewNode } from '@/types';
import { renderTreeViewWithContexts } from '@/test/treeFixtures';
import { treeSeparation } from '../lib/treeSeparation';
import { TreeContainer } from './TreeContainer';
import type { TreeContentsProps } from './TreeContents';

const visxTreeMock = vi.fn(
  ({ children }: { children: (tree: unknown) => React.ReactNode }) => (
    <div data-testid="visx-tree">{children({ id: 'rendered-tree' })}</div>
  )
);

const treeContentsMock = vi.fn((_: TreeContentsProps) => <div data-testid="tree-contents" />);

vi.mock('@visx/hierarchy', () => ({
  Tree: (props: {
    root: unknown;
    nodeSize: [number, number];
    separation: unknown;
    children: (tree: unknown) => React.ReactNode;
  }) => visxTreeMock(props),
}));

vi.mock('./TreeContents', () => ({
  TreeContents: (props: TreeContentsProps) => treeContentsMock(props),
}));

describe('TreeContainer', () => {
  beforeEach(() => {
    visxTreeMock.mockClear();
    treeContentsMock.mockClear();
  });

  it('returns null when root is missing', () => {
    const { container } = renderTreeViewWithContexts(<TreeContainer root={null} />);

    expect(container.firstChild).toBeNull();
    expect(visxTreeMock).not.toHaveBeenCalled();
  });

  it('renders visx Tree and passes spacing/separation props', () => {
    const root = { data: { id: '' } } as HierarchyNode<TreeViewNode>;

    renderTreeViewWithContexts(<TreeContainer root={root} />);

    expect(screen.getByTestId('visx-tree')).toBeInTheDocument();
    expect(visxTreeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        root,
        nodeSize: [40, 120],
        separation: treeSeparation,
      })
    );
    expect(treeContentsMock).toHaveBeenCalledWith(
      expect.objectContaining({ tree: { id: 'rendered-tree' } })
    );
  });
});