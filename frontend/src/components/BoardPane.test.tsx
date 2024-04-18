import { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react'
import BoardPane from './BoardPane'

vi.mock('../hooks/useDimensions', () => ({
  useDimensions: vi.fn(() => [useRef(), { width: 404, height: 404 }])
}));

describe('Board', () => {
  it('renders board wrapper', () => {
    render(<BoardPane />)
    
    expect(screen.getByTestId('board-wrapper').style.height).toEqual('400px')
    expect(screen.getByTestId('board-wrapper').style.width).toEqual('400px')
  })
})

