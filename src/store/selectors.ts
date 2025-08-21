import { createSelector } from "@reduxjs/toolkit";
import { DEFAULT_POSITION } from 'chess.js';

import { RootState } from ".";
import { buildTree } from "../lib/tree";
import { hierarchy } from "@visx/hierarchy";

// UI selectors
export const selectUI = (s: RootState) => s.ui;
export const selectCurrentId = (s: RootState) => selectUI(s).currentId;
export const selectHoverId = (s: RootState) => selectUI(s).hoverId;
export const selectBoardOrientation = (s: RootState) => selectUI(s).boardOrientation;
export const selectBoardPromotionTarget = (s: RootState) => selectUI(s).boardPromotionTarget;
export const selectTreeSource = (s: RootState) => selectUI(s).treeSource;
export const selectTreeFrequencyMin = (s: RootState) => selectUI(s).treeFrequencyMin;
export const selectEngineRunning = (s: RootState) => selectUI(s).engineRunning;
export const selectEngineHash = (s: RootState) => selectUI(s).engineHash;
export const selectEngineThreads = (s: RootState) => selectUI(s).engineThreads;
export const selectEngineDepth = (s: RootState) => selectUI(s).engineDepth;
export const selectEngineTime = (s: RootState) => selectUI(s).engineTime

// Tree data selectors
export const selectTreeData = (s: RootState) => s.tree;
export const selectLichessNodes = (s: RootState) => selectTreeData(s).lichessNodes;
export const selectMastersNodes = (s: RootState) => selectTreeData(s).mastersNodes;

// Engine data selectors
export const selectEngineData = (s: RootState) => s.engine;
export const selectEngineOutput = (s: RootState) => selectEngineData(s).output;

export const selectTreeDataNodes = createSelector(
  [selectLichessNodes, selectMastersNodes, selectTreeSource],
  (lichessNodes, mastersNodes, source) => {
    return source === 'lichess' ? lichessNodes : mastersNodes;
  }
)

export const selectTreeRoot = createSelector(
  [selectTreeDataNodes, selectTreeFrequencyMin],
  (nodes, frequencyMin) => {
    const rootId = '';
    return buildTree(nodes, rootId, frequencyMin);
  }
);

export const selectTree = createSelector(
  [selectTreeRoot],
  (root) => root ? hierarchy(root) : null
);

export const selectTreeNodes = createSelector(
  [selectTree],
  (tree) => tree ? tree.descendants() : null
);

export const selectCurrentNode = createSelector(
  [selectTreeNodes, selectCurrentId],
  (nodes, nodeId) => nodes ? nodes.find(node => node.data.id === nodeId) : null,
);

export const selectCurrentNodeData = createSelector(
  [selectTreeDataNodes, selectCurrentId],
  (nodes, nodeId) => nodes[nodeId] || null
);

export const selectCurrentMove = createSelector(
  [selectCurrentNodeData],
  (node) => node?.move || null
);

export const selectCurrentFen = createSelector(
  [selectCurrentMove],
  (move) => move?.after || DEFAULT_POSITION,
);

export const selectSideToMove = createSelector(
  [selectCurrentFen],
  (fen) => fen.split(' ')[1] === 'w' ? 'white' : 'black'
);

// export const selectEco = createSelector(
//   [selectMovePath],
//   (path) => getECO(path)
// );
