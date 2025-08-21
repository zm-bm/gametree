import { Middleware } from 'redux';
import { restartWorker, worker, intputUCI } from '../worker';
import { RootState } from './store';
import { DEFAULT_POSITION } from 'chess.js';
import { EngineError, ToggleEngine, SetHash, SetThreads, SetLines, EngineAction, UpdateFen } from './engineSlice';
import { SetDataSource, TreeAction } from './treeSlice';

export const setOption = (name: string, value: string | number) =>
  `setoption name ${name} value ${value}`;
export const setPos = (fen: string) => `position fen ${fen}`;

type WorkerAction = EngineAction | TreeAction;

export const createEngineMiddleware = (): Middleware => {

  const updateEngine = (cmd: string, state: RootState) => {
    if (state.engine.running) {
      intputUCI('stop');
    }
    intputUCI(cmd);
    if (state.engine.running) {
      intputUCI('go infinite');
    }
  }

  return (store) => (next) => (action) => {
    const state = store.getState();
    const workerAction = action as WorkerAction;

    switch (workerAction.type) {
      case EngineError.type:
        if (workerAction.payload.includes('OOM')) {
          worker.terminate();
          restartWorker({ ...state.engine, threads: state.engine.threads / 2 });
        }
        break;
      case ToggleEngine.type:
        intputUCI(state.engine.running ? 'stop' : 'go infinite');
        break;
      case SetHash.type:
        updateEngine(setOption('Hash', workerAction.payload), state);
        break;
      case SetThreads.type:
        updateEngine(setOption('Threads', workerAction.payload), state);
        break;
      case SetLines.type:
        updateEngine(setOption('MultiPV', workerAction.payload), state);
        break;
      case UpdateFen.type:
        updateEngine(setPos(workerAction.payload), state);
        break;
      case SetDataSource.type:
        updateEngine(setPos(DEFAULT_POSITION), state);
        break;
      default:
        break;
    }
    return next(action);
  };
};
