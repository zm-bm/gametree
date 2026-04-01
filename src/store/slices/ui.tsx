import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';
import { Color } from 'chessground/types';
import { DEFAULT_POSITION, Square } from 'chess.js';

import { TreeSource, TreeWinRateComparison, Id } from "../../shared/types";

const ui = createSlice({
  name: 'ui',
  initialState: {
    // general UI state
    isDarkMode: false as boolean,
    // tree id's
    currentId: '' as Id,
    hoverId: null as Id | null,
    // board state
    boardFen: DEFAULT_POSITION as string,
    boardOrientation: 'white' as Color,
    boardPromotionTarget: null as Square[] | null,
    // tree state
    treeSource: 'otb' as TreeSource,
    treeMinFrequencyPct: 2 as number,
    treeMoveLimit: 8 as number,
    treeWinRateComparison: 'relative' as TreeWinRateComparison,
    // engine state / options
    engineRunning: false as boolean,
    engineHash: 32 as number,
    engineThreads: 1 as number,
    engineDepth: 30 as number,
    engineTime: null as number | null,
  },
  reducers: {
    setCurrent: (s, a: PA<Id>) => { s.currentId = a.payload; },
    setHover: (s, a: PA<Id | null>) => { s.hoverId = a.payload; },
    setFen: (s, a: PA<string>) => { s.boardFen = a.payload; },
    toggleOrientation(state) { state.boardOrientation = state.boardOrientation === 'white' ? 'black' : 'white'; },
    setPromotionTarget(state, action: PA<Square[] | null>) { state.boardPromotionTarget = action.payload; },
    setIsDarkMode(state, action: PA<boolean>) { state.isDarkMode = action.payload; },
    setTreeSource(state, action: PA<TreeSource>) { state.treeSource = action.payload; },
    setTreeMinFrequencyPct(state, action: PA<number>) { state.treeMinFrequencyPct = action.payload; },
    setTreeMoveLimit(state, action: PA<number>) { state.treeMoveLimit = action.payload; },
    setTreeWinRateComparison(state, action: PA<TreeWinRateComparison>) { state.treeWinRateComparison = action.payload; },
    toggleEngine(state) { state.engineRunning = !state.engineRunning; },
    setEngineRunning(state, action: PA<boolean>) { state.engineRunning = action.payload; },
    setEngineHash(state, action: PA<number>) { state.engineHash = action.payload; },
    setEngineThreads(state, action: PA<number>) { state.engineThreads = action.payload; },
  },
});

export default ui;
