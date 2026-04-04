import { describe, expect, it } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import ToggleOrientationButton from './ToggleOrientationButton';

describe('ToggleOrientationButton', () => {
  it('toggles board orientation when clicked', () => {
    const { store } = renderWithProviders(<ToggleOrientationButton />);

    expect(store.getState().ui.boardOrientation).toBe('white');

    fireEvent.click(screen.getByTitle('Flip board'));
    expect(store.getState().ui.boardOrientation).toBe('black');

    fireEvent.click(screen.getByTitle('Flip board'));
    expect(store.getState().ui.boardOrientation).toBe('white');
  });
});
