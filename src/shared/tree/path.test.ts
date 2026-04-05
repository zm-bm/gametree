import { describe, expect, it } from 'vitest';

import { createTestMove, createTestTreeStoreNode } from '@/test/treeFixtures';

import type { TreeStore } from "@/types";
import {
  findNearestExistingAncestorId,
  getChildPathId,
  getNextPathChildId,
  getNodeFen,
  getParentPathId,
  getPathIds,
  getSiblingNodeIds,
} from './path';

describe('tree path helpers', () => {
  it('builds path ids and next-path-child ids', () => {
    expect([...getPathIds('a,b,c')]).toEqual(['', 'a', 'a,b', 'a,b,c']);
    expect(getChildPathId('', createTestMove({ lan: 'e2e4' }))).toBe('e2e4');
    expect(getChildPathId('a', createTestMove({ lan: 'e7e5' }))).toBe('a,e7e5');
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

  it('derives node fen and parent ids', () => {
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
  });
});