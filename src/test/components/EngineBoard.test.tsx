import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../testUtils";
import EngineBoard from "../../features/Sidebar/components/EngineBoard";

const props = {
  size: 320,
  config: {},
  isHovered: true,
  coords: { top: 0, left: 0 },
}

describe('EngineBoard', () => {
  it('renders correctly with isHovered=true', () => {
    const { container } = renderWithProviders(<EngineBoard {...props} />);
    expect(container.firstChild).toHaveClass('visible')
  });

  it('renders correctly with isHovered=false', () => {
    const { container } = renderWithProviders(<EngineBoard {...props} isHovered={false} />);
    expect(container.firstChild).toHaveClass('hidden')
  });
});
