import React, { useMemo }  from "react";
import { scaleLinear } from "@visx/scale";

import { TreeDimensionsContext } from "./TreeDimensionsContext";

const nodeScale = scaleLinear({
  domain: [360, 1440],
  range: [10, 24],
  clamp: true,
});

const fontScale = scaleLinear({
  domain: [360, 1440],
  range: [8, 16],
  clamp: true,
});

type TreeDimensionsProviderProps = {
  height: number;
  width: number;
  children: React.ReactNode;
};

export const TreeDimensionsProvider: React.FC<TreeDimensionsProviderProps> = ({
  height,
  width,
  children,
}) => {
  const dimensions = useMemo(() => {
    const minDimension = Math.min(height, width);
    const r = nodeScale(minDimension);
    const rowHeight = Math.round(r * 2.4);
    const columnWidth = Math.round(r * 8);

    return {
      width,
      height,
      nodeRadius: Math.round(r),
      rowHeight,
      columnWidth,
      nodeSize: [rowHeight, columnWidth] as [number, number],
      fontSize: Math.round(fontScale(minDimension)),
    };
  }, [height, width]);
  
  return (
    <TreeDimensionsContext.Provider value={{ ...dimensions }}>
      {children}
    </TreeDimensionsContext.Provider>
  );
};
