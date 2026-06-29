import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import Sidebar from './Sidebar';

const { positionInspectorMock } = vi.hoisted(() => ({
  positionInspectorMock: vi.fn(),
}));

vi.mock('@/features/PositionInspector', () => ({
  default: () => {
    positionInspectorMock();

    return <div data-testid="position-inspector" />;
  },
}));

describe('Sidebar', () => {
  it('renders PositionInspector as the compatibility boundary', () => {
    renderWithProviders(<Sidebar />);

    expect(screen.getByTestId('position-inspector')).toBeInTheDocument();
    expect(positionInspectorMock).toHaveBeenCalledTimes(1);
  });
});
