import React, { PropsWithChildren } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import type { AppStore, PreloadedState } from '../store';
import { setupStore } from '../store';

type StrictPreloadedState = NonNullable<PreloadedState>;
export type TestPreloadedState = {
  engine?: Partial<StrictPreloadedState['engine']>;
  ui?: Partial<StrictPreloadedState['ui']>;
  tree?: Partial<StrictPreloadedState['tree']>;
  nav?: StrictPreloadedState['nav'];
};

export function mergePreloadedState(preloadedState: TestPreloadedState = {}): PreloadedState {
  const defaultPreloadedState = setupStore().getState();

  return {
    ...defaultPreloadedState,
    ...preloadedState,
    engine: {
      ...defaultPreloadedState.engine,
      ...preloadedState.engine,
    },
    ui: {
      ...defaultPreloadedState.ui,
      ...preloadedState.ui,
    },
    tree: {
      ...defaultPreloadedState.tree,
      ...preloadedState.tree,
    },
    nav: preloadedState.nav ?? defaultPreloadedState.nav,
  };
}

export function setupTestStore(preloadedState?: TestPreloadedState) {
  return setupStore(mergePreloadedState(preloadedState));
}

export interface RenderOptionsWithStore extends Omit<RenderOptions, 'queries'> {
  preloadedState?: TestPreloadedState;
  store?: AppStore;
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: RenderOptionsWithStore = {}
) {
  const {
    preloadedState = {},
    store = setupTestStore(preloadedState),
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