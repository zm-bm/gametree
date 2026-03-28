import { createSelector } from "@reduxjs/toolkit";
import { hierarchy } from "@visx/hierarchy";

import { RootState } from "@/store";
import { treeBuild } from "@/shared/types";

// UI selectors
export const selectUI = (s: RootState) => s.ui;
export const selectIsDarkMode = (s: RootState) => selectUI(s).isDarkMode;
export const selectCurrentId = (s: RootState) => selectUI(s).currentId;
export const selectHoverId = (s: RootState) => selectUI(s).hoverId;
export const selectBoardFen = (s: RootState) => selectUI(s).boardFen;
export const selectBoardOrientation = (s: RootState) => selectUI(s).boardOrientation;
export const selectBoardPromotionTarget = (s: RootState) => selectUI(s).boardPromotionTarget;
export const selectTreeSource = (s: RootState) => selectUI(s).treeSource;
export const selectTreeMinFrequencyPct = (s: RootState) => selectUI(s).treeMinFrequencyPct;
export const selectTreeMoveLimit = (s: RootState) => selectUI(s).treeMoveLimit;
export const selectTreeWinRateComparison = (s: RootState) => selectUI(s).treeWinRateComparison;
export const selectEngineRunning = (s: RootState) => selectUI(s).engineRunning;
export const selectEngineHash = (s: RootState) => selectUI(s).engineHash;
export const selectEngineThreads = (s: RootState) => selectUI(s).engineThreads;
export const selectEngineDepth = (s: RootState) => selectUI(s).engineDepth;
export const selectEngineTime = (s: RootState) => selectUI(s).engineTime

// Tree data selectors
export const selectTreeState = (s: RootState) => s.tree;
export const selectTreeNodeMap = (s: RootState) => selectTreeState(s).nodes;

// Engine data selectors
export const selectEngineData = (s: RootState) => s.engine;
export const selectEngineOutput = (s: RootState) => selectEngineData(s).output;

export const selectTreeRoot = createSelector(
  [
    selectTreeNodeMap,
    selectTreeMinFrequencyPct,
    selectTreeMoveLimit,
    selectTreeSource,
    selectCurrentId,
  ],
  (nodes, minFrequencyPct, moveLimit, source, currentId) => {
    const rootId = '';
    return treeBuild(nodes, rootId, minFrequencyPct, moveLimit, source, currentId);
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
  (nodes, nodeId) => {
    if (!nodes?.length) return null;

    const exactMatch = nodes.find((node) => node.data.id === nodeId);
    if (exactMatch) return exactMatch;

    let ancestorId = nodeId;
    while (ancestorId.includes(',')) {
      ancestorId = ancestorId.slice(0, ancestorId.lastIndexOf(','));
      const ancestorMatch = nodes.find((node) => node.data.id === ancestorId);
      if (ancestorMatch) return ancestorMatch;
    }

    return nodes.find((node) => node.data.id === '') || null;
  },
);

export const selectCurrentVisibleId = createSelector(
  [selectCurrentNode, selectCurrentId],
  (currentNode, currentId) => currentNode?.data.id || currentId,
);

export const selectCurrentNodeData = createSelector(
  [selectTreeNodeMap, selectCurrentId],
  (nodes, nodeId) => nodes[nodeId] || null
);

export const selectHoverNodeData = createSelector(
  [selectTreeNodeMap, selectHoverId],
  (nodes, hoverId) => (hoverId ? nodes[hoverId] || null : null)
);

export const selectCurrentMove = (s: RootState) => selectCurrentNodeData(s)?.move || null;
export const selectHoverMove = (s: RootState) => selectHoverNodeData(s)?.move || null;

export const selectSideToMove = createSelector(
  [selectBoardFen],
  (fen) => fen.split(' ')[1] === 'w' ? 'white' : 'black'
);

// export const selectEco = createSelector(
//   [selectMovePath],
//   (path) => getECO(path)
// );
