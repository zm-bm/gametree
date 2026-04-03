import { describe, expect, it } from 'vitest';
import { useContext } from 'react';
import { render, screen } from '@testing-library/react';

import { TreeDimensionsContext } from './TreeDimensionsContext';
import { TreeDimensionsProvider } from './TreeDimensionsProvider';

const DimensionsConsumer = () => {
  const dims = useContext(TreeDimensionsContext);
  return <pre data-testid="dimensions">{JSON.stringify(dims)}</pre>;
};

describe('TreeDimensionsProvider', () => {
  it('provides dimensions with consistent invariants', () => {
    render(
      <TreeDimensionsProvider width={500} height={1000}>
        <DimensionsConsumer />
      </TreeDimensionsProvider>
    );

    const dims = JSON.parse(screen.getByTestId('dimensions').textContent || '{}');

    expect(dims.width).toBe(500);
    expect(dims.height).toBe(1000);
    expect(dims.nodeRectSize).toBeGreaterThan(0);
    expect(dims.nodeRadius).toBeGreaterThan(0);
    expect(dims.fontSize).toBeGreaterThan(0);
    expect(dims.nodeRadius * 2).toBe(dims.nodeRectSize);
    expect(dims.treeNodeSpacing).toEqual([dims.treeRowSpacing, dims.treeColumnSpacing]);
    expect(dims.treeColumnSpacing).toBeGreaterThan(dims.treeRowSpacing);
  });

  it('updates derived dimensions when min dimension grows', () => {
    const { rerender } = render(
      <TreeDimensionsProvider width={360} height={360}>
        <DimensionsConsumer />
      </TreeDimensionsProvider>
    );

    const smallDims = JSON.parse(screen.getByTestId('dimensions').textContent || '{}');

    rerender(
      <TreeDimensionsProvider width={1440} height={1440}>
        <DimensionsConsumer />
      </TreeDimensionsProvider>
    );

    const largeDims = JSON.parse(screen.getByTestId('dimensions').textContent || '{}');
    expect(largeDims.nodeRectSize).toBeGreaterThanOrEqual(smallDims.nodeRectSize);
    expect(largeDims.fontSize).toBeGreaterThanOrEqual(smallDims.fontSize);
  });
});