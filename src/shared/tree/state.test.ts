import { describe, expect, it } from 'vitest';

import { createTestTreeStoreNode } from '@/test/treeFixtures';

import type { OpeningMove, OpeningTotals, SourceStats, TreeStore } from "@/types";
import { getMoveFromPathId } from '../chess';
import { toNodeStats } from './stats';
import { addNodesToTree, buildChildNodes, buildNodes } from './state';

function makeSourceStats(white: number, draws: number, black: number): SourceStats {
  return {
    white,
    draws,
    black,
    total: white + draws + black,
  };
}

function makeOpeningMove(
  uci: string,
  otb = makeSourceStats(1, 2, 3),
  online = makeSourceStats(4, 5, 6)
): OpeningMove {
  return {
    uci,
    otb,
    online,
    total: otb.total + online.total,
  };
}

function makeOpeningTotals(
  moves: OpeningMove[],
  otb = makeSourceStats(10, 20, 30),
  online = makeSourceStats(40, 50, 60)
): OpeningTotals {
  return {
    play: [],
    otb,
    online,
    moves,
  };
}

describe('tree state helpers', () => {
  it('builds child nodes from the parent position', () => {
    const parentMove = getMoveFromPathId('e2e4');
    if (!parentMove) throw new Error('expected test move');

    const children = buildChildNodes(
      {},
      createTestTreeStoreNode({ id: 'e2e4', move: parentMove }),
      [makeOpeningMove('e7e5')]
    );

    expect(children).toHaveLength(1);
    expect(children[0]).toMatchObject({
      id: 'e2e4,e7e5',
      childrenLoaded: false,
      loading: false,
      children: [],
      edgeStats: toNodeStats(makeOpeningMove('e7e5')),
      positionStats: toNodeStats(makeOpeningMove('e7e5')),
    });
    expect(children[0].move?.lan).toBe('e7e5');
    expect(children[0].move?.before).toBe(parentMove.after);
  });

  it('updates existing child nodes while preserving loaded position stats', () => {
    const parentMove = getMoveFromPathId('e2e4');
    if (!parentMove) throw new Error('expected test move');

    const preservedPositionStats = toNodeStats({
      otb: makeSourceStats(7, 8, 9),
      online: makeSourceStats(10, 11, 12),
    });
    const refreshedEdgeStats = makeOpeningMove('e7e5', makeSourceStats(2, 0, 1), makeSourceStats(3, 1, 0));
    const pendingEdgeStats = makeOpeningMove('c7c5', makeSourceStats(5, 0, 0), makeSourceStats(1, 1, 1));

    const nodes: TreeStore = {
      'e2e4,e7e5': createTestTreeStoreNode({
        id: 'e2e4,e7e5',
        childrenLoaded: true,
        move: null,
        edgeStats: toNodeStats(makeOpeningMove('e7e5')),
        positionStats: preservedPositionStats,
      }),
      'e2e4,c7c5': createTestTreeStoreNode({
        id: 'e2e4,c7c5',
        childrenLoaded: false,
        move: getMoveFromPathId('e2e4,c7c5'),
        positionStats: preservedPositionStats,
      }),
    };

    const children = buildChildNodes(
      nodes,
      createTestTreeStoreNode({ id: 'e2e4', move: parentMove }),
      [refreshedEdgeStats, pendingEdgeStats]
    );

    expect(children).toHaveLength(2);
    expect(children[0].move?.lan).toBe('e7e5');
    expect(children[0].edgeStats).toEqual(toNodeStats(refreshedEdgeStats));
    expect(children[0].positionStats).toEqual(preservedPositionStats);

    expect(children[1].edgeStats).toEqual(toNodeStats(pendingEdgeStats));
    expect(children[1].positionStats).toEqual(toNodeStats(pendingEdgeStats));
  });

  it('builds a missing node from its id and deduplicates child ids', () => {
    const openingData = makeOpeningTotals([
      makeOpeningMove('e7e5', makeSourceStats(2, 2, 2), makeSourceStats(1, 1, 1)),
      makeOpeningMove('c7c5', makeSourceStats(3, 0, 1), makeSourceStats(2, 1, 0)),
    ]);

    const nodes: TreeStore = {
      'e2e4,e7e5': createTestTreeStoreNode({ id: 'e2e4,e7e5' }),
    };

    const builtNodes = buildNodes(nodes, 'e2e4', openingData);
    const builtNode = builtNodes[0];

    expect(builtNode.move?.lan).toBe('e2e4');
    expect(builtNode.childrenLoaded).toBe(true);
    expect(builtNode.edgeStats).toEqual(toNodeStats(openingData));
    expect(builtNode.positionStats).toEqual(toNodeStats(openingData));
    expect(builtNode.children).toEqual(['e2e4,e7e5', 'e2e4,c7c5']);
  });

  it('preserves edge stats for existing nodes already linked from their parent', () => {
    const preservedEdgeStats = toNodeStats({
      otb: makeSourceStats(1, 0, 0),
      online: makeSourceStats(0, 1, 0),
    });
    const openingData = makeOpeningTotals([makeOpeningMove('e7e5')]);

    const nodes: TreeStore = {
      '': createTestTreeStoreNode({ id: '', children: ['e2e4'] }),
      e2e4: createTestTreeStoreNode({
        id: 'e2e4',
        move: getMoveFromPathId('e2e4'),
        edgeStats: preservedEdgeStats,
        positionStats: preservedEdgeStats,
      }),
    };

    const [updatedNode] = buildNodes(nodes, 'e2e4', openingData);

    expect(updatedNode.edgeStats).toEqual(preservedEdgeStats);
    expect(updatedNode.positionStats).toEqual(toNodeStats(openingData));
  });

  it('adds built nodes into the tree and attaches the node to its parent', () => {
    const nodes: TreeStore = {
      '': createTestTreeStoreNode({ id: '', children: [] }),
    };
    const openingData = makeOpeningTotals([makeOpeningMove('e7e5')]);

    addNodesToTree(nodes, 'e2e4', openingData);

    expect(nodes['e2e4']).toBeDefined();
    expect(nodes['e2e4,e7e5']).toBeDefined();
    expect(nodes[''].children).toEqual(['e2e4']);
  });

  it('does not attach the root node to itself when loading root data', () => {
    const nodes: TreeStore = {
      '': createTestTreeStoreNode({ id: '', children: [] }),
    };
    const openingData = makeOpeningTotals([makeOpeningMove('e2e4')]);

    addNodesToTree(nodes, '', openingData);

    expect(nodes[''].children).toEqual(['e2e4']);
  });
});