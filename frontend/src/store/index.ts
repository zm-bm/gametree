import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { useDispatch } from 'react-redux';

import { engine, ui, tree, nav } from './slices'
import { openingsApi } from './openingsApi';
import { theoryApi } from './theoryApi';
import { listenerMiddleware } from './listener';
import { initializeEngine } from '../worker';

export const rootReducer = combineReducers({
  engine: engine.reducer,
  ui: ui.reducer,
  tree: tree.reducer,
  nav: nav.reducer,
  [openingsApi.reducerPath]: openingsApi.reducer,
  [theoryApi.reducerPath]: theoryApi.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type PreloadedState = Parameters<typeof rootReducer>[0];

export function setupStore(preloadedState?: PreloadedState) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefault) =>
      getDefault()
        .prepend(listenerMiddleware.middleware)
        .concat([openingsApi.middleware, theoryApi.middleware]),
    preloadedState
  });
}

export const store = setupStore();
setupListeners(store.dispatch);

initializeEngine();

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
export const useAppDispatch = () => useDispatch<AppDispatch>();

import './listeners';
