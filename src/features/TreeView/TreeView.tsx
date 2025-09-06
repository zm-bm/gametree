import { useParentSize } from '@visx/responsive';
import { Zoom } from '@visx/zoom';

import { Tree } from './components/Tree';
import { ZoomProvider, TreeDimensionsProvider  } from "./context";

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
      <TreeDimensionsProvider height={height} width={width}>
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          {...zoomProps}
        >
          {zoom => (
            <ZoomProvider zoom={zoom}>
              <Tree />
            </ZoomProvider>
          )}
        </Zoom>
      </TreeDimensionsProvider>
    </div>
  );
}

export default TreeView;
