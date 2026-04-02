import React, { useEffect, useMemo, useRef } from "react";
import { scaleLinear } from "@visx/scale";

import { TreeDimensionsContext } from "./TreeDimensionsContext";
import { gametreeDebug } from "../../../shared/lib/gametreeDebug";

const nodeScale = scaleLinear({
  domain: [360, 1440],
  range: [15, 30],
  clamp: true,
});

const fontScale = scaleLinear({
  domain: [360, 1440],
  range: [8, 11],
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
  const lastDimensionsKeyRef = useRef<string>("");

  const dimensions = useMemo(() => {
    const minDimension = Math.min(height, width);
    const nodeRectSize = Math.round(nodeScale(minDimension) * 2);
    const nodeRadius = Math.round(nodeRectSize / 2);
    const treeRowSpacing = Math.round(nodeRadius * 2.3);
    const treeColumnSpacing = Math.round(nodeRadius * 6);

    return {
      width,
      height,
      nodeRadius,
      nodeRectSize,
      treeRowSpacing,
      treeColumnSpacing,
      treeNodeSpacing: [treeRowSpacing, treeColumnSpacing] as [number, number],
      fontSize: Math.round(fontScale(minDimension)),
    };
  }, [height, width]);

  useEffect(() => {
    const dimensionsKey = [
      dimensions.width,
      dimensions.height,
      dimensions.nodeRadius,
      dimensions.nodeRectSize,
      dimensions.treeRowSpacing,
      dimensions.treeColumnSpacing,
      dimensions.fontSize,
    ].join("|");

    if (dimensionsKey === lastDimensionsKeyRef.current) return;

    gametreeDebug("tree-size", "tree-dimensions-updated", {
      width,
      height,
      dimensions,
    });

    lastDimensionsKeyRef.current = dimensionsKey;
  }, [dimensions, height, width]);
  
  return (
    <TreeDimensionsContext.Provider value={{ ...dimensions }}>
      {children}
    </TreeDimensionsContext.Provider>
  );
};
