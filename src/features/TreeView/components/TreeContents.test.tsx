import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HierarchyPointNode } from 'd3-hierarchy';

import { TreeViewNode } from '@/shared/types';

import { createTestHierarchyPointNode, renderTreeViewWithContexts } from '../testUtils';
import { TreeContents } from './TreeContents';

const treeLinkMock = vi.fn((_: unknown) => <path data-testid="tree-link" />);
const treeNodeMock = vi.fn((_: unknown) => <g data-testid="tree-node" />);
const useAnimatedTreeLayoutMock = vi.fn((_: unknown[]) => ({
  ax: (id: string) => id.length * 10,
  ay: (id: string) => id.length * 100,
}));

vi.mock('./TreeLink', () => ({
  TreeLink: (props: unknown) => treeLinkMock(props),
}));

vi.mock('./TreeNode', () => ({
  TreeNode: (props: unknown) => treeNodeMock(props),
}));

vi.mock('../hooks', () => ({
  useAnimatedTreeLayout: (nodes: unknown[]) => useAnimatedTreeLayoutMock(nodes),
}));

const rootNode = createTestHierarchyPointNode('', 11, 22);
const childNode = createTestHierarchyPointNode('e2e4', 33, 44);

const tree = {
  links: () => [{ source: rootNode, target: childNode }],
  descendants: () => [rootNode, childNode],
} as unknown as HierarchyPointNode<TreeViewNode>;

describe('TreeContents', () => {
  beforeEach(() => {
    treeLinkMock.mockClear();
    treeNodeMock.mockClear();
    useAnimatedTreeLayoutMock.mockClear();
  });

  it('renders links/nodes with animated coordinates by default', () => {
    renderTreeViewWithContexts(<svg><TreeContents tree={tree} /></svg>);

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
    renderTreeViewWithContexts(<svg><TreeContents tree={tree} minimap={true} /></svg>);

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
});