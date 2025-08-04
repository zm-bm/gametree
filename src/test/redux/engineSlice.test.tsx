import { describe, expect, it, vi } from "vitest";
import engineReducer, { AddEngineOutput, EngineError, EngineOutput, initialState, SetHash, SetLines, SetThreads, ToggleEngine, UpdateFen } from "../../redux/engineSlice";
import { Chess, DEFAULT_POSITION } from "chess.js";
import { SetDataSource } from "../../redux/treeSlice";

const chess = new Chess();
const d2d4 = chess.move('d2d4');
const d7d5 = chess.move('d7d5');
const runningState = { ...initialState, running: true };

describe('engineSlice', () => {
  it('updates fen on ToggleEngine on', () => {
    expect(engineReducer(initialState, ToggleEngine(d2d4.after))).toMatchObject({
      infos: [],
      fen: d2d4.after,
      running: true,
    });
  });

  it('does not update fen on ToggleEngine off', () => {
    expect(engineReducer(runningState, ToggleEngine(d2d4.after))).toMatchObject({
      fen: DEFAULT_POSITION,
      running: false,
    });
  });

  it('halves threads on OOM EngineErrors', () => {
    console.error = vi.fn();
    expect(engineReducer(initialState, EngineError('OOM'))).toMatchObject({
      threads: initialState.threads / 2,
    });
  });

  it('updates stats with AddEngineOutput', () => {
    const stats: EngineOutput = {
      time: 1,
      speed: 2,
      hashfull: 3,
      tbhits: 4, 
    };
    expect(engineReducer(initialState, AddEngineOutput(stats))).toMatchObject(stats);
  });

  it('updates stats and principal variation with AddEngineOutput', () => {
    const stats = {
      time: 1,
      speed: 2,
      hashfull: 3,
      tbhits: 4, 
    };
    const info = {
      depth: 5,
      seldepth: 6,
      cp: 7,
      mate: 8,
      multipv: 0,
      pv: [],
    };
    expect(engineReducer(initialState, AddEngineOutput({
      ...stats,
      info,
      moves: ['d2d4', 'd7d5'],
    }))).toMatchObject({
      ...stats,
      infos: [{ ...info, pv: [d2d4, d7d5] }],
    });
  });

  it('does not update fen on UpdateFen when not running', () => {
    expect(engineReducer(initialState, UpdateFen(d2d4.after))).toMatchObject({
      fen: initialState.fen,
    });
  });

  it('updates fen on UpdateFen when running', () => {
    expect(engineReducer(runningState, UpdateFen(d2d4.after))).toMatchObject({
      fen: d2d4.after,
    });
  });

  it('sets hash', () => {
    expect(engineReducer(initialState, SetHash(3))).toMatchObject({
      hash: 3
    });
  });

  it('sets threads', () => {
    expect(engineReducer(initialState, SetThreads(3))).toMatchObject({
      threads: 3
    });
  });

  it('sets lines', () => {
    expect(engineReducer(initialState, SetLines(3))).toMatchObject({
      lines: 3
    });
  });

  it('resets fen on SetDataSource', () => {
    expect(engineReducer({
      ...initialState,
      fen: d2d4.after,
    }, SetDataSource('lichess'))).toMatchObject({
      fen: DEFAULT_POSITION,
    });
  });
});
