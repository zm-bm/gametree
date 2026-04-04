import { describe, expect, it } from 'vitest';

import { renderTreeViewWithContexts } from '@/test/treeFixtures';
import { TreeGrid } from './TreeGrid';

describe('TreeGrid', () => {
  it('uses treeColumnSpacing to size the grid pattern and fill rect', () => {
    const { container } = renderTreeViewWithContexts(
      <svg>
        <TreeGrid />
      </svg>,
      {
        dimensions: {
          treeColumnSpacing: 200,
        },
      }
    );

    const pattern = container.querySelector('#tree-grid-pattern');
    const rect = container.querySelector('rect');

    expect(pattern).toBeInTheDocument();
    expect(pattern).toHaveAttribute('width', '100');
    expect(pattern).toHaveAttribute('height', '100');
    expect(rect).toBeInTheDocument();
    expect(rect).toHaveAttribute('fill', 'url(#tree-grid-pattern)');
  });
});
