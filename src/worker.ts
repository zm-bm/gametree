import 'stockfish/src/stockfish-nnue-16.wasm?init';
import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker'
import { store } from './store';
import { EngineState, EngineError, AddEngineOutput, EngineOutput } from './redux/engineSlice';
import { setOption } from './redux/engineMiddleware';

const match = (line: string, regex: { [Symbol.match](string: string): RegExpMatchArray | null; }) => {
  const match = line.match(regex);
  return match ? +match[1] : undefined;
}

const skipOutput = (line: string) => {
  return (
    !line.startsWith('info')
    || !line.includes(' pv ')
    || line.includes('upperbound')
    || line.includes('lowerbound')
  );
}

const parseEngineOutput = (line: string): EngineOutput | undefined => {
  if (skipOutput(line))
    return;

  const multipv = match(line, /multipv (\w+)/);
  const pv = line.substring(line.indexOf(" pv ") + 4);

  const result: EngineOutput = {
    time: match(line, /time (\w+)/),
    speed: match(line, /nps (\w+)/),
    hashfull: match(line, /hashfull (\w+)/),
    tbhits: match(line, /tbhits (\w+)/),
    multipv: multipv ? multipv - 1 : 0,
    depth: match(line, /depth (\w+)/) || 0,
    seldepth: match(line, /seldepth (\w+)/) || 0,
    cp: match(line, /score cp (-?\w+)/),
    mate: match(line, /score mate (-?\w+)/),
    pv: pv.match(/\b[a-h][1-8][a-h][1-8][qrnb]?\b/g) as string[],
  };

  return result;
}

export const initializeWorker = () => {
  const worker = new Stockfish();

  worker.onmessage = (event) => {
    // console.log('> ', event.data);
    const output = parseEngineOutput(event.data)
    if (output) {
      store.dispatch(AddEngineOutput(output));
    }
  };

  worker.onerror = (error) => {
    console.error('Worker error:', error);
    store.dispatch(EngineError(error.message));
  };

  return worker;
};

export const write = (cmd: string) => {
  // console.log('< ', cmd);
  worker.postMessage(cmd);
};

export const initEngineOptions = (state: EngineState) => {
  write('uci')
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

export let worker = initializeWorker();
