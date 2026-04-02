import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';
import App from './App';

describe('App', () => {
  it('renders successfully', () => {
    renderWithProviders(<App />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});