import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TreeZoomControls } from './TreeZoomControls';

describe('TreeZoomControls', () => {
  it('renders zoom control buttons', () => {
    render(<TreeZoomControls handleZoom={vi.fn()} />);

    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    const zoomOut = screen.getByRole('button', { name: 'Zoom out' });
    expect(zoomIn).toBeInTheDocument();
    expect(zoomOut).toBeInTheDocument();
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
