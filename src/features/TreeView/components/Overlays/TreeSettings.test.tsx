import { act, fireEvent, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';

import { TreeSettings } from './TreeSettings';

describe('TreeSettings', () => {
  beforeEach(() => {
    localStorage.removeItem('gtTreeOptionsCollapsed');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders current settings from store state', () => {
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

    expect(screen.getByRole('radio', { name: 'Online games' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'OTB (over the board)' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Absolute' })).toBeChecked();
    expect(screen.getByRole('spinbutton', { name: 'Minimum move frequency percentage' })).toHaveValue(5.5);
    expect(screen.getByRole('spinbutton', { name: 'Maximum moves shown per position' })).toHaveValue(12);
  });

  it('updates data source and win rate mode from radio controls', () => {
    const { store } = renderWithProviders(<TreeSettings />);

    fireEvent.click(screen.getByRole('radio', { name: 'Online games' }));
    fireEvent.click(screen.getByRole('radio', { name: 'Absolute' }));

    expect(store.getState().ui.treeSource).toBe('online');
    expect(store.getState().ui.treeWinRateComparison).toBe('absolute');
  });

  it('clamps min frequency to the allowed range', () => {
    const { store } = renderWithProviders(<TreeSettings />);
    const minFreqInput = screen.getByRole('spinbutton', {
      name: 'Minimum move frequency percentage',
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
    const moveLimitInput = screen.getByRole('spinbutton', {
      name: 'Maximum moves shown per position',
    });

    fireEvent.change(moveLimitInput, { target: { value: '33' } });
    expect(store.getState().ui.treeMoveLimit).toBe(33);

    fireEvent.change(moveLimitInput, { target: { value: '-4' } });
    expect(store.getState().ui.treeMoveLimit).toBe(0);
  });

  it('uses current move limit to expand slider max when above default', () => {
    renderWithProviders(<TreeSettings />);

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Maximum moves shown per position' }), {
      target: { value: '34' },
    });

    const moveLimitRange = screen
      .getAllByRole('slider')
      .find((slider) => slider.getAttribute('step') === '1');

    expect(moveLimitRange).toBeDefined();
    expect(moveLimitRange).toHaveAttribute('max', '34');
  });

  it('persists collapsed state to localStorage', () => {
    vi.useFakeTimers();

    renderWithProviders(<TreeSettings />);

    fireEvent.click(screen.getByText('Tree Settings'));
    expect(localStorage.getItem('gtTreeOptionsCollapsed')).toBe('1');

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Data Source')).not.toBeInTheDocument();
  });
});