import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { HierarchyPointNode } from '@visx/hierarchy/lib/types';

import { createTestTreeViewNode } from '@/test/treeFixtures';
import type { TreeViewNode } from '@/types';

import { TreeNodeWinFrequency } from './TreeNodeWinFrequency';

function createPointNode(overrides: Partial<TreeViewNode> = {}): HierarchyPointNode<TreeViewNode> {
  return {
    data: createTestTreeViewNode({
      id: 'e2e4',
      total: 100,
      white: 60,
      draws: 20,
      black: 20,
      ...overrides,
    }),
    x: 0,
    y: 0,
  } as HierarchyPointNode<TreeViewNode>;
}

const baseProps = {
  nodeSize: 120,
  barTrackColor: '#111111',
  barStrokeColor: '#222222',
  fontSize: 16,
} as const;

describe('TreeNodeWinFrequency', () => {
  it('renders nothing in minimap mode', () => {
    const node = createPointNode();

    const { container } = render(
      <svg>
        <TreeNodeWinFrequency
          node={node}
          minimap={true}
          boardOrientation="white"
          {...baseProps}
        />
      </svg>
    );

    expect(container.querySelector('text')).toBeNull();
    expect(container.querySelector('clipPath')).toBeNull();
  });

  it('renders white-oriented win/draw/loss labels from node stats', () => {
    const node = createPointNode({ white: 60, draws: 20, black: 20, total: 100 });

    render(
      <svg>
        <TreeNodeWinFrequency
          node={node}
          minimap={false}
          boardOrientation="white"
          {...baseProps}
        />
      </svg>
    );

    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getAllByText('20%')).toHaveLength(2);
  });

  it('swaps win/loss perspective for black orientation and hides sub-10 labels', () => {
    const node = createPointNode({ white: 9, draws: 20, black: 71, total: 100 });

    render(
      <svg>
        <TreeNodeWinFrequency
          node={node}
          minimap={false}
          boardOrientation="black"
          {...baseProps}
        />
      </svg>
    );

    expect(screen.getByText('71%')).toBeInTheDocument();
    expect(screen.getByText('20%')).toBeInTheDocument();
    expect(screen.queryByText('9%')).not.toBeInTheDocument();
  });
});
