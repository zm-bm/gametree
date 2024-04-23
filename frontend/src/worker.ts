import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker'
import { store } from './store';
import { EngineState, UCI_ENGINE_ERROR, UCI_ENGINE_OUTPUT } from './redux/engineSlice';
import { setOption } from './lib/helpers';

export const initializeWorker = () => {
  const worker = new Stockfish();
  worker.addEventListener('error', (e) => { console.log(e) })

  worker.onmessage = (event) => {
    console.log('> ', event.data);
    store.dispatch(UCI_ENGINE_OUTPUT(event.data));
  };

  worker.onerror = (error) => {
    console.error('Worker error:', error);
    store.dispatch(UCI_ENGINE_ERROR(error.message));
  };

  return worker;
};

export const write = (cmd: string) => {
  console.log('< ', cmd);
  worker.postMessage(cmd);
};

export const initEngineOptions = (state: EngineState) => {
  write('uci')
  write(setOption('Use NNUE', 'true'))
  configEngineOptions(state)
}

export const configEngineOptions = (state: EngineState) => {
  write(setOption('Hash', state.hash))
  write(setOption('Threads', state.threads))
  write(setOption('MultiPV', state.lines))
}

export function restartWorker(state: EngineState) {
  worker = initializeWorker()
  initEngineOptions(state)
}

export var worker = initializeWorker();
(window as any).worker = worker
