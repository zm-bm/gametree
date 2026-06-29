import { describe, expect, it, beforeEach, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import App from './App';

const useKeyboardActionsMock = vi.fn();

vi.mock('./shared/hooks', () => ({
  useKeyboardActions: () => useKeyboardActionsMock(),
}));

vi.mock('./features/AppShell', () => ({
  default: () => <div data-testid="app-shell">App shell</div>,
}));

describe('App', () => {
  beforeEach(() => {
    useKeyboardActionsMock.mockClear();
  });

  it('wires global keyboard actions and renders the app shell', () => {
    renderWithProviders(<App />);

    expect(useKeyboardActionsMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });
});
