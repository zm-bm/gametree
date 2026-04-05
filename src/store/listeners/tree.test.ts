import { DEFAULT_POSITION } from 'chess.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/shared/tree/skeletonGate', () => ({
  createSkeletonGateRegistry: () => ({
    ensure: () => ({
      start: (show: () => void) => show(),
      resolve: (remove?: () => void) => {
        remove?.();
        return Promise.resolve();
      },
      cancel: () => {},
      state: () => 'idle',
    }),
    get: () => ({
      start: (show: () => void) => show(),
      resolve: (remove?: () => void) => {
        remove?.();
        return Promise.resolve();
      },
      cancel: () => {},
      state: () => 'idle',
    }),
    clearAll: () => {},
  }),
}));

import type { OpeningTotals, TreeStore } from '@/types';
import { getFenFromPathId, getMoveFromPathId } from '@/shared/chess';
import { setupTestStore } from '@/test/renderWithProviders';
import { createTestTreeStoreNode } from '@/test/treeFixtures';
import { openingsApi } from '@/store/openingsApi';
import { ui } from '@/store/slices';

const asResponse = (payload: unknown, status = 200): Response =>
  new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const openingTotals: OpeningTotals = {
  play: [],
  otb: { white: 10, draws: 4, black: 6, total: 20 },
  online: { white: 7, draws: 3, black: 5, total: 15 },
  moves: [
    {
      uci: 'e2e4',
      otb: { white: 6, draws: 2, black: 2, total: 10 },
      online: { white: 3, draws: 2, black: 2, total: 7 },
      total: 17,
    },
  ],
};

const moveFromId = (id: string) => {
  const move = getMoveFromPathId(id);
  if (!move) throw new Error(`expected valid move for id: ${id}`);
  return move;
};

function createConnectedTreeNodes(): TreeStore {
  return {
    '': createTestTreeStoreNode({ id: '', children: ['e2e4'], move: null }),
    e2e4: createTestTreeStoreNode({
      id: 'e2e4',
      move: moveFromId('e2e4'),
      children: ['e2e4,e7e5'],
    }),
    'e2e4,e7e5': createTestTreeStoreNode({
      id: 'e2e4,e7e5',
      move: moveFromId('e2e4,e7e5'),
      children: [],
    }),
  };
}

function createStore(options?: {
  currentId?: string;
  boardFen?: string;
  nodes?: TreeStore;
}) {
  const {
    currentId = '',
    boardFen = getFenFromPathId(currentId),
    nodes = {
      '': createTestTreeStoreNode({ id: '', children: [], loading: false }),
    },
  } = options || {};

  return setupTestStore({
    ui: { currentId, boardFen },
    tree: {
      nodes,
      pinnedNodes: [],
      lastVisitedChildByParent: {},
    },
  });
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tree listeners', () => {
  it('sets node loading true while getNodes request is pending for an unloaded node', async () => {
    let resolveFetch: ((value: Response) => void) | undefined;
    const fetchPromise = new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    });
    vi.spyOn(globalThis, 'fetch').mockReturnValue(fetchPromise as unknown as Promise<Response>);

    const store = createStore();
    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: '' }));

    await vi.waitFor(() => {
      expect(store.getState().tree.nodes[''].loading).toBe(true);
    });

    resolveFetch?.(asResponse(openingTotals));
    await request.unwrap();
    request.unsubscribe();
  });

  it('clears loading and adds nodes when getNodes request succeeds', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse(openingTotals));

    const store = createStore();
    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: '' }));

    await expect(request.unwrap()).resolves.toEqual(openingTotals);
    request.unsubscribe();

    await vi.waitFor(() => {
      const root = store.getState().tree.nodes[''];
      expect(root.loading).toBe(false);
      expect(root.children).toContain('e2e4');
      expect(store.getState().tree.nodes.e2e4).toBeDefined();
    });
  });

  it('skips pending/fulfilled loading work when node is already loaded', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse(openingTotals));

    const store = createStore({
      nodes: {
        ...createConnectedTreeNodes(),
        e2e4: createTestTreeStoreNode({
          id: 'e2e4',
          move: moveFromId('e2e4'),
          children: ['e2e4,e7e5'],
          loading: false,
        }),
      },
    });

    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: 'e2e4' }));
    await request.unwrap();
    request.unsubscribe();

    const node = store.getState().tree.nodes.e2e4;
    expect(node.loading).toBe(false);
    expect(node.children).toEqual(['e2e4,e7e5']);
  });

  it('clears loading when getNodes request is rejected with value', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse({ message: 'server error' }, 500));

    const store = createStore({
      nodes: {
        '': createTestTreeStoreNode({ id: '', children: [], loading: false }),
      },
    });

    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: '' }));
    await expect(request.unwrap()).rejects.toBeDefined();
    request.unsubscribe();

    await vi.waitFor(() => {
      expect(store.getState().tree.nodes[''].loading).toBe(false);
    });
  });

  it('clamps current id to current visible node after tree-shape actions', async () => {
    const orphanId = 'e2e4,e7e5';
    const store = createStore({
      currentId: orphanId,
      boardFen: getFenFromPathId(orphanId),
      nodes: {
        '': createTestTreeStoreNode({ id: '', children: ['e2e4'], move: null }),
        e2e4: createTestTreeStoreNode({ id: 'e2e4', move: moveFromId('e2e4'), children: [] }),
        [orphanId]: createTestTreeStoreNode({ id: orphanId, move: moveFromId(orphanId), children: [] }),
      },
    });

    store.dispatch(ui.actions.setTreeMoveLimit(1));

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe('e2e4');
      expect(store.getState().ui.boardFen).toBe(getFenFromPathId('e2e4'));
    });
  });

  it('clamps unknown current path to nearest existing ancestor on 404 rejection', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse({ message: 'not found' }, 404));

    const missingId = 'e2e4,e7e5,g1f3';
    const clampedId = 'e2e4,e7e5';
    const store = createStore({
      currentId: missingId,
      boardFen: DEFAULT_POSITION,
      nodes: createConnectedTreeNodes(),
    });

    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: missingId }));
    await expect(request.unwrap()).rejects.toBeDefined();
    request.unsubscribe();

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe(clampedId);
      expect(store.getState().ui.boardFen).toBe(getFenFromPathId(clampedId));
    });
  });

  it('does not clamp on non-404/400 rejection statuses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(asResponse({ message: 'oops' }, 500));

    const missingId = 'e2e4,e7e5,g1f3';
    const store = createStore({
      currentId: missingId,
      boardFen: DEFAULT_POSITION,
      nodes: createConnectedTreeNodes(),
    });

    const request = store.dispatch(openingsApi.endpoints.getNodes.initiate({ nodeId: missingId }));
    await expect(request.unwrap()).rejects.toBeDefined();
    request.unsubscribe();

    await vi.waitFor(() => {
      expect(store.getState().ui.currentId).toBe(missingId);
      expect(store.getState().ui.boardFen).toBe(DEFAULT_POSITION);
    });
  });
});
