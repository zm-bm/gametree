import 'stockfish/src/stockfish-nnue-16.wasm?init';
import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker'

import { store } from './store';
import { engine } from './store/slices';
import {
  selectBoardFen,
  selectEngineDepth,
  selectEngineHash,
  selectEngineThreads,
  selectEngineTime
} from './store/selectors';

let worker: Worker;

const isEngineInfo = (line: string) => {
  return (
    line.startsWith('info')
    && line.includes(' pv ')
    && !line.includes('upperbound')
    && !line.includes('lowerbound')
  );
}

const onmessage = (event: MessageEvent) => {
  if (isEngineInfo(event.data)) {
    store.dispatch(engine.actions.reportEngineOutput(event.data));
  }
};

const onerror = (error: ErrorEvent) => {
  store.dispatch(engine.actions.reportEngineError(error.message));
};

export const initializeEngine = () => {
  worker = new Stockfish();
  worker.onmessage = onmessage;
  worker.onerror = onerror;
  worker.postMessage('uci');
};

export const startEngine = () => {
  const state = store.getState();
  const fen = selectBoardFen(state);
  const hash = selectEngineHash(state);
  const threads = selectEngineThreads(state);
  const depth = selectEngineDepth(state);
  const time = selectEngineTime(state);

  worker.postMessage('stop');
  worker.postMessage(`setoption name Hash value ${hash}`);
  worker.postMessage(`setoption name Threads value ${threads}`);
  worker.postMessage(`position fen ${fen}`);
  worker.postMessage(`go depth ${depth} movetime ${time}`);
}

export const stopEngine = () => {
  worker.postMessage('stop');
}
