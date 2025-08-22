import React, { useMemo }  from "react";
import { scaleLinear } from "@visx/scale";

import { MoveTreeContext } from "./MoveTreeContext";

const nodeScale = scaleLinear({
  domain: [360, 1440],
  range: [10, 24],
  clamp: true,
});

const columnScale = scaleLinear({
  domain: [360, 1440],
  range: [84, 220],
  clamp: true,
});

const fontScale = scaleLinear({
  domain: [360, 1440],
  range: [8, 16],
  clamp: true,
});

type MoveTreeProviderProps = {
  height: number;
  width: number;
  children: React.ReactNode;
};

export const MoveTreeProvider: React.FC<MoveTreeProviderProps> = ({
  height,
  width,
  children,
}) => {
  const dimensions = useMemo(() => {
    const minDimension = Math.min(height, width);
    const r = nodeScale(minDimension);
    return {
      width,
      height,
      nodeRadius: Math.round(r),
      rowHeight: Math.round(r * 2.4),
      columnWidth: Math.round(columnScale(minDimension)),
      fontSize: Math.round(fontScale(minDimension)),
    };
  }, [height, width]);
  
  return (
    <MoveTreeContext.Provider value={{ ...dimensions }}>
      {children}
    </MoveTreeContext.Provider>
  );
};
