import { describe, it, vi } from "vitest";
import { renderWithProviders } from "../../test/testUtils";
import { EngineInfoMove } from "../../features/Sidebar/components/EngineInfoMove";
import { Move } from "chess.js";

const props = {
  onMouseEnter: vi.fn(),
  onMouseMove: vi.fn(),
  onMouseLeave: vi.fn(),
};

const wMove: Move = {
  color: 'w',
  piece: 'p',
  from: 'e2',
  to: 'e4',
  san: 'e4',
  lan: 'e2e4',
  before: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  after: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1'
};
const bMove: Move = {
  color: 'b',
  piece: 'p',
  from: 'd7',
  to: 'd5',
  san: 'd5',
  lan: 'd7d5',
  before: 'rnbqkbnr/pppppppp/8/8/3P4/8/PPP1PPPP/RNBQKBNR b KQkq - 0 1',
  after: 'rnbqkbnr/ppp1pppp/8/3p4/3P4/8/PPP1PPPP/RNBQKBNR w KQkq - 0 2'
};

describe('EngineInfoMove', () => {
  it('renders 1.e4', () => {
    const { getByText } = renderWithProviders(<EngineInfoMove {...props} move={wMove} />)
    getByText('1.e4')
  });

  it('renders d5', () => {
    const { getByText } = renderWithProviders(<EngineInfoMove {...props} move={bMove} />)
    getByText('d5')
  });
});
