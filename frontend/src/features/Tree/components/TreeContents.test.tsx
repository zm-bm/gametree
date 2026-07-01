import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HierarchyPointNode } from 'd3-hierarchy';

import { TreeViewNode } from '@/types';

import { createTestHierarchyPointNode, renderTreeViewWithContexts } from '@/test/treeFixtures';
import { TreeContents } from './TreeContents';
import type { TreeLinkProps } from './TreeLink';
import type { TreeNodeProps } from './TreeNode';

const treeLinkMock = vi.fn((_: TreeLinkProps) => <path data-testid="tree-link" />);
const treeNodeMock = vi.fn((_: TreeNodeProps) => <g data-testid="tree-node" />);
const useAnimatedTreeLayoutMock = vi.fn((_: unknown[]) => ({
  ax: (id: string) => id.length * 10,
  ay: (id: string) => id.length * 100,
}));

vi.mock('./TreeLink', () => ({
  TreeLink: (props: TreeLinkProps) => treeLinkMock(props),
}));

vi.mock('./TreeNode', () => ({
  TreeNode: (props: TreeNodeProps) => treeNodeMock(props),
}));

vi.mock('../hooks', () => ({
  useAnimatedTreeLayout: (nodes: unknown[]) => useAnimatedTreeLayoutMock(nodes),
}));

const rootNode = createTestHierarchyPointNode({ id: '', x: 11, y: 22 });
const childNode = createTestHierarchyPointNode({ id: 'e2e4', x: 33, y: 44 });

const tree = {
  links: () => [{ source: rootNode, target: childNode }],
  descendants: () => [rootNode, childNode],
} as unknown as HierarchyPointNode<TreeViewNode>;

describe('TreeContents', () => {
  beforeEach(() => {
    rootNode.x = 11;
    rootNode.y = 22;
    childNode.x = 33;
    childNode.y = 44;
    treeLinkMock.mockClear();
    treeNodeMock.mockClear();
    useAnimatedTreeLayoutMock.mockClear();
  });

  it('renders links/nodes with animated coordinates by default', () => {
    renderTreeViewWithContexts(<svg><TreeContents tree={tree} layoutKey="40|120" /></svg>);

    expect(useAnimatedTreeLayoutMock).toHaveBeenCalledWith([rootNode, childNode]);
    expect(treeLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        link: { source: rootNode, target: childNode },
        sourceX: 0,
        sourceY: 0,
        targetX: 40,
        targetY: 400,
        minimap: false,
      })
    );
    expect(treeNodeMock).toHaveBeenCalledTimes(2);
    expect(treeNodeMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        node: childNode,
        x: 40,
        y: 400,
        minimap: false,
      })
    );
  });

  it('uses raw node coordinates in minimap mode', () => {
    renderTreeViewWithContexts(<svg><TreeContents tree={tree} layoutKey="40|120" minimap={true} /></svg>);

    expect(treeLinkMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sourceX: rootNode.x,
        sourceY: rootNode.y,
        targetX: childNode.x,
        targetY: childNode.y,
        minimap: true,
      })
    );
    expect(treeNodeMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        node: rootNode,
        x: rootNode.x,
        y: rootNode.y,
        minimap: true,
      })
    );
  });

  it('refreshes layout nodes when the same tree object receives a new layout key', () => {
    const descendantsMock = vi.fn(() => [rootNode, childNode]);
    const linksMock = vi.fn(() => [{ source: rootNode, target: childNode }]);
    const stableTree = {
      links: linksMock,
      descendants: descendantsMock,
    } as unknown as HierarchyPointNode<TreeViewNode>;

    const { rerender } = render(
      <svg><TreeContents tree={stableTree} layoutKey="40|120" /></svg>,
    );

    childNode.x = 99;
    childNode.y = 199;

    rerender(
      <svg><TreeContents tree={stableTree} layoutKey="60|180" /></svg>,
    );

    expect(descendantsMock).toHaveBeenCalledTimes(2);
    expect(linksMock).toHaveBeenCalledTimes(2);
    expect(useAnimatedTreeLayoutMock).toHaveBeenLastCalledWith([
      expect.objectContaining({ data: expect.objectContaining({ id: '' }), x: 11, y: 22 }),
      expect.objectContaining({ data: expect.objectContaining({ id: 'e2e4' }), x: 99, y: 199 }),
    ]);
  });

  it('does not recompute layout arrays for the same tree object and layout key', () => {
    const descendantsMock = vi.fn(() => [rootNode, childNode]);
    const linksMock = vi.fn(() => [{ source: rootNode, target: childNode }]);
    const stableTree = {
      links: linksMock,
      descendants: descendantsMock,
    } as unknown as HierarchyPointNode<TreeViewNode>;

    const { rerender } = render(
      <svg><TreeContents tree={stableTree} layoutKey="40|120" /></svg>,
    );

    rerender(
      <svg><TreeContents tree={stableTree} layoutKey="40|120" /></svg>,
    );

    expect(descendantsMock).toHaveBeenCalledTimes(1);
    expect(linksMock).toHaveBeenCalledTimes(1);
    expect(useAnimatedTreeLayoutMock).toHaveBeenCalledTimes(1);
  });
});
