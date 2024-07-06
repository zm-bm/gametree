import { createContext } from "react";

interface TreeDims {
    height: number;
    width: number;
    columnWidth: number;
    rowHeight: number;
    fontSize: number;
    nodeRadius: number;
}

export const TreeDimsContext = createContext<TreeDims>({
    width: 0,
    height: 0,
    nodeRadius: 0,
    rowHeight: 0,
    columnWidth: 0,
    fontSize: 0,
});
