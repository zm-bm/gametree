import { PayloadAction as PA, createSlice } from '@reduxjs/toolkit';
import { Color } from 'chessground/types';
import { Square } from 'chess.js';

import { TreeSource, Id } from "../../shared/types";

const ui = createSlice({
  name: 'ui',
  initialState: {
    // tree id's
    currentId: '' as Id,
    hoverId: null as Id | null,
    // board state
    boardOrientation: 'white' as Color,
    boardPromotionTarget: null as Square[] | null,
    // tree state
    treeSource: 'lichess' as TreeSource,
    treeFrequencyMin: 2 as number,
    // engine state / options
    engineRunning: false as boolean,
    engineHash: 16 as number,
    engineThreads: 1 as number,
    engineDepth: 30 as number,
    engineTime: null as number | null,
  },
  reducers: {
    setCurrent: (s, a: PA<Id>) => { s.currentId = a.payload; },
    setHover: (s, a: PA<Id | null>) => { s.hoverId = a.payload; },
    toggleOrientation(state) { state.boardOrientation = state.boardOrientation === 'white' ? 'black' : 'white'; },
    setPromotionTarget(state, action: PA<Square[] | null>) { state.boardPromotionTarget = action.payload; },
    setTreeSource(state, action: PA<TreeSource>) { state.treeSource = action.payload; },
    setTreeFrequencyMin(state, action: PA<number>) { state.treeFrequencyMin = action.payload; },
    toggleEngine(state) { state.engineRunning = !state.engineRunning; },
    setEngineHash(state, action: PA<number>) { state.engineHash = action.payload; },
    setEngineThreads(state, action: PA<number>) { state.engineThreads = action.payload; },
  },
});

export default ui;
