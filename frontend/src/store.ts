import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { initializeWorker } from './worker';
import { createWorkerMiddleware } from './redux/storeMiddleware';
import engineReducer from './redux/engineSlice';
import boardReducer from './redux/boardSlice';

const worker = initializeWorker();
const workerMiddleware = createWorkerMiddleware(worker);

const rootReducer = combineReducers({
  engine: engineReducer,
  board: boardReducer,
})

export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(workerMiddleware),
    preloadedState
  })
}
export const store = setupStore();

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch'];
