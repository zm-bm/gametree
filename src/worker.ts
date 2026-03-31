import 'stockfish/bin/stockfish-18-lite.wasm?init';
import Stockfish from 'stockfish/bin/stockfish-18-lite.js?worker'

import { store } from './store';
import { engine } from './store/slices';
import { gametreeDebug, gametreeDebugWarn } from './shared/lib/gametreeDebug';
import {
  selectBoardFen,
  selectEngineDepth,
  selectEngineHash,
  selectEngineTime
} from './store/selectors';

let engineWorker: Worker | null = null;
let isEngineReady = false;
let startRequested = false;
const workerScope = 'worker';

const sendUciCommand = (worker: Worker, command: string) => {
  gametreeDebug(workerScope, 'uci ->', command);
  worker.postMessage(command);
};

const initializeWorkerIfNeeded = (): Worker | null => {
  if (typeof Worker === 'undefined') {
    gametreeDebugWarn(workerScope, 'Worker API unavailable; engine disabled in this environment');
    return null;
  }

  if (engineWorker) {
    return engineWorker;
  }

  engineWorker = new Stockfish();
  engineWorker.onmessage = handleWorkerMessage;
  engineWorker.onerror = handleWorkerError;
  sendUciCommand(engineWorker, 'uci');
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
  const depth = selectEngineDepth(state);
  const time = selectEngineTime(state);

  sendUciCommand(engineWorker, 'stop');
  sendUciCommand(engineWorker, `setoption name Hash value ${hash}`);
  // sendUciCommand(engineWorker, 'setoption name Threads value 1');
  sendUciCommand(engineWorker, `position fen ${fen}`);
  sendUciCommand(engineWorker, buildGoCommand(depth, time));
};

const handleWorkerMessage = (event: MessageEvent) => {
  if (typeof event.data !== 'string') {
    return;
  }

  const line = event.data;
  gametreeDebug(workerScope, 'uci <-', line);

  if (line === 'uciok') {
    if (engineWorker) {
      sendUciCommand(engineWorker, 'isready');
    }
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
  gametreeDebugWarn(workerScope, 'worker error', error.message);
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
    sendUciCommand(worker, 'isready');
    return;
  }

  runSearch();
}

export const stopEngine = () => {
  startRequested = false;
  if (engineWorker) {
    sendUciCommand(engineWorker, 'stop');
  }
}
