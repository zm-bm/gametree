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
  });

  it('auto-opens help when not previously seen', async () => {
    render(<TreeHelp />);

    expect(await screen.findByTestId('help-modal-mock')).toBeInTheDocument();
    expect(screen.getByText('Tree Help')).toBeInTheDocument();
  });

  it('does not auto-open when help was already seen', () => {
    localStorage.setItem('gtTreeHelpSeen', '1');

    render(<TreeHelp />);

    expect(screen.queryByTestId('help-modal-mock')).not.toBeInTheDocument();
  });

  it('opens from help button and marks help as seen when closed', () => {
    localStorage.setItem('gtTreeHelpSeen', '1');

    render(<TreeHelp />);

    fireEvent.click(screen.getByRole('button', { name: 'Open help' }));
    expect(screen.getByTestId('help-modal-mock')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Close mock modal' }));
    expect(localStorage.getItem('gtTreeHelpSeen')).toBe('1');
    expect(screen.queryByTestId('help-modal-mock')).not.toBeInTheDocument();
  });
});
