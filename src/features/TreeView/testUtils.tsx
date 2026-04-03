import { render } from '@testing-library/react';
import { TransformMatrix } from '@visx/zoom/lib/types';
import type { ReactElement } from 'react';

import { TreeViewNode, TreeZoom } from '@/shared/types';

import { TreeDimensionsContext, ZoomContext } from './context';

type TreeDimensionsValue = React.ContextType<typeof TreeDimensionsContext>;

const defaultDimensions: TreeDimensionsValue = {
  width: 900,
  height: 500,
  nodeRadius: 12,
  nodeRectSize: 24,
  treeRowSpacing: 40,
  treeColumnSpacing: 120,
  treeNodeSpacing: [40, 120],
  fontSize: 10,
};

export function createTestTransformMatrix(scale = 2, translateX = 0, translateY = 0): TransformMatrix {
  return {
    translateX,
    translateY,
    scaleX: scale,
    scaleY: scale,
    skewX: 0,
    skewY: 0,
  };
}

export function createTestZoom(scale = 2, translateX = 0, translateY = 0): TreeZoom {
  const transformMatrix = createTestTransformMatrix(scale, translateX, translateY);
  return {
    transformMatrix,
    initialTransformMatrix: transformMatrix,
    isDragging: false,
  } as unknown as TreeZoom;
}

export function createTestTreeViewNode(overrides: Partial<TreeViewNode> = {}): TreeViewNode {
  return {
    id: '',
    childrenLoaded: true,
    loading: false,
    move: null,
    edgeStats: {
      otb: { white: 0, draws: 0, black: 0, total: 0 },
      online: { white: 0, draws: 0, black: 0, total: 0 },
    },
    positionStats: {
      otb: { white: 0, draws: 0, black: 0, total: 0 },
      online: { white: 0, draws: 0, black: 0, total: 0 },
    },
    white: 0,
    draws: 0,
    black: 0,
    total: 0,
    children: [],
    childCount: 0,
    ...overrides,
  };
}

export function createTestHierarchyPointNode(
  id: string,
  x: number,
  y: number,
  children: Array<{ data: TreeViewNode; x: number; y: number }> = [],
) {
  return {
    data: createTestTreeViewNode({ id }),
    x,
    y,
    children,
  };
}

const defaultZoom = {
  ...createTestZoom(2, 0, 0),
  toString: () => '',
  containerRef: { current: null },
} as unknown as TreeZoom;

type RenderTreeViewOptions = {
  dimensions?: Partial<TreeDimensionsValue>;
  zoomOverrides?: Partial<TreeZoom>;
};

export function renderTreeViewWithContexts(
  ui: ReactElement,
  options: RenderTreeViewOptions = {}
) {
  const dimensions = { ...defaultDimensions, ...(options.dimensions || {}) };
  const zoom = { ...defaultZoom, ...(options.zoomOverrides || {}) } as TreeZoom;

  return render(
    <TreeDimensionsContext.Provider value={dimensions}>
      <ZoomContext.Provider value={{ zoom, transformRef: { current: createTestTransformMatrix() } }}>
        {ui}
      </ZoomContext.Provider>
    </TreeDimensionsContext.Provider>
  );
}