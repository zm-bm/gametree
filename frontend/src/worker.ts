import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker'
import { store } from './store';
import { UCI_ENGINE_OUTPUT } from './features/engineSlice';

export const initializeWorker = () => {
  const worker = new Stockfish();

  worker.onmessage = (event) => {
    console.log('> ', event.data);
    store.dispatch(UCI_ENGINE_OUTPUT(event.data));
  };

  worker.onerror = (error) => {
    console.error('Worker error:', error);
    store.dispatch(UCI_ENGINE_OUTPUT(error.message));
  };

  worker.postMessage('uci')
  return worker;
};
