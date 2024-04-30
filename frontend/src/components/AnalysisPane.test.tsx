import { describe, expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../test/testUtils'
import AnalysisPane from './AnalysisPane';
import { GameState, rootNode } from '../redux/gameSlice';
import { Chess } from 'chess.js';

describe('AnalysisPane', () => {
  it('renders buttons', () => {
    renderWithProviders(<AnalysisPane />)

    expect(screen.getByRole('button', { name: 'GAME' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ENGINE' })).toBeInTheDocument();
  })

  it('buttons work', () => {
    const move = new Chess().move('e2e4')
    const game: GameState = {
      moveTree: [{
        ...rootNode,
        children: [1],
      }, {
        key: 1,
        move,
        parent: 0,
        children: [],
      }],
      moveList: [move],
      key: 0,
    }
    renderWithProviders(<AnalysisPane />, { preloadedState: { game } })

    const btn = screen.getByRole('button', { name: 'GAME' });
    fireEvent.click(btn);
    expect(screen.getByText(/e4/))
  })
})

