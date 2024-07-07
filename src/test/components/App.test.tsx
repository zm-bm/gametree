import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../testUtils'
import App from '../../components/App'

describe('App', () => {
  it('renders successfully', () => {
    renderWithProviders(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument();
  })
})
