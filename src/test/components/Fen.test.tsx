import { describe, it } from "vitest";
import { renderWithProviders } from "../testUtils";
import Fen from "../../features/ChessPanel/components/Fen";
import { DEFAULT_POSITION } from "chess.js";

describe('Fen', () => {
  it('renders correct fen', () => {
    const { getByDisplayValue } = renderWithProviders(<Fen />);
    getByDisplayValue(DEFAULT_POSITION);
  })
});