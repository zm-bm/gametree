import { createContext } from "react";

type TreeDimensions = {
  height: number;
  width: number;
  columnWidth: number;
  rowHeight: number;
  fontSize: number;
  nodeRadius: number;
  nodeSize: [number, number];
};

export const TreeDimensionsContext = createContext<TreeDimensions>({
  width: 0,
  height: 0,
  nodeRadius: 0,
  rowHeight: 0,
  columnWidth: 0,
  fontSize: 0,
  nodeSize: [0, 0],
});
