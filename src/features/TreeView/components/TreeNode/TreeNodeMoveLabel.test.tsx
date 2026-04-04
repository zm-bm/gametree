import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';

import type { Move } from '@/shared/types';

import { TreeNodeMoveLabel } from './TreeNodeMoveLabel';

const createMove = (overrides: Partial<Move> = {}): Move => ({
  color: 'w',
  from: 'e2',
  to: 'e4',
  piece: 'p',
  san: 'e4',
  lan: 'e2e4',
  before: 'before-fen',
  after: 'after-fen',
  ...overrides,
});

describe('TreeNodeMoveLabel', () => {
  it('renders nothing when move is null', () => {
    const { container } = render(
      <svg>
        <TreeNodeMoveLabel move={null} fontSize={12} />
      </svg>
    );

    expect(container.querySelector('text')).toBeNull();
  });

  it('renders pawn SAN notation without piece symbol', () => {
    const move = createMove({ piece: 'p', san: 'e4' });
    const { container } = render(
      <svg>
        <TreeNodeMoveLabel move={move} fontSize={12} />
      </svg>
    );

    expect(container.querySelector('text')?.textContent).toBe('e4');
  });

  it('renders piece symbol and trims SAN prefix for piece moves', () => {
    const move = createMove({ piece: 'n', san: 'Nf3', from: 'g1', to: 'f3', lan: 'g1f3' });
    const { container } = render(
      <svg>
        <TreeNodeMoveLabel move={move} fontSize={14} />
      </svg>
    );

    expect(container.querySelector('text')?.textContent).toBe('♞f3');
  });

  it('keeps castling SAN notation as-is', () => {
    const move = createMove({ piece: 'k', san: 'O-O', from: 'e1', to: 'g1', lan: 'e1g1' });
    const { container } = render(
      <svg>
        <TreeNodeMoveLabel move={move} fontSize={14} />
      </svg>
    );

    expect(container.querySelector('text')?.textContent).toBe('O-O');
  });
});
