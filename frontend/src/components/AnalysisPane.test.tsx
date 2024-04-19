import { describe, expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/testUtils'
import AnalysisPane from './AnalysisPane';
import { rootNode } from '../redux/gameSlice';
import { Chess } from 'chess.js';

describe('AnalysisPane', () => {
  it('renders buttons', () => {
    renderWithProviders(<AnalysisPane />)

    expect(screen.getByRole('button', { name: 'GAME' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ENGINE' })).toBeInTheDocument();
  })

  it('buttons work', () => {
    const game = {
      moveTree: [{
        ...rootNode,
        children: [1],
      }, {
        key: 1,
        move: (new Chess().move('e2e4')),
        parent: 0,
        children: [],
      }],
      key: 0,
    }
    renderWithProviders(<AnalysisPane />, { preloadedState: { game } })

    const btn = screen.getByRole('button', { name: 'GAME' });
    fireEvent.click(btn);
    expect(screen.getByText(/e4/))
  })
})

