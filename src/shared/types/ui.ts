import { ProvidedZoom, TransformMatrix } from "@visx/zoom/lib/types";

export type ZoomState = {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
};

export type TreeZoom = ProvidedZoom<SVGSVGElement> & ZoomState;

export type NodeTooltipData = {
  white: number;
  draws: number;
  black: number;
  parent: number;
  rating?: number;
  eco?: string;
  name?: string;
};
