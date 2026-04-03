import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { createTestZoom, renderTreeViewWithContexts } from '../testUtils';
import { Tree } from './Tree';

const selectCurrentIdMock = vi.fn((_: unknown) => 'e2e4');
const selectTreeMock = vi.fn((_: unknown): unknown => ({ data: { id: '' } }));
const useSelectorMock = vi.fn((selector: (state: unknown) => unknown) => selector({}));

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

const treeContainerMock = vi.fn((_: { root: unknown }) => <g data-testid="tree-container" />);
const treeGridMock = vi.fn(() => <g data-testid="tree-grid" />);
const svgDefsMock = vi.fn(() => <defs data-testid="svg-defs" />);
const treeErrorOverlaysMock = vi.fn(
  (_: { hasTree: boolean; isError: boolean; isFetching: boolean; error: unknown; onRetry: () => void }) => (
    <div data-testid="tree-error-overlays" />
  )
);
const treeSettingsMock = vi.fn(() => <div data-testid="tree-settings" />);
const treeHelpMock = vi.fn(() => <div data-testid="tree-help" />);
const treeZoomControlsMock = vi.fn((_: { handleZoom: (direction: 'in' | 'out') => void }) => (
  <div data-testid="tree-zoom-controls" />
));
const treeDPadMock = vi.fn(() => <div data-testid="tree-dpad" />);
const treeMinimapMock = vi.fn((_: { tree: unknown; spring: unknown }) => <div data-testid="tree-minimap" />);

vi.mock('react-redux', async () => {
  const actual = await vi.importActual<typeof import('react-redux')>('react-redux');
  return {
    ...actual,
    useSelector: (selector: (state: unknown) => unknown) => useSelectorMock(selector),
  };
});

vi.mock('@/store/selectors', () => ({
  selectCurrentId: (state: unknown) => selectCurrentIdMock(state),
  selectTree: (state: unknown) => selectTreeMock(state),
}));

vi.mock('@/store/openingsApi', () => ({
  openingsApi: {
    useGetNodesQuery: (args: { nodeId: string }) => useGetNodesQueryMock(args),
  },
}));

vi.mock('../hooks', () => ({
  useTreeNavigation: (args: unknown) => useTreeNavigationMock(args),
}));

vi.mock('./TreeContainer', () => ({
  TreeContainer: (props: { root: unknown }) => treeContainerMock(props),
}));

vi.mock('./SVGDefs', () => ({
  SVGDefs: () => svgDefsMock(),
}));

vi.mock('./TreeGrid', () => ({
  TreeGrid: () => treeGridMock(),
}));

vi.mock('./Overlays', () => ({
  TreeErrorOverlays: (props: {
    hasTree: boolean;
    isError: boolean;
    isFetching: boolean;
    error: unknown;
    onRetry: () => void;
  }) => treeErrorOverlaysMock(props),
  TreeSettings: () => treeSettingsMock(),
  TreeHelp: () => treeHelpMock(),
  TreeZoomControls: (props: { handleZoom: (direction: 'in' | 'out') => void }) => treeZoomControlsMock(props),
  TreeDPad: () => treeDPadMock(),
  TreeMinimap: (props: { tree: unknown; spring: unknown }) => treeMinimapMock(props),
}));

const renderTree = (treeValue: unknown = { data: { id: '' } }) => {
  selectTreeMock.mockReturnValue(treeValue);

  const zoom = {
    ...createTestZoom(2, 5, 10),
    isDragging: false,
    toString: () => 'translate(5,10) scale(2)',
    containerRef: { current: null },
  };

  return renderTreeViewWithContexts(<Tree />, {
    zoomOverrides: zoom,
  });
};

type TreeErrorOverlaysProps = {
  hasTree: boolean;
  isError: boolean;
  isFetching: boolean;
  error: unknown;
  onRetry: () => void;
};

const getTreeErrorOverlaysProps = (): TreeErrorOverlaysProps => {
  const firstCall = treeErrorOverlaysMock.mock.calls[0];
  expect(firstCall).toBeDefined();
  if (!firstCall) throw new Error('Expected TreeErrorOverlays to be called');

  return firstCall[0] as TreeErrorOverlaysProps;
};

describe('Tree', () => {
  beforeEach(() => {
    selectCurrentIdMock.mockClear();
    selectTreeMock.mockReset();
    useSelectorMock.mockClear();
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
    const treeValue = { data: { id: '' } };
    renderTree(treeValue);

    expect(useGetNodesQueryMock).toHaveBeenCalledWith({ nodeId: 'e2e4' });
    expect(useTreeNavigationMock).toHaveBeenCalledWith(
      expect.objectContaining({ width: 900, height: 500 })
    );

    expect(treeContainerMock).toHaveBeenCalledWith(expect.objectContaining({ root: treeValue }));
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
      expect.objectContaining({ tree: treeValue, spring: { x: 1 } })
    );

    expect(screen.getByTestId('svg-defs')).toBeInTheDocument();
    expect(screen.getByTestId('tree-grid')).toBeInTheDocument();
    expect(screen.getByTestId('tree-settings')).toBeInTheDocument();
    expect(screen.getByTestId('tree-help')).toBeInTheDocument();
    expect(screen.getByTestId('tree-dpad')).toBeInTheDocument();
  });

  it('calls updateSpring handlers and retry callback', () => {
    const { container } = renderTree(null);

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