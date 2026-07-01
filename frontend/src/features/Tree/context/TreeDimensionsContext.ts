import { createContext } from "react";

type TreeDimensions = {
  height: number;
  width: number;
  treeColumnSpacing: number;
  treeRowSpacing: number;
  treeNodeSpacing: [number, number];
  nodeRectSize: number;
  fontSize: number;
  nodeRadius: number;
};

export const TreeDimensionsContext = createContext<TreeDimensions>({
  width: 0,
  height: 0,
  nodeRadius: 0,
  treeRowSpacing: 0,
  treeColumnSpacing: 0,
  treeNodeSpacing: [0, 0],
  nodeRectSize: 0,
  fontSize: 0,
});
