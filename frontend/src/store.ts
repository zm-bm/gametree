import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWorkerMiddleware } from './redux/storeMiddleware';
import engineReducer from './redux/engineSlice';
import boardReducer from './redux/boardSlice';
import gameReducer from './redux/gameSlice';
import { initEngineOptions } from './worker';
import { openingsApi } from './redux/openingsApi';
import { setupListeners } from '@reduxjs/toolkit/query';

const workerMiddleware = createWorkerMiddleware();

const rootReducer = combineReducers({
  engine: engineReducer,
  board: boardReducer,
  game: gameReducer,
  [openingsApi.reducerPath]: openingsApi.reducer,
});

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        [workerMiddleware, openingsApi.middleware]
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
