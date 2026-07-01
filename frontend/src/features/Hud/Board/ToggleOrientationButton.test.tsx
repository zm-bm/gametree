import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import ToggleOrientationButton from './ToggleOrientationButton';

describe('ToggleOrientationButton', () => {
  it('toggles board orientation when clicked', () => {
    const { store } = renderWithProviders(<ToggleOrientationButton />);
    const button = screen.getByRole('button', { name: 'Flip board' });

    expect(store.getState().ui.boardOrientation).toBe('white');
    expect(button).not.toHaveAttribute('title');

    fireEvent.click(button);
    expect(store.getState().ui.boardOrientation).toBe('black');

    fireEvent.click(button);
    expect(store.getState().ui.boardOrientation).toBe('white');
  });
});
