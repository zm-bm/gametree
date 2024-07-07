import 'stockfish/src/stockfish-nnue-16.wasm?init';
import Stockfish from 'stockfish/src/stockfish-nnue-16.js?worker'
import { store } from './store';
import { EngineState, EngineError, AddEngineOutput, EngineOutput } from './redux/engineSlice';
import { setOption } from './redux/engineMiddleware';

const match = (line: string, regex: { [Symbol.match](string: string): RegExpMatchArray | null; }) => {
  const match = line.match(regex);
  return match ? +match[1] : undefined;
}

const includeInfo = (line: string) => {
  return line.includes(' pv ')
    && !line.includes('upperbound')
    && !line.includes('lowerbound');
}

const parseMoves = (line: string) => {
  line = line.substring(line.indexOf(" pv ") + 4);
  // Match chess moves including promotions (e.g. e2e4, e7e8q)
  const moveRegex = /\b[a-h][1-8][a-h][1-8][qrnb]?\b/g;
  return line.match(moveRegex) as string[];
}

const parseEngineOutput = (line: string): EngineOutput | undefined => {
  const tokens = line.split(' ');

  if (tokens[0] === 'info') {
    const result = {
      time: match(line, /time (\w+)/),
      speed: match(line, /nps (\w+)/),
      hashfull: match(line, /hashfull (\w+)/),
      tbhits: match(line, /tbhits (\w+)/),
    };
    let info = undefined;
    let moves = undefined;

    if (includeInfo(line)) {
      const multipv = match(line, /multipv (\w+)/);
      info = {
        depth: match(line, /depth (\w+)/) || 0,
        seldepth: match(line, /seldepth (\w+)/) || 0,
        cp: match(line, /score cp (-?\w+)/),
        mate: match(line, /score mate (-?\w+)/),
        multipv: multipv ? multipv - 1 : 0,
        pv: [],
      }
      moves = parseMoves(line);
    }

    return {
      ...result,
      info,
      moves,
    }
  }
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
