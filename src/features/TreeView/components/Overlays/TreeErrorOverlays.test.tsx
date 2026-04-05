import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import type { OpeningsQueryError } from '@/store/openingsApi';

import { TreeErrorOverlays } from './TreeErrorOverlays';

describe('TreeErrorOverlays', () => {
  it('renders nothing when there is no displayable error state', () => {
    const { container } = render(
      <TreeErrorOverlays
        hasTree={false}
        isError={false}
        isFetching={false}
        onRetry={vi.fn()}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('renders initial tree load error and retries', () => {
    const onRetry = vi.fn();
    const error = { status: 429, data: {} } as OpeningsQueryError;

    render(
      <TreeErrorOverlays
        hasTree={false}
        isError
        isFetching={false}
        error={error}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Unable to load tree')).toBeInTheDocument();
    expect(
      screen.getByText('The openings service is rate limiting requests. Please retry shortly.')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('renders expansion error banner with retry button', () => {
    const onRetry = vi.fn();

    render(
      <TreeErrorOverlays
        hasTree
        isError
        isFetching={false}
        error={{ status: 'FETCH_ERROR', error: 'network' } as OpeningsQueryError}
        onRetry={onRetry}
      />
    );

    expect(screen.getByText('Could not load additional moves (request failed).')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry loading additional moves' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render expansion error while fetching', () => {
    render(
      <TreeErrorOverlays
        hasTree
        isError
        isFetching
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole('button', { name: 'Retry loading additional moves' })).not.toBeInTheDocument();
  });
});
