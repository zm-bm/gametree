import { TransformMatrix } from "@visx/zoom/lib/types";

export type ZoomState = {
    initialTransformMatrix: TransformMatrix;
    transformMatrix: TransformMatrix;
    isDragging: boolean;
};
