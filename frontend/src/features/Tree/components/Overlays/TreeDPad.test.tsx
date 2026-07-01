import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { setupStore } from '@/store';
import { nav } from '@/store/slices';
import { renderWithProviders } from '@/test/renderWithProviders';

import { TreeDPad } from './TreeDPad';

describe('TreeDPad', () => {
  beforeEach(() => {
    localStorage.removeItem('gtNavCollapsed');
  });

  it('starts collapsed from localStorage and can expand', () => {
    localStorage.gtNavCollapsed = '1';

    renderWithProviders(<TreeDPad />);

    expect(screen.getByRole('button', { name: 'collapse' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'up' })).not.toHaveClass('opacity-0');

    fireEvent.click(screen.getByRole('button', { name: 'collapse' }));

    expect(screen.getByRole('button', { name: 'open tree nav' })).toBeInTheDocument();
    expect(localStorage.gtNavCollapsed).toBe('');
    expect(screen.getByRole('button', { name: 'up' })).toHaveClass('opacity-0');
  });

  it('starts expanded by default and persists collapse toggle', () => {
    renderWithProviders(<TreeDPad />);

    expect(screen.getByRole('button', { name: 'open tree nav' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'left' })).toHaveClass('opacity-0');

    fireEvent.click(screen.getByRole('button', { name: 'open tree nav' }));

    expect(screen.getByRole('button', { name: 'collapse' })).toBeInTheDocument();
    expect(localStorage.gtNavCollapsed).toBe('1');
    expect(screen.getByRole('button', { name: 'left' })).not.toHaveClass('opacity-0');
  });

  it('dispatches navigation intents for dpad directions', () => {
    localStorage.gtNavCollapsed = '1';
    const store = setupStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithProviders(<TreeDPad />, { store });

    fireEvent.click(screen.getByRole('button', { name: 'up' }));
    fireEvent.click(screen.getByRole('button', { name: 'down' }));
    fireEvent.click(screen.getByRole('button', { name: 'left' }));
    fireEvent.click(screen.getByRole('button', { name: 'right' }));

    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigatePrevSibling());
    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigateNextSibling());
    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigateUp());
    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigateDown());
    expect(dispatchSpy).toHaveBeenCalledTimes(4);
  });
});
