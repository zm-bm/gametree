import { Middleware } from 'redux';

export const createWorkerMiddleware = (worker: Worker): Middleware => {
  const write = (cmd: string) => {
    console.log('< ', cmd);
    worker.postMessage(cmd);
  }

  const setPos = (fen: string) => {
    write(`position fen ${fen}`)
  }
  
  return (store) => (next) => (action: any) => {

    if (action.type === 'engine/TOGGLE_ENGINE') {
      const state = store.getState()

      let cmd = state.engine.running
        ? 'stop'
        : 'go inifinite';
      write(cmd)
    }

    if (action.type === 'common/MAKE_MOVE') {
      const state = store.getState()

      if (!state.engine.locked) {
        write('stop')
        setPos(action.payload.after)
        if (state.engine.running) {
          write('go infinite')
        }
      }
    }

    if (action.type === 'common/GOTO_MOVE') {
      const state = store.getState()

      if (!state.engine.locked) {
        write('stop')
        setPos(action.payload.fen)
        if (state.engine.running) {
          write('go infinite')
        }
      }
    }

    return next(action);
  };
};
