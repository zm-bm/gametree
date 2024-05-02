import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';

import { MoveTreeSvg } from './MoveTreeSvg';

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
        scaleXMax={8}
        scaleYMax={8}
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
}
