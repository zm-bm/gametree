import { Middleware } from 'redux';
import { setOption, setPos } from '../helpers';
import { worker } from '../store'

export const createWorkerMiddleware = (): Middleware => {
  const write = (cmd: string) => {
    console.log('< ', cmd);
    worker.postMessage(cmd);
  }

  return (store) => (next) => (action: any) => {
    const state = store.getState()

    if (action.type === 'engine/TOGGLE_ENGINE') {
      let cmd = state.engine.running
        ? 'stop'
        : 'go inifinite';
      write(cmd)
    }

    if (action.type === 'engine/SET_HASH') {
      write(setOption('Hash', action.payload))
    }

    if (action.type === 'engine/SET_THREADS') {
      write(setOption('Threads', action.payload))
    }

    if (action.type === 'engine/SET_LINES') {
      write(setOption('MultiPV', action.payload))
    }

    if (action.type === 'common/MAKE_MOVE') {
      if (!state.engine.locked) {
        write('stop')
        write(setPos(action.payload.after))
        if (state.engine.running) {
          write('go infinite')
        }
      }
    }

    if (action.type === 'common/GOTO_MOVE') {
      if (!state.engine.locked) {
        write('stop')
        write(setPos(action.payload.fen))
        if (state.engine.running) {
          write('go infinite')
        }
      }
    }

    return next(action);
  };
};
