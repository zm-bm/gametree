import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWorkerMiddleware } from './redux/storeMiddleware';
import { initializeWorker } from './worker';
import engineReducer from './redux/engineSlice';
import boardReducer from './redux/boardSlice';
import gameReducer from './redux/gameSlice';
import { setOption } from './helpers';

export var worker = initializeWorker();
export function restartWorker() {
  worker = initializeWorker()
  initEngineOptions()
}
(window as any).worker = worker
const workerMiddleware = createWorkerMiddleware();

const rootReducer = combineReducers({
  engine: engineReducer,
  board: boardReducer,
  game: gameReducer,
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

const initEngineOptions = () => {
  const state = store.getState()
  worker.postMessage(setOption('Use NNUE', 'true'))
  worker.postMessage(setOption('Hash', state.engine.hash))
  worker.postMessage(setOption('Threads', state.engine.threads))
  worker.postMessage(setOption('MultiPV', state.engine.lines))
}
initEngineOptions()

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch'];
