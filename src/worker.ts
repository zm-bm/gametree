import 'stockfish/bin/stockfish-18-lite.wasm?init';
import Stockfish from 'stockfish/bin/stockfish-18-lite.js?worker'

import { store } from './store';
import { engine } from './store/slices';
import {
  selectBoardFen,
  selectEngineDepth,
  selectEngineHash,
  selectEngineThreads,
  selectEngineTime
} from './store/selectors';

let engineWorker: Worker | null = null;
let isEngineReady = false;
let startRequested = false;

const initializeWorkerIfNeeded = (): Worker | null => {
  if (typeof Worker === 'undefined') {
    return null;
  }

  if (engineWorker) {
    return engineWorker;
  }

  engineWorker = new Stockfish();
  engineWorker.onmessage = handleWorkerMessage;
  engineWorker.onerror = handleWorkerError;
  engineWorker.postMessage('uci');
  return engineWorker;
};

const isEngineInfo = (line: string) => {
  return (
    line.startsWith('info')
    && line.includes(' pv ')
    && !line.includes('upperbound')
    && !line.includes('lowerbound')
  );
}

const buildGoCommand = (depth: number, time: number | null) => {
  if (typeof time === 'number' && Number.isFinite(time) && time > 0) {
    return `go depth ${depth} movetime ${Math.round(time)}`;
  }

  return `go depth ${depth}`;
};

const runSearch = () => {
  if (!engineWorker || !isEngineReady) {
    return;
  }

  const state = store.getState();
  const fen = selectBoardFen(state);
  const hash = selectEngineHash(state);
  const threads = selectEngineThreads(state);
  const depth = selectEngineDepth(state);
  const time = selectEngineTime(state);

  engineWorker.postMessage('stop');
  engineWorker.postMessage(`setoption name Hash value ${hash}`);
  engineWorker.postMessage(`setoption name Threads value ${threads}`);
  engineWorker.postMessage(`position fen ${fen}`);
  engineWorker.postMessage(buildGoCommand(depth, time));
};

const handleWorkerMessage = (event: MessageEvent) => {
  if (typeof event.data !== 'string') {
    return;
  }

  const line = event.data;

  if (line === 'uciok') {
    engineWorker?.postMessage('isready');
    return;
  }

  if (line === 'readyok') {
    isEngineReady = true;
    if (startRequested) {
      runSearch();
    }
    return;
  }

  if (isEngineInfo(line)) {
    store.dispatch(engine.actions.reportEngineOutput(line));
  }
};

const handleWorkerError = (error: ErrorEvent) => {
  store.dispatch(engine.actions.reportEngineError(error.message));
};

export const initializeEngine = () => {
  initializeWorkerIfNeeded();
};

export const startEngine = () => {
  const worker = initializeWorkerIfNeeded();
  if (!worker) {
    return;
  }

  startRequested = true;
  if (!isEngineReady) {
    worker.postMessage('isready');
    return;
  }

  runSearch();
}

export const stopEngine = () => {
  startRequested = false;
  engineWorker?.postMessage('stop');
}
