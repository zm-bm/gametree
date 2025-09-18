import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { engine, ui, tree, nav } from './slices'
import { openingsApi } from './openingsApi';
import { listenerMiddleware } from './listener';
import { initializeEngine } from '../worker';

const rootReducer = combineReducers({
  engine: engine.reducer,
  ui: ui.reducer,
  tree: tree.reducer,
  nav: nav.reducer,
  [openingsApi.reducerPath]: openingsApi.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefault) =>
      getDefault()
        .prepend(listenerMiddleware.middleware)
        .concat([openingsApi.middleware]),
    preloadedState
  });
}

export const store = setupStore();
setupListeners(store.dispatch);

initializeEngine();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

import './listeners';

