import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';
import { TransformMatrix } from '@visx/zoom/lib/types';
import { MoveTreeSvg } from './MoveTreeSvg';

export type ZoomState = {
  initialTransformMatrix: TransformMatrix;
  transformMatrix: TransformMatrix;
  isDragging: boolean;
};

export const defaultTransformMatrix: TransformMatrix = {
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  skewX: 0,
  skewY: 0,
};

export default function MoveTree() {
  const { parentRef, width, height } = useParentSize({
    initialSize: { width: 800, height: 600 },
  });

  return (
    <div
      ref={parentRef}
      className='w-full h-full border-l border-neutral-400 dark:border-neutral-500 overflow-hidden relative'
    >
      <Zoom<SVGSVGElement>
        width={width}
        height={height}
        scaleXMin={1 / 8}
        scaleYMin={1 / 8}
        scaleXMax={2}
        scaleYMax={2}
      >
        {(zoom) => (
          <MoveTreeSvg
            width={width}
            height={height}
            zoom={zoom}
          />
        )}
      </Zoom>
    </div>
  );
};

