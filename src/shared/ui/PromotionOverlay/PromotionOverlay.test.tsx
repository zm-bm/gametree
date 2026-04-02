import { describe, expect, it } from 'vitest';

import { renderWithProviders } from '@/test/renderWithProviders';
import PromotionOverlay from './PromotionOverlay';

describe('PromotionOverlay', () => {
  it('renders nothing by default', () => {
    const { container } = renderWithProviders(<PromotionOverlay size={400} />);
    expect(container.firstChild).toBeNull();
  });
});