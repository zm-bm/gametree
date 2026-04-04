import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { HierarchyPointLink } from '@visx/hierarchy/lib/types';

import { createTestTreeViewNode, renderTreeViewWithContexts } from '@/test/treeFixtures';
import { TreeLink } from './TreeLink';
import { colorScale } from '../lib/colors';
import type { TreeViewNode } from '@/shared/types';

const getNodeWinScoreMock = vi.fn((node: { id: string }) => (node.id === 'target' ? 0.8 : 0.2));
const getTreeLinkFrequencyMock = vi.fn((_: { id: string }, __: { id: string }) => 0.5);

vi.mock('@/shared/tree', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/tree')>();
  return {
    ...actual,
    getNodeWinScore: (node: { id: string }) => getNodeWinScoreMock(node),
    getTreeLinkFrequency: (source: { id: string }, target: { id: string }) => getTreeLinkFrequencyMock(source, target),
  };
});

vi.mock('../lib/colors', () => ({
  colorScale: vi.fn(() => 'rgb(1, 2, 3)'),
}));

vi.mock('react-spring', () => ({
  animated: {
    path: (props: React.ComponentProps<'path'>) => <path data-testid="tree-link" {...props} />,
  },
  to: (
    values: [number, number, number, number],
    mapper: (sx: number, sy: number, tx: number, ty: number) => string,
  ) => mapper(...values),
}));

const sourceNode = { data: createTestTreeViewNode({ id: 'source' }) };
const targetNode = { data: createTestTreeViewNode({ id: 'target' }) };

const link = {
  source: sourceNode,
  target: targetNode,
} as unknown as HierarchyPointLink<TreeViewNode>;

const renderTreeLink = (uiStateOverrides: {
  treeWinRateComparison: 'absolute' | 'relative';
  boardOrientation: 'white' | 'black';
}) => {
  return renderTreeViewWithContexts(
    <svg>
      <TreeLink link={link} sourceX={10} sourceY={20} targetX={30} targetY={100} minimap={true} />
    </svg>,
    {
      preloadedState: {
        ui: {
          treeWinRateComparison: uiStateOverrides.treeWinRateComparison,
          boardOrientation: uiStateOverrides.boardOrientation,
        },
      },
    }
  );
};

describe('TreeLink', () => {
  beforeEach(() => {
    getNodeWinScoreMock.mockClear();
    getTreeLinkFrequencyMock.mockClear();
    vi.mocked(colorScale).mockClear();
  });

  it('uses absolute win-rate color for target node by default', () => {
    const { getByTestId } = renderTreeLink({
      treeWinRateComparison: 'absolute',
      boardOrientation: 'white',
    });

    const path = getByTestId('tree-link');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', 'rgb(1, 2, 3)');
    expect(path.getAttribute('d')).toBeTruthy();

    expect(getTreeLinkFrequencyMock).toHaveBeenCalledTimes(1);
    expect(vi.mocked(colorScale)).toHaveBeenCalledWith(0.8);
  });

  it('uses relative score delta and minimap class when enabled', () => {
    const { getByTestId } = renderTreeLink({
      treeWinRateComparison: 'relative',
      boardOrientation: 'black',
    });

    const path = getByTestId('tree-link');
    expect(path).toHaveClass('stroke-1');
    const firstColorInput = vi.mocked(colorScale).mock.calls[0]?.[0];
    expect(firstColorInput).toBeCloseTo(-0.3);
  });
});
