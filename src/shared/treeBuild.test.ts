import { describe, expect, it } from 'vitest';

import { createTestTreeStoreNode } from '@/test/treeFixtures';

import type { TreeStore } from './types';
import {
  buildShallowNode,
  filterTreeNodes,
  orderTreeNodes,
  treeBuild,
} from './treeBuild';

function makeTreeStore(): TreeStore {
  return {
    '': createTestTreeStoreNode({
      id: '',
      children: ['a', 'b'],
      edgeStats: {
        otb: { white: 0, draws: 0, black: 0, total: 100 },
        online: { white: 0, draws: 0, black: 0, total: 100 },
      },
    }),
    a: createTestTreeStoreNode({
      id: 'a',
      children: ['a,a1', 'a,a2'],
      childrenLoaded: true,
      edgeStats: {
        otb: { white: 40, draws: 10, black: 30, total: 80 },
        online: { white: 20, draws: 5, black: 15, total: 40 },
      },
    }),
    'a,a1': createTestTreeStoreNode({
      id: 'a,a1',
      childrenLoaded: false,
      edgeStats: {
        otb: { white: 15, draws: 5, black: 10, total: 30 },
        online: { white: 8, draws: 2, black: 5, total: 15 },
      },
    }),
    'a,a2': createTestTreeStoreNode({
      id: 'a,a2',
      childrenLoaded: false,
      edgeStats: {
        otb: { white: 5, draws: 2, black: 3, total: 10 },
        online: { white: 3, draws: 1, black: 1, total: 5 },
      },
    }),
    b: createTestTreeStoreNode({
      id: 'b',
      children: ['b,b1', 'b,b2'],
      childrenLoaded: true,
      edgeStats: {
        otb: { white: 6, draws: 4, black: 10, total: 20 },
        online: { white: 4, draws: 2, black: 4, total: 10 },
      },
    }),
    'b,b1': createTestTreeStoreNode({
      id: 'b,b1',
      childrenLoaded: false,
      edgeStats: {
        otb: { white: 4, draws: 3, black: 8, total: 15 },
        online: { white: 2, draws: 2, black: 3, total: 7 },
      },
    }),
    'b,b2': createTestTreeStoreNode({
      id: 'b,b2',
      childrenLoaded: false,
      edgeStats: {
        otb: { white: 1, draws: 1, black: 3, total: 5 },
        online: { white: 1, draws: 0, black: 1, total: 2 },
      },
    }),
  };
}

describe('shared tree build helpers', () => {
  it('orders nodes toward center by total frequency', () => {
    const nodes = [
      { id: 'n1', total: 1 },
      { id: 'n2', total: 2 },
      { id: 'n3', total: 3 },
      { id: 'n4', total: 4 },
    ] as Array<{ id: string; total: number }> as never;

    expect(orderTreeNodes(nodes).map((n) => n.id)).toEqual(['n2', 'n4', 'n3', 'n1']);
  });

  it('filters tree nodes by loaded-state and frequency threshold', () => {
    const nodes = makeTreeStore();

    expect(filterTreeNodes(nodes, 'a', 50, 100, 'otb')).toBe(true);
    expect(filterTreeNodes(nodes, 'a,a1', 40, 80, 'otb')).toBe(false);
    expect(filterTreeNodes(nodes, 'a,a1', 30, 80, 'otb')).toBe(true);
    expect(filterTreeNodes(nodes, 'a,a1', 30, 0, 'otb')).toBe(false);
    expect(filterTreeNodes(nodes, 'missing', 30, 80, 'otb')).toBe(false);
  });

  it('builds shallow node with source-selected stats and no children', () => {
    const nodes = makeTreeStore();
    const shallow = buildShallowNode(nodes, 'a', 'otb');

    expect(shallow).not.toBeNull();
    expect(shallow?.total).toBe(80);
    expect(shallow?.white).toBe(40);
    expect(shallow?.children).toEqual([]);
    expect(shallow?.childCount).toBe(0);
    expect(buildShallowNode(nodes, 'missing', 'otb')).toBeNull();
  });

  it('keeps current-path continuation visible when moveLimit would otherwise hide it', () => {
    const nodes = makeTreeStore();
    const built = treeBuild(nodes, '', [], 0, 1, 'otb', 'a,a2');

    expect(built).not.toBeNull();
    if (!built) return;

    expect(built.children.map((n) => n.id)).toEqual(['a']);
    expect(built.children[0].children.map((n) => n.id)).toEqual(['a,a2']);
  });

  it('adds pinned branch visibility with ancestor chain and pinned children', () => {
    const nodes = makeTreeStore();
    const built = treeBuild(nodes, '', ['b'], 0, 1, 'otb', 'a,a2');

    expect(built).not.toBeNull();
    if (!built) return;

    // Both focus branch (a) and pinned branch (b) should be visible under root.
    expect(new Set(built.children.map((n) => n.id))).toEqual(new Set(['a', 'b']));

    const pinnedBranch = built.children.find((n) => n.id === 'b');
    expect(pinnedBranch?.children.map((n) => n.id)).toEqual(['b,b1']);
  });
});