import { createContext } from "react";

type MoveTreeDimensions = {
  height: number;
  width: number;
  columnWidth: number;
  rowHeight: number;
  fontSize: number;
  nodeRadius: number;
};

export const MoveTreeContext = createContext<MoveTreeDimensions>({
  width: 0,
  height: 0,
  nodeRadius: 0,
  rowHeight: 0,
  columnWidth: 0,
  fontSize: 0,
});
