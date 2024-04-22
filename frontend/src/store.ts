import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { createWorkerMiddleware } from './redux/storeMiddleware';
import { initializeWorker } from './worker';
import engineReducer, { EngineState } from './redux/engineSlice';
import boardReducer from './redux/boardSlice';
import gameReducer from './redux/gameSlice';
import { setOption } from './helpers';

export var worker = initializeWorker();
(window as any).worker = worker
export function restartWorker(state: EngineState) {
  worker = initializeWorker()
  initEngineOptions(worker, state)
}
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

const initEngineOptions = (worker: Worker, state: EngineState) => {
  worker.postMessage('uci')
  worker.postMessage(setOption('Use NNUE', 'true'))
  worker.postMessage(setOption('Hash', 1))
  worker.postMessage(setOption('Threads', state.threads))
  worker.postMessage(setOption('MultiPV', state.lines))
}
initEngineOptions(worker, store.getState().engine)

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>
export type AppDispatch = AppStore['dispatch'];
