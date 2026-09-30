import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';

import type { TreeStore } from '@/types';
import { createTestTreeStoreNode, createTestZoom, renderTreeViewWithContexts } from '@/test/treeFixtures';
import { TreeScene } from './TreeScene';
import { TreeMinimapProps, TreeOverlayProps, TreeZoomControlsProps } from './Overlays';
import type { TreeContainerProps } from './TreeContainer';

const updateSpringMock = vi.fn();
const handleZoomMock = vi.fn();
const centerCurrentMock = vi.fn();
const useTreeNavigationMock = vi.fn((_: unknown) => ({
  spring: { x: 1 },
  updateSpring: updateSpringMock,
  handleZoom: handleZoomMock,
  centerCurrent: centerCurrentMock,
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

const renderTree = ({
  currentId = 'e2e4',
  nodes = { '': createTestTreeStoreNode({ id: '' }) },
}: {
  currentId?: string;
  nodes?: TreeStore;
} = {}) => {
  const preloadedState = {
    ui: {
      currentId,
      treeSource: 'otb' as const,
      treeMinFrequencyPct: 2,
      treeMoveLimit: 8,
    },
    tree: {
      nodes,
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

  return renderTreeViewWithContexts(<TreeScene />, {
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

const makeRect = (left: number, top: number, right: number, bottom: number) => ({
  bottom,
  height: bottom - top,
  left,
  right,
  top,
  width: right - left,
  x: left,
  y: top,
  toJSON: () => ({}),
} as DOMRect);

describe('TreeScene', () => {
  beforeEach(() => {
    useTreeNavigationMock.mockClear();
    useGetNodesQueryMock.mockClear();
    updateSpringMock.mockClear();
    handleZoomMock.mockClear();
    centerCurrentMock.mockClear();
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
      expect.objectContaining({ width: 900, height: 500, safeAreaRects: [] })
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
      expect.objectContaining({
        handleZoom: handleZoomMock,
        onCenterCurrent: centerCurrentMock,
      })
    );
    expect(treeMinimapMock).toHaveBeenCalledWith(
      expect.objectContaining({
        tree: expect.objectContaining({ data: expect.objectContaining({ id: '' }) }),
        spring: { x: 1 },
      })
    );

    expect(screen.getByTestId('svg-defs')).toBeInTheDocument();
    expect(screen.getByTestId('tree-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tree-help')).toBeInTheDocument();

    const bottomLeftControls = screen.getByTestId('tree-bottom-left-controls');
    expect(within(bottomLeftControls).getByTestId('tree-dpad')).toBeInTheDocument();
    expect(within(bottomLeftControls).getByTestId('tree-settings')).toBeInTheDocument();

    const bottomRightControls = screen.getByTestId('tree-bottom-right-controls');
    expect(within(bottomRightControls).getByTestId('tree-zoom-controls')).toBeInTheDocument();
    expect(within(bottomRightControls).getByTestId('tree-minimap')).toBeInTheDocument();
  });

  it('passes measured persistent safe-area rectangles into tree navigation', () => {
    const boardHud = document.createElement('section');
    boardHud.setAttribute('data-tree-safe-area', 'board-hud');
    document.body.appendChild(boardHud);
    const requestAnimationFrameSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        callback(0);
        return 1;
      });
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => undefined);
    const getBoundingClientRectSpy = vi
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockImplementation(function getBoundingClientRect(this: HTMLElement) {
        const testId = this.getAttribute('data-testid');

        if (this.classList.contains('relative') && this.classList.contains('h-full')) {
          return makeRect(0, 0, 900, 500);
        }

        if (this.getAttribute('data-tree-safe-area') === 'board-hud') {
          return makeRect(8, 8, 188, 252);
        }

        if (this.querySelector('[data-testid="tree-help"]')) {
          return makeRect(836, 8, 892, 42);
        }

        if (testId === 'tree-bottom-left-controls') {
          return makeRect(8, 430, 260, 492);
        }

        if (testId === 'tree-bottom-right-controls') {
          return makeRect(680, 360, 900, 500);
        }

        return makeRect(0, 0, 0, 0);
      });

    renderTree();

    const lastCall = useTreeNavigationMock.mock.calls.at(-1);
    expect(lastCall).toBeDefined();
    expect(lastCall?.[0]).toEqual(
      expect.objectContaining({
        safeAreaRects: [
          { id: 'board-hud', left: 8, top: 8, right: 188, bottom: 252, edges: ['left'] },
          { id: 'help', left: 836, top: 8, right: 892, bottom: 42, edges: ['top', 'right'] },
          { id: 'bottom-left-controls', left: 8, top: 430, right: 260, bottom: 492, edges: ['bottom'] },
          {
            id: 'bottom-right-controls',
            left: 680,
            top: 360,
            right: 900,
            bottom: 500,
            edges: ['bottom', 'right'],
          },
        ],
      }),
    );

    getBoundingClientRectSpy.mockRestore();
    requestAnimationFrameSpy.mockRestore();
    cancelAnimationFrameSpy.mockRestore();
    boardHud.remove();
  });

  it('calls updateSpring handlers and retry callback', () => {
    const { container } = renderTree({ nodes: {} });

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
