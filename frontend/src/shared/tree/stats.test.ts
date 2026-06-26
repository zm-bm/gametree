import { describe, expect, it } from 'vitest';

import {
  createTestTreeStoreNode,
  createTestTreeViewNode,
} from '@/test/treeFixtures';

import { getNodeWinScore, getTreeLinkFrequency, sourceGameCount, toNodeStats } from './stats';

describe('tree stats helpers', () => {
  it('builds node stats and source game counts', () => {
    const stats = toNodeStats({
      otb: { white: 1, draws: 2, black: 3, total: 6 },
      online: { white: 4, draws: 5, black: 6, total: 15 },
    });
    const node = createTestTreeStoreNode({ edgeStats: stats });

    expect(sourceGameCount(node, 'otb')).toBe(6);
    expect(sourceGameCount(node, 'online')).toBe(15);
  });

  it('derives link frequency and win score', () => {
    const source = createTestTreeViewNode({ total: 100, white: 55, black: 30 });
    const target = createTestTreeViewNode({ total: 25, white: 12, black: 10 });

    expect(getTreeLinkFrequency(source, target)).toBe(0.25);
    expect(getNodeWinScore(source)).toBe(0.25);
    expect(getNodeWinScore(createTestTreeViewNode({ total: 0 }))).toBe(0);
  });
});