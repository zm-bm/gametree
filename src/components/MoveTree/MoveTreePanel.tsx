import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';

import { MoveTree } from './MoveTree';
import { ZoomProvider } from "../../contexts/ZoomProvider";
import { MoveTreeProvider } from '../../contexts/MoveTreeProvider';
import { DEFAULT_TRANSFORM } from './constants';

export const MoveTreePanel = () =>  {
  const { parentRef, width, height } = useParentSize();

  return (
    <MoveTreeProvider height={height} width={width}>
      <div ref={parentRef} className="w-full h-full relative overflow-hidden">
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          scaleXMin={1 / 8}
          scaleYMin={1 / 8}
          scaleXMax={4}
          scaleYMax={4}
          initialTransformMatrix={DEFAULT_TRANSFORM}
        >
          {zoom => (
            <ZoomProvider zoom={zoom}>
              <MoveTree />
            </ZoomProvider>
          )}
        </Zoom>
      </div>
    </MoveTreeProvider>
  );
}
