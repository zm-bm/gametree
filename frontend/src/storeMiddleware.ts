import { Middleware } from 'redux';

export const createWorkerMiddleware = (worker: Worker): Middleware => {
  return (store) => (next) => (action: any) => {
    if (action.type === 'engine/TOGGLE_ENGINE') {
      const state = store.getState()

      let message;
      if (state.engine.running) {
        message = 'stop';
      }
      else {
        message = `go depth 25`
      }
      console.log('< ', message);
      worker.postMessage(message);
    }
    return next(action);
  };
};
