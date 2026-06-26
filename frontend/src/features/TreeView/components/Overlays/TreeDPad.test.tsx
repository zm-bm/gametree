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

    expect(screen.getByTitle('collapse')).toBeInTheDocument();
    expect(screen.getByTitle('up')).not.toHaveClass('opacity-0');

    fireEvent.click(screen.getByTitle('collapse'));

    expect(screen.getByTitle('open tree nav')).toBeInTheDocument();
    expect(localStorage.gtNavCollapsed).toBe('');
    expect(screen.getByTitle('up')).toHaveClass('opacity-0');
  });

  it('starts expanded by default and persists collapse toggle', () => {
    renderWithProviders(<TreeDPad />);

    expect(screen.getByTitle('open tree nav')).toBeInTheDocument();
    expect(screen.getByTitle('left')).toHaveClass('opacity-0');

    fireEvent.click(screen.getByTitle('open tree nav'));

    expect(screen.getByTitle('collapse')).toBeInTheDocument();
    expect(localStorage.gtNavCollapsed).toBe('1');
    expect(screen.getByTitle('left')).not.toHaveClass('opacity-0');
  });

  it('dispatches navigation intents for dpad directions', () => {
    localStorage.gtNavCollapsed = '1';
    const store = setupStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    renderWithProviders(<TreeDPad />, { store });

    fireEvent.click(screen.getByTitle('up'));
    fireEvent.click(screen.getByTitle('down'));
    fireEvent.click(screen.getByTitle('left'));
    fireEvent.click(screen.getByTitle('right'));

    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigatePrevSibling());
    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigateNextSibling());
    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigateUp());
    expect(dispatchSpy).toHaveBeenCalledWith(nav.actions.navigateDown());
    expect(dispatchSpy).toHaveBeenCalledTimes(4);
  });
});
