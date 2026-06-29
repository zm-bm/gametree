import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { TreeHelp } from './TreeHelp';

vi.mock('../TreeNode', () => ({
  TreeNode: () => <g data-testid="tree-node-mock" />,
}));

vi.mock('../SVGDefs', () => ({
  SVGDefs: () => <defs data-testid="svg-defs-mock" />,
}));

vi.mock('./HelpModal', () => ({
  HelpModal: ({
    isOpen,
    title,
    onClose,
    children,
  }: {
    isOpen: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
  }) => {
    if (!isOpen) return null;

    return (
      <div data-testid="help-modal-mock">
        <h2>{title}</h2>
        <button type="button" onClick={onClose}>
          Close mock modal
        </button>
        <div>{children}</div>
      </div>
    );
  },
}));

describe('TreeHelp', () => {
  beforeEach(() => {
    localStorage.removeItem('gtTreeHelpSeen');
    localStorage.removeItem('gtTreeHintDismissed');
  });

  it('shows the first-run hint without auto-opening help', () => {
    render(<TreeHelp />);

    expect(screen.getByRole('note', { name: 'Tree explorer hint' })).toBeInTheDocument();
    expect(screen.getByText('Explore the tree')).toBeInTheDocument();
    expect(screen.getByText(
      'Click a move to follow it. Thicker lines are played more often; line color shows how that move scores.'
    )).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Got it' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Learn' })).toBeInTheDocument();
    expect(screen.queryByTestId('help-modal-mock')).not.toBeInTheDocument();
  });

  it('dismisses and persists the first-run hint', () => {
    render(<TreeHelp />);

    fireEvent.click(screen.getByRole('button', { name: 'Got it' }));

    expect(localStorage.getItem('gtTreeHintDismissed')).toBe('1');
    expect(screen.queryByRole('note', { name: 'Tree explorer hint' })).not.toBeInTheDocument();
  });

  it('does not show the hint when it was already dismissed', () => {
    localStorage.setItem('gtTreeHintDismissed', '1');

    render(<TreeHelp />);

    expect(screen.queryByRole('note', { name: 'Tree explorer hint' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('help-modal-mock')).not.toBeInTheDocument();
  });

  it('does not show the hint when help was already seen', () => {
    localStorage.setItem('gtTreeHelpSeen', '1');

    render(<TreeHelp />);

    expect(screen.queryByRole('note', { name: 'Tree explorer hint' })).not.toBeInTheDocument();
    expect(screen.queryByTestId('help-modal-mock')).not.toBeInTheDocument();
  });

  it('opens help from the hint learn action and dismisses the hint', () => {
    render(<TreeHelp />);

    fireEvent.click(screen.getByRole('button', { name: 'Learn' }));

    expect(localStorage.getItem('gtTreeHintDismissed')).toBe('1');
    expect(screen.queryByRole('note', { name: 'Tree explorer hint' })).not.toBeInTheDocument();
    expect(screen.getByTestId('help-modal-mock')).toBeInTheDocument();
  });

  it('opens from help button, dismisses the hint, and marks help as seen when closed', () => {
    render(<TreeHelp />);

    fireEvent.click(screen.getByRole('button', { name: 'Open help' }));
    expect(localStorage.getItem('gtTreeHintDismissed')).toBe('1');
    expect(screen.queryByRole('note', { name: 'Tree explorer hint' })).not.toBeInTheDocument();
    expect(screen.getByTestId('help-modal-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close mock modal' }));
    expect(localStorage.getItem('gtTreeHelpSeen')).toBe('1');
    expect(screen.queryByTestId('help-modal-mock')).not.toBeInTheDocument();
  });
});
