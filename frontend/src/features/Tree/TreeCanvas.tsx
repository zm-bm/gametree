import { Zoom } from '@visx/zoom';

import { TreeScene } from './components/TreeScene';
import { TreeDimensionsProvider, ZoomProvider } from './context';
import { useStableParentSize } from './hooks/useStableParentSize';
import { treeZoomConfig } from './lib/zoomConfig';

const TreeCanvas = () => {
  const { parentRef, width, height } = useStableParentSize();

  return (
    <div ref={parentRef} className="gt-treeview-canvas">
      <TreeDimensionsProvider height={height} width={width}>
        <Zoom<SVGSVGElement>
          width={width}
          height={height}
          {...treeZoomConfig}
        >
          {(zoom) => (
            <ZoomProvider zoom={zoom}>
              <TreeScene />
            </ZoomProvider>
          )}
        </Zoom>
      </TreeDimensionsProvider>
    </div>
  );
};

export default TreeCanvas;
