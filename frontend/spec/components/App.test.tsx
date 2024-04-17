import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../testUtils'
import App from '../../src/components/App'

describe('App', () => {
  it('renders the App component', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument();
  })
})
