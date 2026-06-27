import { describe, expect, it } from 'vitest';

import type { OpeningTotals } from '@/types';
import { getMoveFromPathId } from '@/shared/chess';
import { setupTestStore } from '@/test/renderWithProviders';
import { createTestTreeStoreNode } from '@/test/treeFixtures';
import tree from './tree';

const openingTotals: OpeningTotals = {
  play: [],
  otb: { white: 10, draws: 5, black: 3, total: 18 },
  online: { white: 8, draws: 4, black: 6, total: 18 },
  moves: [
    {
      uci: 'e2e4',
      otb: { white: 6, draws: 2, black: 1, total: 9 },
      online: { white: 4, draws: 2, black: 3, total: 9 },
      total: 18,
    },
  ],
};

const childOpeningTotals: OpeningTotals = {
  play: ['e2e4'],
  otb: { white: 6, draws: 2, black: 1, total: 9 },
  online: { white: 4, draws: 2, black: 3, total: 9 },
  moves: [
    {
      uci: 'e7e5',
      otb: { white: 3, draws: 1, black: 1, total: 5 },
      online: { white: 2, draws: 1, black: 1, total: 4 },
      total: 9,
    },
  ],
};

describe('tree slice', () => {
  it('addNodes adds/updates nodes for a tree position', () => {
    const store = setupTestStore();

    store.dispatch(tree.actions.addNodes({ nodeId: '', openingData: openingTotals }));

    const nodes = store.getState().tree.nodes;
    expect(nodes['']).toBeDefined();
    expect(nodes[''].children).toContain('e2e4');
    expect(nodes['e2e4']).toBeDefined();
  });

  it('addNodes for a non-root node adds children without duplicating parent link', () => {
    const store = setupTestStore({
      tree: {
        nodes: {
          '': createTestTreeStoreNode({ id: '', children: ['e2e4'] }),
          e2e4: createTestTreeStoreNode({
            id: 'e2e4',
            move: getMoveFromPathId('e2e4'),
            childrenLoaded: false,
            children: [],
          }),
        },
      },
    });

    store.dispatch(tree.actions.addNodes({ nodeId: 'e2e4', openingData: childOpeningTotals }));

    const nodes = store.getState().tree.nodes;
    expect(nodes[''].children).toEqual(['e2e4']);
    expect(nodes.e2e4.childrenLoaded).toBe(true);
    expect(nodes.e2e4.children).toContain('e2e4,e7e5');
    expect(nodes['e2e4,e7e5']).toBeDefined();
  });

  it('setNodeLoading updates existing node and ignores missing node ids', () => {
    const store = setupTestStore({
      tree: {
        nodes: {
          e2e4: createTestTreeStoreNode({ id: 'e2e4', loading: false }),
        },
      },
    });

    store.dispatch(tree.actions.setNodeLoading({ nodeId: 'e2e4', value: true }));
    expect(store.getState().tree.nodes.e2e4.loading).toBe(true);

    store.dispatch(tree.actions.setNodeLoading({ nodeId: 'missing', value: true }));
    expect(store.getState().tree.nodes.missing).toBeUndefined();
  });

  it('toggleNodePinned toggles a node id in pinnedNodes', () => {
    const store = setupTestStore();

    store.dispatch(tree.actions.toggleNodePinned('e2e4'));
    expect(store.getState().tree.pinnedNodes).toEqual(['e2e4']);

    store.dispatch(tree.actions.toggleNodePinned('e2e4'));
    expect(store.getState().tree.pinnedNodes).toEqual([]);
  });

  it('toggleNodePinned only removes the selected id when multiple are pinned', () => {
    const store = setupTestStore();

    store.dispatch(tree.actions.toggleNodePinned('e2e4'));
    store.dispatch(tree.actions.toggleNodePinned('d2d4'));
    store.dispatch(tree.actions.toggleNodePinned('e2e4'));

    expect(store.getState().tree.pinnedNodes).toEqual(['d2d4']);
  });

  it('setLastVisitedChild stores latest child id per parent', () => {
    const store = setupTestStore();

    store.dispatch(tree.actions.setLastVisitedChild({ parentId: 'e2e4', childId: 'e2e4,e7e5' }));
    store.dispatch(tree.actions.setLastVisitedChild({ parentId: 'e2e4', childId: 'e2e4,c7c5' }));

    expect(store.getState().tree.lastVisitedChildByParent.e2e4).toBe('e2e4,c7c5');
  });

  it('setLastVisitedChild keeps separate values per parent', () => {
    const store = setupTestStore();

    store.dispatch(tree.actions.setLastVisitedChild({ parentId: '', childId: 'e2e4' }));
    store.dispatch(tree.actions.setLastVisitedChild({ parentId: 'e2e4', childId: 'e2e4,e7e5' }));

    expect(store.getState().tree.lastVisitedChildByParent).toEqual({
      '': 'e2e4',
      e2e4: 'e2e4,e7e5',
    });
  });
});
