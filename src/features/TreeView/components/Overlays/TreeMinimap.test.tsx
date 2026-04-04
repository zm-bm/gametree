import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import type { TransformMatrix } from '@visx/zoom/lib/types';
import type { SpringRef } from 'react-spring';
import type { HierarchyNode } from '@visx/hierarchy/lib/types';

import type { TreeViewNode } from '@/shared/types';

import { renderTreeViewWithContexts } from '@/test/treeFixtures';
import { treeSeparation } from '../../lib/treeSeparation';
import { TreeMinimap } from './TreeMinimap';
import type { TreeContentsProps } from '../TreeContents';

const centerViewportMock = vi.fn();
const useTreeMinimapMock = vi.fn((_: unknown) => ({
  transform: { matrix: 'matrix(1 0 0 1 0 0)' },
  viewport: { x: 10, y: 20, width: 30, height: 40 },
  centerViewport: centerViewportMock,
}));

const visxTreeMock = vi.fn(
  ({ children }: { children: (tree: unknown) => React.ReactNode }) => (
    <g data-testid="visx-minimap-tree">{children({ id: 'mini-tree' })}</g>
  )
);

const treeContentsMock = vi.fn((_: TreeContentsProps) => <g data-testid="tree-contents" />);

vi.mock('../../hooks', () => ({
  useTreeMinimap: (args: unknown) => useTreeMinimapMock(args),
}));

vi.mock('@visx/hierarchy', () => ({
  Tree: (props: {
    root: unknown;
    nodeSize: [number, number];
    separation: unknown;
    children: (tree: unknown) => React.ReactNode;
  }) => visxTreeMock(props),
}));

vi.mock('@visx/group', () => ({
  Group: ({ children, transform }: { children: React.ReactNode; transform?: string }) => (
    <g data-testid="group" transform={transform}>{children}</g>
  ),
}));

vi.mock('../SVGDefs', () => ({
  SVGDefs: () => <defs data-testid="svg-defs" />,
}));

vi.mock('../TreeContents', () => ({
  TreeContents: (props: TreeContentsProps) => treeContentsMock(props),
}));

const mockSpring = { set: vi.fn() } as unknown as SpringRef<TransformMatrix>;

const tree = {
  descendants: () => [],
} as unknown as HierarchyNode<TreeViewNode>;

describe('TreeMinimap', () => {
  beforeEach(() => {
    localStorage.removeItem('gtMinimapCollapsed');
    centerViewportMock.mockClear();
    useTreeMinimapMock.mockClear();
    visxTreeMock.mockClear();
    treeContentsMock.mockClear();
  });

  it('starts collapsed by default and persists toggle state', () => {
    const { container } = renderTreeViewWithContexts(<TreeMinimap tree={tree} spring={mockSpring} />);

    const toggle = screen.getByRole('button', { name: 'open minimap' });
    const shell = toggle.parentElement;
    expect(shell).toHaveStyle({ width: '40px', height: '18px' });

    fireEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'collapse minimap' })).toBeInTheDocument();
    expect(localStorage.getItem('gtMinimapCollapsed')).toBe('0');
    expect(container.firstChild).toHaveStyle({ width: '125px', height: '125px' });
  });

  it('renders minimap tree contents and viewport when expanded', () => {
    localStorage.setItem('gtMinimapCollapsed', '0');

    renderTreeViewWithContexts(<TreeMinimap tree={tree} spring={mockSpring} />);

    expect(screen.getByTestId('svg-defs')).toBeInTheDocument();
    expect(visxTreeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        root: tree,
        nodeSize: [40, 120],
        separation: treeSeparation,
      })
    );
    expect(treeContentsMock).toHaveBeenCalledWith(
      expect.objectContaining({ tree: { id: 'mini-tree' }, minimap: true })
    );

    const viewport = document.querySelector('rect');
    expect(viewport).toBeInTheDocument();
    expect(viewport).toHaveAttribute('x', '10');
    expect(viewport).toHaveAttribute('y', '20');
  });

  it('forwards pointer interactions to drag and viewport handlers', () => {
    localStorage.setItem('gtMinimapCollapsed', '0');
    const dragStart = vi.fn();
    const dragEnd = vi.fn();

    const { container } = renderTreeViewWithContexts(<TreeMinimap tree={tree} spring={mockSpring} />, {
      zoomOverrides: { isDragging: true, dragStart, dragEnd },
    });

    const svg = container.querySelector('svg.treeview-card');
    expect(svg).toBeInTheDocument();
    if (!svg) throw new Error('Expected minimap svg to render');

    fireEvent.mouseDown(svg, { clientX: 20, clientY: 30 });
    fireEvent.mouseMove(svg, { clientX: 21, clientY: 31 });
    fireEvent.mouseUp(svg);

    expect(dragStart).toHaveBeenCalledTimes(1);
    expect(centerViewportMock).toHaveBeenCalledTimes(2);
    expect(dragEnd).toHaveBeenCalledTimes(1);
  });
});
