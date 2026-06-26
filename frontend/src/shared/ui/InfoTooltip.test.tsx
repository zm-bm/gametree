import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { InfoTooltip } from './InfoTooltip';

function renderTooltip(interaction: 'hover' | 'click' | 'hybrid' = 'hybrid') {
  return render(
    <InfoTooltip
      text="Helpful explanation"
      ariaLabel="More info"
      interaction={interaction}
    />
  );
}

describe('InfoTooltip', () => {
  it('opens on hover in hybrid mode and closes on mouse leave', () => {
    renderTooltip('hybrid');

    const trigger = screen.getByRole('button', { name: 'More info' });

    fireEvent.mouseEnter(trigger);
    expect(screen.getByRole('tooltip')).toHaveTextContent('Helpful explanation');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    fireEvent.mouseLeave(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('toggles pinned open state on click mode and closes on outside pointerdown', () => {
    renderTooltip('click');

    const trigger = screen.getByRole('button', { name: 'More info' });

    fireEvent.click(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.pointerDown(document.body);
    expect(screen.queryByRole('tooltip')).toBeNull();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not open from hover in click-only mode', () => {
    renderTooltip('click');

    const trigger = screen.getByRole('button', { name: 'More info' });

    fireEvent.mouseEnter(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('does not pin open from click in hover-only mode', () => {
    renderTooltip('hover');

    const trigger = screen.getByRole('button', { name: 'More info' });

    fireEvent.click(trigger);
    expect(screen.queryByRole('tooltip')).toBeNull();

    fireEvent.focus(trigger);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    fireEvent.keyDown(trigger, { key: 'Escape' });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });
});
