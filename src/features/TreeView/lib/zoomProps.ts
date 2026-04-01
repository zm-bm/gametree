import { WheelEvent as ReactWheelEvent } from "react";

export const treeZoomProps = {
  scaleXMin: 1 / 2,
  scaleYMin: 1 / 2,
  scaleXMax: 4,
  scaleYMax: 4,
  wheelDelta: (event: WheelEvent | ReactWheelEvent) => {
    const direction = -event.deltaY > 0 ? 1 : -1;
    const step = 0.06;
    const factor = direction > 0 ? 1 + step : 1 - step;

    return {
      scaleX: factor,
      scaleY: factor,
    };
  },
  initialTransformMatrix: {
    translateX: 0,
    translateY: 0,
    scaleX: 2,
    scaleY: 2,
    skewX: 0,
    skewY: 0,
  },
};
