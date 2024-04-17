import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react'
import App from '../../src/components/App'
import Engine from '../../src/engine';

vi.mock('../../src/engine', () => ({
  default: vi.fn().mockImplementation(() => ({
    addDispatch: vi.fn(),
    postMessage: vi.fn(),
  }))
}))

describe('App', () => {
  let engineMock: Engine;

  beforeEach(() => {
    engineMock = new Engine();
  })

  it('renders the App component', () => {
    render(<App />)
    expect(screen.getByRole('main')).toBeInTheDocument();
  })
})
