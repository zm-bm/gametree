import { afterEach, beforeAll, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

beforeAll(() => {
  window.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  }))
  vi.mock('stockfish/src/stockfish-nnue-16.js?worker', () => ({
    default: vi.fn().mockImplementation(() => ({
      postMessage: vi.fn(),
    }))
  }))
})

afterEach(() => {
  cleanup();
})
