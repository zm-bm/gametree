import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import type { AppStore } from '../store';
import { setupStore } from '../store';

export interface RenderOptionsWithStore extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Parameters<typeof setupStore>[0];
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptionsWithStore = {}
) {
  const {
    preloadedState = {},
    store = setupStore(preloadedState),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}