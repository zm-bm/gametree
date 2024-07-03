import { describe, it } from "vitest";

import { renderWithProviders } from "../../test/testUtils";
import { initialState } from "../../redux/engineSlice";
import EngineHeader from "./EngineHeader";

describe('EngineHeader', () => {
  it('renders engine info', () => {
    const { getByText } = renderWithProviders(<EngineHeader />, {
      preloadedState: {
        engine: {
          ...initialState,
          speed: 3100000,
          time: 1500,
          hashfull: 100,
          tbhits: 42,
        }
      }
    });
    getByText('1.5 s');
    getByText('3.1M n/s');
    getByText('10.0 %');
    getByText('42');
  })
});

