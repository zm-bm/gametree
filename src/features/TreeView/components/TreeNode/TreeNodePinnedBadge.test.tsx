import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TreeNodePinnedBadge } from './TreeNodePinnedBadge';

vi.mock('react-icons/fa6', () => ({
  FaThumbtack: (props: React.SVGProps<SVGSVGElement> & { size?: number }) => (
    <svg data-testid="thumbtack" {...props} />
  ),
}));

describe('TreeNodePinnedBadge', () => {
  it('renders badge geometry and placement container', () => {
    const { container } = render(
      <svg>
        <TreeNodePinnedBadge nodeRectSize={20} isDarkMode={false} />
      </svg>
    );

    const group = container.querySelector('g');
    const rect = container.querySelector('rect');

    expect(group).toBeInTheDocument();
    expect(group).toHaveStyle({ pointerEvents: 'none' });
    expect(group?.getAttribute('transform')).toContain('translate(');

    expect(rect).toBeInTheDocument();
    expect(rect?.getAttribute('width')).toBeTruthy();
    expect(rect?.getAttribute('height')).toBeTruthy();
    expect(rect?.getAttribute('rx')).toBeTruthy();
    expect(rect?.getAttribute('ry')).toBeTruthy();
  });

  it('passes computed icon sizing and offset props', () => {
    const { container } = render(
      <svg>
        <TreeNodePinnedBadge nodeRectSize={100} isDarkMode={true} />
      </svg>
    );

    const rect = container.querySelector('rect');
    const icon = screen.getByTestId('thumbtack');

    expect(rect).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(icon.getAttribute('size')).toBeTruthy();
    expect(icon.getAttribute('x')).toBeTruthy();
    expect(icon.getAttribute('y')).toBeTruthy();
  });
});
