import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWorkerMiddleware } from './redux/storeMiddleware';
import engineReducer from './redux/engineSlice';
import boardReducer from './redux/boardSlice';
import gameReducer from './redux/gameSlice';
import { initEngineOptions } from './worker';
import openingsSlice, { fetchOpenings } from './redux/openingsSlice';

const workerMiddleware = createWorkerMiddleware();

const rootReducer = combineReducers({
  engine: engineReducer,
  board: boardReducer,
  game: gameReducer,
  openings: openingsSlice,
})

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(workerMiddleware),
    preloadedState
  })
}
export const store = setupStore()
initEngineOptions(store.getState().engine)

store.dispatch(fetchOpenings('./eco_nested.json'))

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch'];
