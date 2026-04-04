import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { createTestTreeViewNode, createTestZoom, renderTreeViewWithContexts } from '@/test/treeFixtures';
import { Tree } from './Tree';
import { TreeMinimapProps, TreeOverlayProps, TreeZoomControlsProps } from './Overlays';
import type { TreeContainerProps } from './TreeContainer';

const updateSpringMock = vi.fn();
const handleZoomMock = vi.fn();
const useTreeNavigationMock = vi.fn((_: unknown) => ({
  spring: { x: 1 },
  updateSpring: updateSpringMock,
  handleZoom: handleZoomMock,
}));

const refetchMock = vi.fn();
const queryState = {
  isError: false,
  isFetching: false,
  error: null,
  refetch: refetchMock,
};

const useGetNodesQueryMock = vi.fn((_: { nodeId: string }) => queryState);
const treeContainerMock = vi.fn((_: TreeContainerProps) => <g data-testid="tree-container" />);
const treeGridMock = vi.fn(() => <g data-testid="tree-grid" />);
const svgDefsMock = vi.fn(() => <defs data-testid="svg-defs" />);
const treeErrorOverlaysMock = vi.fn((_: TreeOverlayProps) => (<div data-testid="tree-error-overlays" />));
const treeSettingsMock = vi.fn(() => <div data-testid="tree-settings" />);
const treeHelpMock = vi.fn(() => <div data-testid="tree-help" />);
const treeZoomControlsMock = vi.fn((_: TreeZoomControlsProps) => (<div data-testid="tree-zoom-controls" />));
const treeDPadMock = vi.fn(() => <div data-testid="tree-dpad" />);
const treeMinimapMock = vi.fn((_: TreeMinimapProps) => <div data-testid="tree-minimap" />);

vi.mock('@/store/openingsApi', () => ({
  openingsApi: {
    reducerPath: 'openingsApi',
    reducer: (state = {}) => state,
    middleware: () => (next: (action: unknown) => unknown) => (action: unknown) => next(action),
    endpoints: {
      getNodes: {
        matchPending: () => false,
        matchFulfilled: () => false,
        matchRejected: () => false,
      },
    },
    useGetNodesQuery: (args: { nodeId: string }) => useGetNodesQueryMock(args),
  },
}));

vi.mock('../hooks', () => ({
  useTreeNavigation: (args: unknown) => useTreeNavigationMock(args),
}));

vi.mock('./TreeContainer', () => ({
  TreeContainer: (props: TreeContainerProps) => treeContainerMock(props),
}));

vi.mock('./SVGDefs', () => ({
  SVGDefs: () => svgDefsMock(),
}));

vi.mock('./TreeGrid', () => ({
  TreeGrid: () => treeGridMock(),
}));

vi.mock('./Overlays', () => ({
  TreeErrorOverlays: (props: TreeOverlayProps) => treeErrorOverlaysMock(props),
  TreeSettings: () => treeSettingsMock(),
  TreeHelp: () => treeHelpMock(),
  TreeZoomControls: (props: TreeZoomControlsProps) => treeZoomControlsMock(props),
  TreeDPad: () => treeDPadMock(),
  TreeMinimap: (props: TreeMinimapProps) => treeMinimapMock(props),
}));

const renderTree = ({ hasTree = true, currentId = 'e2e4' }: { hasTree?: boolean; currentId?: string } = {}) => {
  const preloadedState = {
    ui: {
      currentId,
      treeSource: 'otb' as const,
      treeMinFrequencyPct: 2,
      treeMoveLimit: 8,
    },
    tree: {
      nodes: hasTree ? { '': createTestTreeViewNode({ id: '' }) } : {},
      pinnedNodes: [],
      lastVisitedChildByParent: {},
    },
  };

  const zoom = {
    ...createTestZoom(2, 5, 10),
    isDragging: false,
    toString: () => 'translate(5,10) scale(2)',
    containerRef: { current: null },
  };

  return renderTreeViewWithContexts(<Tree />, {
    zoomOverrides: zoom,
    preloadedState,
  });
};

const getTreeErrorOverlaysProps = (): TreeOverlayProps => {
  const firstCall = treeErrorOverlaysMock.mock.calls[0];
  expect(firstCall).toBeDefined();
  if (!firstCall) throw new Error('Expected TreeErrorOverlays to be called');

  return firstCall[0] as TreeOverlayProps;
};

describe('Tree', () => {
  beforeEach(() => {
    useTreeNavigationMock.mockClear();
    useGetNodesQueryMock.mockClear();
    updateSpringMock.mockClear();
    handleZoomMock.mockClear();
    refetchMock.mockClear();
    treeContainerMock.mockClear();
    treeErrorOverlaysMock.mockClear();
    treeZoomControlsMock.mockClear();
    treeMinimapMock.mockClear();
  });

  it('wires tree data, query state, and overlay props', () => {
    renderTree();

    expect(useGetNodesQueryMock).toHaveBeenCalledWith({ nodeId: 'e2e4' });
    expect(useTreeNavigationMock).toHaveBeenCalledWith(
      expect.objectContaining({ width: 900, height: 500 })
    );

    expect(treeContainerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        root: expect.objectContaining({ data: expect.objectContaining({ id: '' }) }),
      })
    );
    expect(treeErrorOverlaysMock).toHaveBeenCalledWith(
      expect.objectContaining({
        hasTree: true,
        isError: false,
        isFetching: false,
        error: null,
      })
    );
    expect(treeZoomControlsMock).toHaveBeenCalledWith(
      expect.objectContaining({ handleZoom: handleZoomMock })
    );
    expect(treeMinimapMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tree: expect.objectContaining({ data: expect.objectContaining({ id: '' }) }),
        spring: { x: 1 },
      })
    );

    expect(screen.getByTestId('svg-defs')).toBeInTheDocument();
    expect(screen.getByTestId('tree-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tree-settings')).toBeInTheDocument();
    expect(screen.getByTestId('tree-help')).toBeInTheDocument();
    expect(screen.getByTestId('tree-dpad')).toBeInTheDocument();
  });

  it('calls updateSpring handlers and retry callback', () => {
    const { container } = renderTree({ hasTree: false });

    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    if (!svg) throw new Error('Expected svg to be rendered');

    fireEvent.mouseUp(svg);
    fireEvent.touchEnd(svg);
    expect(updateSpringMock).toHaveBeenCalledTimes(2);

    const overlaysProps = getTreeErrorOverlaysProps();
    expect(overlaysProps.hasTree).toBe(false);
    overlaysProps.onRetry();
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });
});