import React, { useRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react'
import Board from '../../src/components/Board'

vi.mock('../../src/hooks', () => ({
  useDimensions: vi.fn(() => [useRef(), { width: 404, height: 404 }])
}));

describe('Board', () => {
  it('renders board wrapper', () => {
    render(<Board />)
    
    expect(screen.getByTestId('board-wrapper').style.height).toEqual('400px')
    expect(screen.getByTestId('board-wrapper').style.width).toEqual('400px')
  })
})

