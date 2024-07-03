import { describe, it } from "vitest";
import { renderWithProviders } from "../../test/testUtils";
import Fen from "./Fen";
import { DEFAULT_POSITION } from "chess.js";

describe('Fen', () => {
  it('renders correct fen', () => {
    const { getByDisplayValue } = renderWithProviders(<Fen />);
    getByDisplayValue(DEFAULT_POSITION);
  })
});