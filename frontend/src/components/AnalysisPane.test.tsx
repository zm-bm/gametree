import { describe, expect, it } from 'vitest';
import { screen, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../testUtils'
import AnalysisPane from './AnalysisPane';

describe('AnalysisPane', () => {
  it('renders buttons', () => {
    renderWithProviders(<AnalysisPane />)

    expect(screen.getByRole('button', { name: 'GAME' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ENGINE' })).toBeInTheDocument();
  })

  it('buttons work', () => {
    renderWithProviders(<AnalysisPane />)

    const btn = screen.getByRole('button', { name: 'GAME' });
    fireEvent.click(btn);
    expect(screen.getByText(/Game tab/))
  })
})

