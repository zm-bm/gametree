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
    expect(screen.queryByRole('button', { name: 'Center current' })).not.toBeInTheDocument();
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

  it('renders and calls Center current when provided', () => {
    const onCenterCurrent = vi.fn();

    render(<TreeZoomControls handleZoom={vi.fn()} onCenterCurrent={onCenterCurrent} />);

    fireEvent.click(screen.getByRole('button', { name: 'Center current' }));

    expect(onCenterCurrent).toHaveBeenCalledTimes(1);
  });
});
