import { combineReducers, configureStore } from '@reduxjs/toolkit';
import engineReducer from './features/engineSlice';
import { initializeWorker } from './worker';
import { createWorkerMiddleware } from './storeMiddleware';

const worker = initializeWorker();
const workerMiddleware = createWorkerMiddleware(worker);

const rootReducer = combineReducers({
  engine: engineReducer,
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
