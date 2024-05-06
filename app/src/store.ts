import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createEngineMiddleware } from './redux/engineMiddleware';
import engineOutputReducer from './redux/engineSlice';
import gameReducer from './redux/gameSlice';
import treeReducer from './redux/treeSlice';
import { initEngineOptions } from './worker';
import { openingsApi } from './redux/openingsApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const engineMiddleware = createEngineMiddleware();

const rootReducer = combineReducers({
  engine: engineOutputReducer,
  game: gameReducer,
  tree: treeReducer,
  [openingsApi.reducerPath]: openingsApi.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        [engineMiddleware, openingsApi.middleware]
      ),
    preloadedState
  });
}

export const store = setupStore();
initEngineOptions(store.getState().engine);
setupListeners(store.dispatch);

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
