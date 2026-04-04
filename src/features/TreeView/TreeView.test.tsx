import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useContext } from 'react';
import { screen } from '@testing-library/react';

import { TreeDimensionsContext, ZoomContext } from './context';
import { treeZoomConfig } from './lib/zoomConfig';
import { createTestTransformMatrix, createTestZoom, renderTreeViewWithContexts } from '@/test/treeFixtures';
import TreeView from './TreeView';

const useStableParentSizeMock = vi.fn(() => ({
  parentRef: { current: null },
  width: 800,
  height: 600,
}));

const treeMock = vi.fn(() => {
  const dimensions = useContext(TreeDimensionsContext);
  const zoomContext = useContext(ZoomContext);

  return (
    <div
      data-testid="tree-mock"
      data-width={dimensions.width}
      data-height={dimensions.height}
      data-translate-x={zoomContext.zoom.transformMatrix.translateX}
      data-scale-x={zoomContext.zoom.transformMatrix.scaleX}
    />
  );
});

const zoomObject = createTestZoom(2, 0, 0);

const zoomMock = vi.fn(
  ({ children, width, height }: { children: (zoom: typeof zoomObject) => React.ReactNode; width: number; height: number }) => (
    <div data-testid="zoom" data-width={width} data-height={height}>
      {children(zoomObject)}
    </div>
  )
);

vi.mock('./hooks/useStableParentSize', () => ({
  useStableParentSize: () => useStableParentSizeMock(),
}));

vi.mock('./components/Tree', () => ({
  Tree: () => treeMock(),
}));

vi.mock('@visx/zoom', () => ({
  Zoom: (props: {
    children: (zoom: typeof zoomObject) => React.ReactNode;
    width: number;
    height: number;
  }) => zoomMock(props),
}));

describe('TreeView', () => {
  beforeEach(() => {
    useStableParentSizeMock.mockClear();
    treeMock.mockClear();
    zoomMock.mockClear();
  });

  it('wires size hook dimensions into TreeDimensionsProvider and Zoom', () => {
    renderTreeViewWithContexts(<TreeView />, {
      dimensions: { width: 123, height: 456 },
      zoomOverrides: {
        transformMatrix: createTestTransformMatrix(9, 99, 101),
      },
    });

    expect(useStableParentSizeMock).toHaveBeenCalledTimes(1);
    expect(zoomMock).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 800,
        height: 600,
        scaleXMin: treeZoomConfig.scaleXMin,
        scaleYMin: treeZoomConfig.scaleYMin,
        scaleXMax: treeZoomConfig.scaleXMax,
        scaleYMax: treeZoomConfig.scaleYMax,
      })
    );

    // TreeView should provide its own dimensions/zoom values, overriding outer test providers.
    const tree = screen.getByTestId('tree-mock');
    expect(tree).toHaveAttribute('data-width', '800');
    expect(tree).toHaveAttribute('data-height', '600');
    expect(tree).toHaveAttribute('data-scale-x', '2');
    expect(tree).toHaveAttribute('data-translate-x', '0');
  });

  it('renders Tree through the Zoom render path', () => {
    renderTreeViewWithContexts(<TreeView />);

    expect(screen.getByTestId('zoom')).toBeInTheDocument();
    expect(screen.getByTestId('tree-mock')).toBeInTheDocument();
    expect(treeMock).toHaveBeenCalledTimes(1);
  });
});