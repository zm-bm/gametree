import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';

import { MoveTree } from './components/MoveTree';
import { ZoomProvider, MoveTreeProvider  } from "./context";

const zoomProps = {
  scaleXMin: 1 / 8,
  scaleYMin: 1 / 8,
  scaleXMax: 4,
  scaleYMax: 4,
  initialTransformMatrix: {
    translateX: 0,
    translateY: 0,
    scaleX: 2,
    scaleY: 2,
    skewX: 0,
    skewY: 0,
  }
};

const TreeView = () =>  {
  const { parentRef, width, height } = useParentSize();

  return (
    <div ref={parentRef} className="w-full h-full relative overflow-hidden">
      <MoveTreeProvider height={height} width={width}>
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          {...zoomProps}
        >
          {zoom => (
            <ZoomProvider zoom={zoom}>
              <MoveTree />
            </ZoomProvider>
          )}
        </Zoom>
      </MoveTreeProvider>
    </div>
  );
}

export default TreeView;
