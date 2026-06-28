import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { TreeSettings } from './TreeSettings';

const collapsePersistKey = 'gtTreeOptionsCollapsed';

const expandSettings = () => {
  fireEvent.click(screen.getByRole('button', { name: /Tree Settings/i }));
};

describe('TreeSettings', () => {
  beforeEach(() => {
    localStorage.removeItem(collapsePersistKey);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('defaults to compact settings with a summary on fresh sessions', () => {
    renderWithProviders(<TreeSettings />);

    const settingsButton = screen.getByRole('button', { name: /Tree Settings/i });
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    expect(settingsButton).toHaveAttribute('title', 'OTB | Parent | >= 2% | 8 moves');
    expect(screen.getByText('Tree Settings')).toBeInTheDocument();
    expect(screen.queryByText('OTB | Parent | >= 2% | 8 moves')).not.toBeInTheDocument();
    expect(screen.queryByText('Game source')).not.toBeInTheDocument();
  });

  it('renders summary from store state in the settings title only', () => {
    renderWithProviders(<TreeSettings />, {
      preloadedState: {
        ui: {
          treeSource: 'online',
          treeMinFrequencyPct: 5.5,
          treeMoveLimit: 12,
          treeWinRateComparison: 'absolute',
        },
      },
    });

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute(
      'title',
      'Online | 50/50 | >= 5.5% | 12 moves',
    );
    expect(screen.queryByText('Online | 50/50 | >= 5.5% | 12 moves')).not.toBeInTheDocument();

    expandSettings();

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute(
      'title',
      'Online | 50/50 | >= 5.5% | 12 moves',
    );
    expect(screen.queryByText('Online | 50/50 | >= 5.5% | 12 moves')).not.toBeInTheDocument();
  });

  it('renders current settings from store state after expanding', () => {
    renderWithProviders(<TreeSettings />, {
      preloadedState: {
        ui: {
          treeSource: 'online',
          treeMinFrequencyPct: 5.5,
          treeMoveLimit: 12,
          treeWinRateComparison: 'absolute',
        },
      },
    });

    expandSettings();

    expect(screen.getByRole('radio', { name: 'Online games' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'OTB (over the board)' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Compare to 50/50' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Minimum play rate percentage' })).toHaveValue(5.5);
    expect(screen.getByRole('spinbutton', { name: 'Maximum moves per position' })).toHaveValue(12);
  });

  it('updates data source and result coloring from radio controls', () => {
    const { store } = renderWithProviders(<TreeSettings />);
    expandSettings();

    fireEvent.click(screen.getByRole('radio', { name: 'Online games' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Compare to 50/50' }));

    expect(store.getState().ui.treeSource).toBe('online');
    expect(store.getState().ui.treeWinRateComparison).toBe('absolute');
  });

  it('clamps min frequency to the allowed range', () => {
    const { store } = renderWithProviders(<TreeSettings />);
    expandSettings();
    const minFreqInput = screen.getByRole('spinbutton', {
      name: 'Minimum play rate percentage',
    });

    fireEvent.change(minFreqInput, { target: { value: '25' } });
    expect(store.getState().ui.treeMinFrequencyPct).toBe(20);

    fireEvent.change(minFreqInput, { target: { value: '-1' } });
    expect(store.getState().ui.treeMinFrequencyPct).toBe(0);

    fireEvent.change(minFreqInput, { target: { value: '7.5' } });
    expect(store.getState().ui.treeMinFrequencyPct).toBe(7.5);
  });

  it('updates move limit from number input and keeps it non-negative', () => {
    const { store } = renderWithProviders(<TreeSettings />);
    expandSettings();
    const moveLimitInput = screen.getByRole('spinbutton', {
      name: 'Maximum moves per position',
    });

    fireEvent.change(moveLimitInput, { target: { value: '33' } });
    expect(store.getState().ui.treeMoveLimit).toBe(33);

    fireEvent.change(moveLimitInput, { target: { value: '-4' } });
    expect(store.getState().ui.treeMoveLimit).toBe(0);
  });

  it('uses current move limit to expand slider max when above default', () => {
    renderWithProviders(<TreeSettings />);
    expandSettings();

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Maximum moves per position' }), {
      target: { value: '34' },
    });

    const moveLimitRange = screen
      .getAllByRole('slider')
      .find((slider) => slider.getAttribute('step') === '1');

    expect(moveLimitRange).toBeDefined();
    expect(moveLimitRange).toHaveAttribute('max', '34');
  });

  it('expands from compact state and persists expanded state to localStorage', () => {
    renderWithProviders(<TreeSettings />);

    expandSettings();

    expect(localStorage.getItem(collapsePersistKey)).toBe('0');
    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('OTB | Parent | >= 2% | 8 moves')).not.toBeInTheDocument();
    expect(screen.getByText('Game source')).toBeInTheDocument();
    expect(screen.getByText('Result colors')).toBeInTheDocument();
    expect(screen.getByText('Minimum play rate (%)')).toBeInTheDocument();
    expect(screen.getByText('Moves shown')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Game source help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Result colors help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Minimum play rate help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Moves shown help' })).toBeInTheDocument();
  });

  it('shows concise result colors tooltip copy', () => {
    renderWithProviders(<TreeSettings />);
    expandSettings();

    fireEvent.click(screen.getByRole('button', { name: 'Result colors help' }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Choose whether colors compare moves to the parent position or a 50/50 baseline.',
    );
  });

  it('collapses from expanded state and persists collapsed state to localStorage', () => {
    vi.useFakeTimers();
    localStorage.setItem(collapsePersistKey, '0');

    renderWithProviders(<TreeSettings />);

    const settingsButton = screen.getByRole('button', { name: /Tree Settings/i });
    expect(screen.getByText('Game source')).toBeInTheDocument();

    fireEvent.click(settingsButton);
    expect(localStorage.getItem(collapsePersistKey)).toBe('1');
    expect(settingsButton).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Game source')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Game source')).not.toBeInTheDocument();
    expect(screen.getByText('Tree Settings')).toBeInTheDocument();
    expect(screen.queryByText('OTB | Parent | >= 2% | 8 moves')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute(
      'title',
      'OTB | Parent | >= 2% | 8 moves',
    );
  });

  it('initializes collapsed from persisted collapsed state', () => {
    localStorage.setItem(collapsePersistKey, '1');

    renderWithProviders(<TreeSettings />);

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Tree Settings')).toBeInTheDocument();
    expect(screen.queryByText('Game source')).not.toBeInTheDocument();
  });

  it('initializes expanded from persisted expanded state', () => {
    localStorage.setItem(collapsePersistKey, '0');

    renderWithProviders(<TreeSettings />);

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('OTB | Parent | >= 2% | 8 moves')).not.toBeInTheDocument();
    expect(screen.getByText('Game source')).toBeInTheDocument();
  });

  it('treats legacy empty persisted state as expanded', () => {
    localStorage.setItem(collapsePersistKey, '');

    renderWithProviders(<TreeSettings />);

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('OTB | Parent | >= 2% | 8 moves')).not.toBeInTheDocument();
    expect(screen.getByText('Game source')).toBeInTheDocument();
  });

  it('uses All moves in the compact summary title when move limit is zero', () => {
    renderWithProviders(<TreeSettings />, {
      preloadedState: {
        ui: {
          treeSource: 'otb',
          treeMinFrequencyPct: 0,
          treeMoveLimit: 0,
          treeWinRateComparison: 'relative',
        },
      },
    });

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute(
      'title',
      'OTB | Parent | >= 0% | All moves',
    );
    expect(screen.queryByText('OTB | Parent | >= 0% | All moves')).not.toBeInTheDocument();

    expandSettings();

    expect(screen.getByRole('button', { name: /Tree Settings/i })).toHaveAttribute(
      'title',
      'OTB | Parent | >= 0% | All moves',
    );
    expect(screen.queryByText('OTB | Parent | >= 0% | All moves')).not.toBeInTheDocument();
  });
});
