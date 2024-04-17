export const createWorkerMiddleware = (worker: Worker) => {
  // @ts-expect-error
  return ({ dispatch }) => (next) => (action) => {
    if (action.type === 'SEND_TO_WORKER') {
      console.log('< ', action.payload);
      worker.postMessage(action.payload);
    }
    return next(action);
  };
};
