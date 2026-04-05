import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CollapsibleCard } from './CollapsibleCard';

describe('CollapsibleCard', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  it('renders content expanded by default and toggles via header click', () => {
    const onToggle = vi.fn();

    render(
      <CollapsibleCard header="Details" onToggle={onToggle}>
        <div>Card body</div>
      </CollapsibleCard>
    );

    expect(screen.getByText('Card body')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Details'));
    expect(onToggle).toHaveBeenCalledWith(true);

    // Hidden after transition duration elapses.
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Card body')).toBeNull();

    fireEvent.click(screen.getByText('Details'));
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(screen.getByText('Card body')).toBeInTheDocument();
  });

  it('supports function header renderer with collapsed state', () => {
    render(
      <CollapsibleCard header={(collapsed) => <span>{collapsed ? 'Closed' : 'Open'}</span>}>
        <div>Body</div>
      </CollapsibleCard>
    );

    expect(screen.getByText('Open')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Open'));
    expect(screen.getByText('Closed')).toBeInTheDocument();
  });

  it('syncs internal state with controlled collapsed prop', () => {
    const { rerender } = render(
      <CollapsibleCard header="Controlled" collapsed={false}>
        <div>Controlled body</div>
      </CollapsibleCard>
    );

    expect(screen.getByText('Controlled body')).toBeInTheDocument();

    rerender(
      <CollapsibleCard header="Controlled" collapsed={true}>
        <div>Controlled body</div>
      </CollapsibleCard>
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(screen.queryByText('Controlled body')).toBeNull();
  });

  it('reads and writes persisted collapsed state with persistKey', () => {
    localStorage.setItem('card-state', '1');

    render(
      <CollapsibleCard header="Persisted" persistKey="card-state" duration={10}>
        <div>Persist body</div>
      </CollapsibleCard>
    );

    act(() => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.queryByText('Persist body')).toBeNull();

    fireEvent.click(screen.getByText('Persisted'));
    expect(localStorage.getItem('card-state')).toBe('');
    expect(screen.getByText('Persist body')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Persisted'));
    expect(localStorage.getItem('card-state')).toBe('1');
  });
});
