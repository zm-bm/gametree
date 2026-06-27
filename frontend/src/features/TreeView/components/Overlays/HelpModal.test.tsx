import { describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { render } from '@testing-library/react';

import { HelpModal } from './HelpModal';

describe('HelpModal', () => {
  it('does not render when closed', () => {
    render(
      <HelpModal isOpen={false} title="Tree Help" onClose={vi.fn()}>
        <p>Body</p>
      </HelpModal>
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText('Body')).not.toBeInTheDocument();
  });

  it('renders dialog content and custom labels when open', () => {
    render(
      <HelpModal
        isOpen
        title="Tree Help"
        onClose={vi.fn()}
        dismissLabel="Close"
        maxWidthClassName="max-w-2xl"
      >
        <p>Keyboard shortcuts</p>
      </HelpModal>
    );

    expect(screen.getByRole('dialog', { name: 'Tree Help' })).toBeInTheDocument();
    expect(screen.getByText('Keyboard shortcuts')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close help' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveClass('max-w-2xl');
  });

  it('calls onClose from close button and dismiss button', () => {
    const onClose = vi.fn();
    render(
      <HelpModal isOpen title="Tree Help" onClose={onClose}>
        <p>Body</p>
      </HelpModal>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close help' }));
    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('calls onClose on escape', () => {
    const onClose = vi.fn();
    render(
      <HelpModal isOpen title="Tree Help" onClose={onClose}>
        <p>Body</p>
      </HelpModal>
    );

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes only when clicking backdrop, not dialog content', () => {
    const onClose = vi.fn();
    render(
      <HelpModal isOpen title="Tree Help" onClose={onClose}>
        <p>Body</p>
      </HelpModal>
    );

    fireEvent.mouseDown(screen.getByRole('dialog'));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
