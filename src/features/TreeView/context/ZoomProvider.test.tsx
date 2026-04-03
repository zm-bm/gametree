import { describe, expect, it } from 'vitest';
import { useContext } from 'react';
import { render, screen } from '@testing-library/react';

import { createTestZoom } from '../testUtils';
import { ZoomContext } from './ZoomContext';
import { ZoomProvider } from './ZoomProvider';

const ZoomConsumer = () => {
  const { zoom, transformRef } = useContext(ZoomContext);
  return (
    <div
      data-testid="zoom-consumer"
      data-zoom-scale={zoom.transformMatrix.scaleX}
      data-ref-scale={transformRef.current.scaleX}
      data-zoom-translate-x={zoom.transformMatrix.translateX}
      data-ref-translate-x={transformRef.current.translateX}
    />
  );
};

describe('ZoomProvider', () => {
  it('provides zoom and transformRef values to context consumers', () => {
    render(
      <ZoomProvider zoom={createTestZoom(2, 10)}>
        <ZoomConsumer />
      </ZoomProvider>
    );

    const consumer = screen.getByTestId('zoom-consumer');
    expect(consumer).toHaveAttribute('data-zoom-scale', '2');
    expect(consumer).toHaveAttribute('data-ref-scale', '2');
    expect(consumer).toHaveAttribute('data-zoom-translate-x', '10');
    expect(consumer).toHaveAttribute('data-ref-translate-x', '10');
  });

  it('updates transformRef after transform matrix changes', () => {
    const { rerender } = render(
      <ZoomProvider zoom={createTestZoom(2, 10)}>
        <ZoomConsumer />
      </ZoomProvider>
    );

    rerender(
      <ZoomProvider zoom={createTestZoom(3, 25)}>
        <ZoomConsumer />
      </ZoomProvider>
    );

    // transformRef updates in a layout effect after render; one more render reflects it.
    rerender(
      <ZoomProvider zoom={createTestZoom(3, 25)}>
        <ZoomConsumer />
      </ZoomProvider>
    );

    const consumer = screen.getByTestId('zoom-consumer');
    expect(consumer).toHaveAttribute('data-zoom-scale', '3');
    expect(consumer).toHaveAttribute('data-ref-scale', '3');
    expect(consumer).toHaveAttribute('data-zoom-translate-x', '25');
    expect(consumer).toHaveAttribute('data-ref-translate-x', '25');
  });
});