import { TransformMatrix } from '@visx/zoom/lib/types';
import type { HierarchyPointNode } from '@visx/hierarchy/lib/types';
import type { ReactElement } from 'react';

import { Move, TreeStoreNode, TreeViewNode, TreeZoom } from '@/types';
import { renderWithProviders } from '@/test/renderWithProviders';
import type { RenderOptionsWithStore } from '@/test/renderWithProviders';
import { TreeDimensionsContext, ZoomContext } from '@/features/TreeView/context';

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

export function createTestTreeStoreNode(overrides: Partial<TreeStoreNode> = {}): TreeStoreNode {
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
    children: [],
    ...overrides,
  };
}

export function createTestMove(overrides: Partial<Move> = {}): Move {
  return {
    color: 'w',
    from: 'e2',
    to: 'e4',
    piece: 'p',
    san: 'e4',
    lan: 'e2e4',
    before: 'before-fen',
    after: 'after-fen',
    ...overrides,
  };
}

type TestHierarchyPointNodeOptions = {
  id?: string;
  x?: number;
  y?: number;
  children?: Array<{ data: TreeViewNode; x: number; y: number }>;
  node?: Partial<TreeViewNode>;
  parent?: Partial<TreeViewNode>;
};

export function createTestHierarchyPointNode(
  options: TestHierarchyPointNodeOptions = {}
): HierarchyPointNode<TreeViewNode> {
  const {
    id = '',
    x = 0,
    y = 0,
    children = [],
    node: nodeOverrides = {},
    parent,
  } = options;

  const node = {
    data: createTestTreeViewNode({
      id,
      ...nodeOverrides,
    }),
    x,
    y,
    children,
  } as HierarchyPointNode<TreeViewNode>;

  if (parent) {
    node.parent = {
      data: createTestTreeViewNode({ id: '', ...parent }),
    } as HierarchyPointNode<TreeViewNode>;
  }

  return node;
}

const defaultZoom = {
  ...createTestZoom(2, 0, 0),
  toString: () => '',
  containerRef: { current: null },
} as unknown as TreeZoom;

type TreeViewRenderOptions = RenderOptionsWithStore & {
  dimensions?: Partial<TreeDimensionsValue>;
  zoomOverrides?: Partial<TreeZoom>;
};

export function renderTreeViewWithContexts(
  ui: ReactElement,
  options: TreeViewRenderOptions = {}
) {
  const {
    dimensions: dimensionsOverrides,
    zoomOverrides,
    ...renderOptions
  } = options;
  const dimensions = { ...defaultDimensions, ...(dimensionsOverrides || {}) };
  const zoom = { ...defaultZoom, ...(zoomOverrides || {}) } as TreeZoom;

  return renderWithProviders(
    <TreeDimensionsContext.Provider value={dimensions}>
      <ZoomContext.Provider value={{ zoom, transformRef: { current: createTestTransformMatrix() } }}>
        {ui}
      </ZoomContext.Provider>
    </TreeDimensionsContext.Provider>,
    renderOptions
  );
}
