import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { createTestHierarchyPointNode } from '@/test/treeFixtures';
import { renderWithProviders } from '@/test/renderWithProviders';

import { TreeNodeMoveFrequency } from './TreeNodeMoveFrequency';

const defaultEdgeStats = {
  otb: { white: 0, draws: 0, black: 0, total: 50 },
  online: { white: 0, draws: 0, black: 0, total: 40 },
};

const defaultPositionStats = {
  otb: { white: 0, draws: 0, black: 0, total: 50 },
  online: { white: 0, draws: 0, black: 0, total: 40 },
};

const baseProps = {
  nodeRectSize: 120,
  frequencyTextColor: '#aaa',
  fontSize: 14,
} as const;

describe('TreeNodeMoveFrequency', () => {
  it('renders nothing in minimap mode', () => {
    const node = createTestHierarchyPointNode({
      id: 'e2e4',
      node: {
        edgeStats: defaultEdgeStats,
        positionStats: defaultPositionStats,
      },
      parent: { total: 100 },
    });

    const { container } = renderWithProviders(
      <svg>
        <TreeNodeMoveFrequency node={node} minimap={true} {...baseProps} />
      </svg>
    );

    expect(container.querySelector('text')).toBeNull();
  });

  it('renders nothing when parent total is missing', () => {
    const node = createTestHierarchyPointNode({
      id: 'e2e4',
      node: {
        edgeStats: defaultEdgeStats,
        positionStats: defaultPositionStats,
      },
      parent: { total: 0 },
    });

    const { container } = renderWithProviders(
      <svg>
        <TreeNodeMoveFrequency node={node} {...baseProps} />
      </svg>
    );

    expect(container.querySelector('text')).toBeNull();
  });

  it('renders frequency label using selected tree source', () => {
    const node = createTestHierarchyPointNode({
      id: 'e2e4',
      node: {
        edgeStats: {
          ...defaultEdgeStats,
          online: { ...defaultEdgeStats.online, total: 37 },
        },
        positionStats: defaultPositionStats,
      },
      parent: { total: 100 },
    });

    renderWithProviders(
      <svg>
        <TreeNodeMoveFrequency node={node} {...baseProps} />
      </svg>,
      {
        preloadedState: {
          ui: { treeSource: 'online' },
        },
      }
    );

    expect(screen.getByText('37.0%')).toBeInTheDocument();
    expect(screen.queryByText('T')).not.toBeInTheDocument();
  });

  it('shows transposition indicator and tooltip when position total exceeds parent total', () => {
    const node = createTestHierarchyPointNode({
      id: 'e2e4',
      node: {
        edgeStats: {
          ...defaultEdgeStats,
          otb: { ...defaultEdgeStats.otb, total: 55 },
        },
        positionStats: {
          ...defaultPositionStats,
          otb: { ...defaultPositionStats.otb, total: 140 },
        },
      },
      parent: { total: 100 },
    });

    const { container } = renderWithProviders(
      <svg>
        <TreeNodeMoveFrequency node={node} {...baseProps} />
      </svg>
    );

    expect(screen.getByText('55.0%')).toBeInTheDocument();
    expect(screen.getByText('T')).toBeInTheDocument();
    expect(container.querySelector('title')?.textContent).toContain('position total 140 exceeds parent total 100');
  });
});
