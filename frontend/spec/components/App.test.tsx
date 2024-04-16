import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react'
import App from '../../src/components/App'

describe('App', () => {
  it('renders the App component', () => {
    render(<App />)
    
    expect(screen.getByRole('main')).toBeInTheDocument();
  })
})
