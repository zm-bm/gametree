import { describe, expect, it } from 'vitest';

import type { TreeStore } from './types';
import {
  createTestMove,
  createTestTreeStoreNode,
  createTestTreeViewNode,
} from '@/test/treeFixtures';
import {
  findNearestExistingAncestorId,
  getNextPathChildId,
  getNodeFen,
  getParentPathId,
  getPathIds,
  getSiblingNodeIds,
  getTreeLinkFrequency,
  getNodeWinScore,
  sourceGameCount,
  toNodeStats,
} from './tree';

describe('shared tree helpers', () => {
  it('builds node stats and source game counts', () => {
    const stats = toNodeStats({
      otb: { white: 1, draws: 2, black: 3, total: 6 },
      online: { white: 4, draws: 5, black: 6, total: 15 },
    });
    const node = createTestTreeStoreNode({ edgeStats: stats });

    expect(sourceGameCount(node, 'otb')).toBe(6);
    expect(sourceGameCount(node, 'online')).toBe(15);
  });

  it('handles path id and next-path-child derivation', () => {
    expect([...getPathIds('a,b,c')]).toEqual(['', 'a', 'a,b', 'a,b,c']);
    expect(getNextPathChildId('', 'a,b,c')).toBe('a');
    expect(getNextPathChildId('a', 'a,b,c')).toBe('a,b');
    expect(getNextPathChildId('a,b,c', 'a,b,c')).toBeNull();
    expect(getNextPathChildId('x', 'a,b,c')).toBeNull();
  });

  it('finds nearest existing ancestor and sibling set', () => {
    const nodes: TreeStore = {
      '': createTestTreeStoreNode({ id: '', children: ['a', 'b'] }),
      a: createTestTreeStoreNode({ id: 'a', children: ['a,c'] }),
      b: createTestTreeStoreNode({ id: 'b' }),
    };

    expect(findNearestExistingAncestorId(nodes, 'a,c,d')).toBe('a');
    expect(findNearestExistingAncestorId(nodes, 'z')).toBe('');
    expect(getSiblingNodeIds(nodes, 'a')).toEqual(['a', 'b']);
    expect(getSiblingNodeIds(nodes, '')).toEqual([]);
  });

  it('derives fen, parent id, link frequency, and win score', () => {
    const nodes: TreeStore = {
      '': createTestTreeStoreNode(),
      a: createTestTreeStoreNode({
        id: 'a',
        move: createTestMove({ after: 'after-fen' }),
      }),
    };

    expect(getNodeFen(nodes, 'a', 'fallback-fen')).toBe('after-fen');
    expect(getNodeFen(nodes, 'missing', 'fallback-fen')).toBe('fallback-fen');

    expect(getParentPathId('a,b,c')).toBe('a,b');
    expect(getParentPathId('a')).toBe('');
    expect(getParentPathId('')).toBeNull();

    const source = createTestTreeViewNode({ total: 100, white: 55, black: 30 });
    const target = createTestTreeViewNode({ total: 25, white: 12, black: 10 });
    expect(getTreeLinkFrequency(source, target)).toBe(0.25);
    expect(getNodeWinScore(source)).toBe(0.25);
    expect(getNodeWinScore(createTestTreeViewNode({ total: 0 }))).toBe(0);
  });
});