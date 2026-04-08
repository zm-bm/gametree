import { beforeEach, describe, expect, it, vi } from 'vitest';

const { treeBuildMock } = vi.hoisted(() => ({
  treeBuildMock: vi.fn(),
}));

vi.mock('../shared/tree', () => ({
  treeBuild: treeBuildMock,
}));

import {
  selectCurrentNode,
  selectCurrentVisibleId,
  selectHoverMove,
  selectSideToMove,
  selectTree,
  selectTreeNodes,
  selectTreeRoot,
} from './selectors';
import { setupTestStore, TestPreloadedState } from '@/test/renderWithProviders';
import { createTestTreeViewNode } from '@/test/treeFixtures';

function makeState(overrides: TestPreloadedState = {}) {
  return setupTestStore({
    ui: {
      currentId: 'a',
      boardFen: '8/8/8/8/8/8/8/8 w - - 0 1',
      treeSource: 'otb',
      treeMinFrequencyPct: 2,
      treeMoveLimit: 8,
      ...overrides.ui,
    },
    ...overrides,
  }).getState();
}

describe('store selectors', () => {
  beforeEach(() => {
    treeBuildMock.mockReset();
  });

  it('selectTreeRoot returns treeBuild output', () => {
    const root = createTestTreeViewNode({ id: '' });

    treeBuildMock.mockReturnValue(root);

    const state = makeState({
      ui: {
        currentId: 'a,b',
      },
    });

    expect(selectTreeRoot(state)).toBe(root);
    expect(treeBuildMock).toHaveBeenCalledTimes(1);
  });

  it('returns null tree/treeNodes when root is null', () => {
    treeBuildMock.mockReturnValue(null);
    const state = makeState();

    expect(selectTreeRoot(state)).toBeNull();
    expect(selectTree(state)).toBeNull();
    expect(selectTreeNodes(state)).toBeNull();
  });

  it('selectCurrentNode resolves exact, ancestor, and root fallback', () => {
    const root = { data: createTestTreeViewNode({ id: '' }) } as never;
    const a = { data: createTestTreeViewNode({ id: 'a' }) } as never;
    const ab = { data: createTestTreeViewNode({ id: 'a,b' }) } as never;

    expect(selectCurrentNode.resultFunc([root, a, ab], 'a,b')).toBe(ab);
    expect(selectCurrentNode.resultFunc([root, a], 'a,b,c')).toBe(a);
    expect(selectCurrentNode.resultFunc([root], 'x,y')).toBe(root);
    expect(selectCurrentNode.resultFunc(null, 'x')).toBeNull();
  });

  it('selectCurrentVisibleId prefers resolved node id and falls back to current id', () => {
    expect(selectCurrentVisibleId.resultFunc({ data: { id: 'a' } } as never, 'x')).toBe('a');
    expect(selectCurrentVisibleId.resultFunc(null, 'x')).toBe('x');
  });

  it('selectSideToMove maps fen turn marker to white/black', () => {
    expect(selectSideToMove.resultFunc('8/8/8/8/8/8/8/8 w - - 0 1')).toBe('white');
    expect(selectSideToMove.resultFunc('8/8/8/8/8/8/8/8 b - - 0 1')).toBe('black');
  });

  it('selectHoverMove falls back to move parsing when hovered id is not in tree nodes', () => {
    const state = makeState({
      ui: {
        hoverId: 'e2e4,e7e5,g1f3',
      },
      tree: {
        nodes: {},
      },
    });

    const move = selectHoverMove(state);
    expect(move).toMatchObject({
      from: 'g1',
      to: 'f3',
      lan: 'g1f3',
    });
  });
});
