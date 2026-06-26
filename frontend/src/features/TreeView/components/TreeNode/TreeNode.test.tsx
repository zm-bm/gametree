import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import {
  createTestMove,
  createTestHierarchyPointNode,
  createTestTreeStoreNode,
  renderTreeViewWithContexts,
} from '@/test/treeFixtures';
import { TreeNode } from './TreeNode';

const treeNodeButtonsMock = vi.fn((_: unknown) => <g data-testid="tree-node-buttons" />);
const treeNodeLoadingIndicatorMock = vi.fn((_: unknown) => <g data-testid="tree-node-loading" />);
const treeNodeMoveLabelMock = vi.fn((_: unknown) => <g data-testid="tree-node-move-label" />);
const treeNodeMoveFrequencyMock = vi.fn((_: unknown) => <g data-testid="tree-node-move-frequency" />);
const treeNodePinnedBadgeMock = vi.fn((_: unknown) => <g data-testid="tree-node-pinned-badge" />);
const treeNodeWinFrequencyMock = vi.fn((_: unknown) => <g data-testid="tree-node-win-frequency" />);

const handleNodeClickMock = vi.fn();
const handleNodeMouseEnterMock = vi.fn();
const handleNodeMouseLeaveMock = vi.fn();
const useTreeNodeInteractionsMock = vi.fn((_: unknown) => ({
  isNodeHovered: true,
  handleNodeClick: handleNodeClickMock,
  handleNodeMouseEnter: handleNodeMouseEnterMock,
  handleNodeMouseLeave: handleNodeMouseLeaveMock,
}));

const baseNode = createTestHierarchyPointNode({
  id: 'e2e4',
  node: {
    move: createTestMove(),
    loading: false,
  },
});

const loadingNode = createTestHierarchyPointNode({
  id: 'e2e4',
  node: {
    move: createTestMove(),
    loading: true,
  },
});

vi.mock('./index', () => ({
  TreeNodeButtons: (props: unknown) => treeNodeButtonsMock(props),
  TreeNodeLoadingIndicator: (props: unknown) => treeNodeLoadingIndicatorMock(props),
  TreeNodeMoveLabel: (props: unknown) => treeNodeMoveLabelMock(props),
  TreeNodeMoveFrequency: (props: unknown) => treeNodeMoveFrequencyMock(props),
  TreeNodePinnedBadge: (props: unknown) => treeNodePinnedBadgeMock(props),
  TreeNodeWinFrequency: (props: unknown) => treeNodeWinFrequencyMock(props),
}));

vi.mock('../../hooks/useTreeNodeInteractions', () => ({
  useTreeNodeInteractions: (args: unknown) => useTreeNodeInteractionsMock(args),
}));

const basePreloadedState = {
  ui: {
    currentId: 'e2e4',
    treeSource: 'otb' as const,
  },
  tree: {
    nodes: {
      '': createTestTreeStoreNode({ id: '', children: ['e2e4'] }),
      e2e4: createTestTreeStoreNode({
        id: 'e2e4',
        move: createTestMove(),
      }),
    },
    pinnedNodes: [] as string[],
    lastVisitedChildByParent: {},
  },
};

describe('TreeNode', () => {
  beforeEach(() => {
    treeNodeButtonsMock.mockClear();
    treeNodeLoadingIndicatorMock.mockClear();
    treeNodeMoveLabelMock.mockClear();
    treeNodeMoveFrequencyMock.mockClear();
    treeNodePinnedBadgeMock.mockClear();
    treeNodeWinFrequencyMock.mockClear();
    handleNodeClickMock.mockClear();
    handleNodeMouseEnterMock.mockClear();
    handleNodeMouseLeaveMock.mockClear();
    useTreeNodeInteractionsMock.mockClear();
  });

  it('renders full node contents and wires interaction handlers', () => {
    const { container } = renderTreeViewWithContexts(
      <svg>
        <TreeNode node={baseNode} x={10} y={20} />
      </svg>,
      {
        preloadedState: {
          ...basePreloadedState,
          tree: {
            ...basePreloadedState.tree,
            pinnedNodes: ['e2e4'],
          },
        },
      }
    );

    expect(screen.getByTestId('tree-node-buttons')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-pinned-badge')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-move-frequency')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-win-frequency')).toBeInTheDocument();
    expect(screen.getByTestId('tree-node-move-label')).toBeInTheDocument();
    expect(treeNodeLoadingIndicatorMock).not.toHaveBeenCalled();

    const nodeGroup = container.querySelector('g[data-id="e2e4"]');
    expect(nodeGroup).toBeInTheDocument();
    expect(nodeGroup).toHaveAttribute('data-fen', 'after-fen');
    expect(nodeGroup).toHaveAttribute('data-move', 'e2e4');

    const animatedGroup = container.querySelector('g');
    expect(animatedGroup).toBeInTheDocument();
    if (!animatedGroup || !nodeGroup) throw new Error('Expected groups to render');

    fireEvent.mouseEnter(animatedGroup);
    fireEvent.mouseLeave(animatedGroup);
    fireEvent.click(nodeGroup);

    expect(handleNodeMouseEnterMock).toHaveBeenCalledTimes(1);
    expect(handleNodeMouseLeaveMock).toHaveBeenCalledTimes(1);
    expect(handleNodeClickMock).toHaveBeenCalledTimes(1);
  });

  it('hides drawer/metadata in minimap mode and still shows loading indicator', () => {
    renderTreeViewWithContexts(
      <svg>
        <TreeNode node={loadingNode} x={0} y={0} minimap={true} />
      </svg>,
      { preloadedState: basePreloadedState }
    );

    expect(screen.queryByTestId('tree-node-buttons')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tree-node-move-frequency')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tree-node-win-frequency')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tree-node-move-label')).not.toBeInTheDocument();
    expect(screen.getByTestId('tree-node-loading')).toBeInTheDocument();
  });

  it('does not render drawer when showButtonDrawer is false', () => {
    renderTreeViewWithContexts(
      <svg>
        <TreeNode node={baseNode} x={0} y={0} showButtonDrawer={false} />
      </svg>,
      { preloadedState: basePreloadedState }
    );

    expect(screen.queryByTestId('tree-node-buttons')).not.toBeInTheDocument();
  });
});
