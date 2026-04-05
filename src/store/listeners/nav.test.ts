import { DEFAULT_POSITION } from 'chess.js';
import { describe, expect, it, vi } from 'vitest';

import { getFenFromPathId, getMoveFromPathId } from '@/shared/chess';
import type { Id, SourceStats, TreeStore } from '@/types';
import { setupTestStore } from '@/test/renderWithProviders';
import { createTestTreeStoreNode } from '@/test/treeFixtures';
import { nav } from '@/store/slices';

const toStats = (total: number): SourceStats => ({
  white: total,
  draws: 0,
  black: 0,
  total,
});

const toNodeStats = (total: number) => ({
  otb: toStats(total),
  online: toStats(total),
});

const moveFromId = (id: Id) => {
  const move = getMoveFromPathId(id);
  if (!move) throw new Error(`expected valid move for id: ${id}`);
  return move;
};

function createNavNodes(options?: {
  e7e5ChildrenLoaded?: boolean;
  c7c5ChildrenLoaded?: boolean;
}): TreeStore {
  const {
    e7e5ChildrenLoaded = true,
    c7c5ChildrenLoaded = true,
  } = options || {};

  return {
    '': createTestTreeStoreNode({
      id: '',
      move: null,
      childrenLoaded: true,
      edgeStats: toNodeStats(100),
      positionStats: toNodeStats(100),
      children: ['e2e4', 'd2d4'],
    }),
    e2e4: createTestTreeStoreNode({
      id: 'e2e4',
      move: moveFromId('e2e4'),
      childrenLoaded: true,
      edgeStats: toNodeStats(60),
      positionStats: toNodeStats(60),
      children: ['e2e4,e7e5', 'e2e4,c7c5'],
    }),
    d2d4: createTestTreeStoreNode({
      id: 'd2d4',
      move: moveFromId('d2d4'),
      childrenLoaded: true,
      edgeStats: toNodeStats(40),
      positionStats: toNodeStats(40),
      children: [],
    }),
    'e2e4,e7e5': createTestTreeStoreNode({
      id: 'e2e4,e7e5',
      move: moveFromId('e2e4,e7e5'),
      childrenLoaded: e7e5ChildrenLoaded,
      edgeStats: toNodeStats(35),
      positionStats: toNodeStats(35),
      children: [],
    }),
    'e2e4,c7c5': createTestTreeStoreNode({
      id: 'e2e4,c7c5',
      move: moveFromId('e2e4,c7c5'),
      childrenLoaded: c7c5ChildrenLoaded,
      edgeStats: toNodeStats(25),
      positionStats: toNodeStats(25),
      children: [],
    }),
  };
}

function createNavStore(options?: {
  currentId?: Id;
  boardFen?: string;
  lastVisitedChildByParent?: Record<Id, Id>;
  e7e5ChildrenLoaded?: boolean;
  c7c5ChildrenLoaded?: boolean;
}) {
  const {
    currentId = '',
    boardFen = DEFAULT_POSITION,
    lastVisitedChildByParent = {},
    e7e5ChildrenLoaded,
    c7c5ChildrenLoaded,
  } = options || {};

  return setupTestStore({
    ui: {
      currentId,
      boardFen,
    },
    tree: {
      nodes: createNavNodes({ e7e5ChildrenLoaded, c7c5ChildrenLoaded }),
      pinnedNodes: [],
      lastVisitedChildByParent,
    },
  });
}

async function expectNavigation(store: ReturnType<typeof createNavStore>, expectedId: Id) {
  await vi.waitFor(() => {
    expect(store.getState().ui.currentId).toBe(expectedId);
    expect(store.getState().ui.boardFen).toBe(getFenFromPathId(expectedId));
  });
}

describe('nav listener', () => {
  it('navigateToId updates board position when node exists', async () => {
    const store = createNavStore();

    store.dispatch(nav.actions.navigateToId('e2e4'));

    await expectNavigation(store, 'e2e4');
    expect(store.getState().tree.lastVisitedChildByParent['']).toBe('e2e4');
  });

  it('navigateToId is a no-op when target node does not exist', async () => {
    const store = createNavStore({
      currentId: 'e2e4',
      boardFen: getFenFromPathId('e2e4'),
    });

    store.dispatch(nav.actions.navigateToId('missing,id'));

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe('e2e4');
      expect(store.getState().ui.boardFen).toBe(getFenFromPathId('e2e4'));
    });
    expect(store.getState().tree.lastVisitedChildByParent).toEqual({});
  });

  it('navigateUp moves to parent node and updates fen', async () => {
    const store = createNavStore({
      currentId: 'e2e4,e7e5',
      boardFen: getFenFromPathId('e2e4,e7e5'),
    });

    store.dispatch(nav.actions.navigateUp());

    await expectNavigation(store, 'e2e4');
    expect(store.getState().tree.lastVisitedChildByParent['']).toBe('e2e4');
  });

  it('navigateDown prefers remembered child when available', async () => {
    const store = createNavStore({
      currentId: 'e2e4',
      boardFen: getFenFromPathId('e2e4'),
      lastVisitedChildByParent: { e2e4: 'e2e4,c7c5' },
    });

    store.dispatch(nav.actions.navigateDown());

    await expectNavigation(store, 'e2e4,c7c5');
    expect(store.getState().tree.lastVisitedChildByParent.e2e4).toBe('e2e4,c7c5');
  });

  it('navigateDown prefers explored child when no remembered child exists', async () => {
    const store = createNavStore({
      currentId: 'e2e4',
      boardFen: getFenFromPathId('e2e4'),
      e7e5ChildrenLoaded: false,
      c7c5ChildrenLoaded: true,
    });

    store.dispatch(nav.actions.navigateDown());

    await expectNavigation(store, 'e2e4,c7c5');
  });

  it('navigateNextSibling moves to adjacent sibling when it exists', async () => {
    const store = createNavStore({
      currentId: 'e2e4',
      boardFen: getFenFromPathId('e2e4'),
    });

    store.dispatch(nav.actions.navigateNextSibling());

    await expectNavigation(store, 'd2d4');
    expect(store.getState().tree.lastVisitedChildByParent['']).toBe('d2d4');
  });

  it('navigatePrevSibling is a no-op at the first sibling', async () => {
    const store = createNavStore({
      currentId: 'e2e4',
      boardFen: getFenFromPathId('e2e4'),
    });

    store.dispatch(nav.actions.navigatePrevSibling());

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe('e2e4');
      expect(store.getState().ui.boardFen).toBe(getFenFromPathId('e2e4'));
    });
  });

  it('commitMove navigates to the computed child id and tracks last visited child', async () => {
    const move = moveFromId('e2e4,c7c5');
    const store = createNavStore({
      currentId: 'e2e4',
      boardFen: getFenFromPathId('e2e4'),
    });

    store.dispatch(nav.actions.commitMove(move));

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe('e2e4,c7c5');
      expect(store.getState().ui.boardFen).toBe(move.after);
    });
    expect(store.getState().tree.lastVisitedChildByParent.e2e4).toBe('e2e4,c7c5');
  });
});
