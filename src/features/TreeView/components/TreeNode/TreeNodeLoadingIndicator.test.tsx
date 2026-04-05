import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import { TreeNodeLoadingIndicator } from './TreeNodeLoadingIndicator';

describe('TreeNodeLoadingIndicator', () => {
  it('renders loading indicator basics', () => {
    const { container } = render(
      <svg>
        <TreeNodeLoadingIndicator radius={10} />
      </svg>
    );

    const group = container.querySelector('g');
    const circles = container.querySelectorAll('circle');

    expect(group).toBeInTheDocument();
    expect(group).toHaveClass('pointer-events-none');
    expect(circles).toHaveLength(2);
    expect(circles[1]).toHaveClass('animate-spin-slow');
  });
});
