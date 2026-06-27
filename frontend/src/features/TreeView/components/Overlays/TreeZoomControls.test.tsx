import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TreeZoomControls } from './TreeZoomControls';

describe('TreeZoomControls', () => {
  it('renders zoom control buttons', () => {
    render(<TreeZoomControls handleZoom={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeInTheDocument();
  });

  it('calls handleZoom with in and out directions', () => {
    const handleZoom = vi.fn();

    render(<TreeZoomControls handleZoom={handleZoom} />);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));

    expect(handleZoom).toHaveBeenCalledTimes(2);
    expect(handleZoom).toHaveBeenNthCalledWith(1, 'in');
    expect(handleZoom).toHaveBeenNthCalledWith(2, 'out');
  });
});
