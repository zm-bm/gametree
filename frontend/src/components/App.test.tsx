import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test/testUtils'
import App from './App'

describe('App', () => {
  it('renders successfully', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument();
  })
})
